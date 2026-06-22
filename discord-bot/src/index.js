import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';

const API = 'https://discord.com/api/v10';
const VIEW_CHANNEL = '1024';
const SEND_MESSAGES = '2048';
const READ_MESSAGE_HISTORY = '65536';
const CHANNEL_ALLOW = String(Number(VIEW_CHANNEL) + Number(SEND_MESSAGES) + Number(READ_MESSAGE_HISTORY));

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json;charset=UTF-8' }
  });
}

function corsJson(env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'access-control-allow-origin': new URL(env.SITE_URL).origin,
      'access-control-allow-headers': 'authorization,content-type',
      'access-control-allow-methods': 'POST,OPTIONS',
      'cache-control': 'no-store'
    }
  });
}

function accessDenied() {
  return new Response(`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Acces reserve</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#050b16;color:#eef3fb;font-family:Arial,sans-serif}.box{max-width:520px;padding:32px;text-align:center}h1{font-size:28px}p{color:#aab7ca;line-height:1.6}a{display:inline-block;margin-top:14px;padding:13px 18px;background:#d98a00;color:#111;text-decoration:none;font-weight:700;border-radius:6px}</style><div class="box"><h1>Acces reserve aux candidats</h1><p>Ouvre un ticket de recrutement sur Discord pour recevoir ton lien personnel vers le questionnaire.</p><a href="https://discord.gg/KsSmxnNKWV">Ouvrir Discord</a></div></html>`, {
    status: 403,
    headers: { 'content-type': 'text/html;charset=UTF-8', 'cache-control': 'no-store' }
  });
}

async function discord(env, path, init = {}) {
  const response = await fetch(API + path, {
    ...init,
    headers: {
      authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      'content-type': 'application/json',
      ...(init.headers || {})
    }
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Discord ${response.status}: ${message}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function getTicketAccess(env, token) {
  if (!token) return null;
  return env.TICKET_ACCESS.get(`token:${token}`, 'json');
}

async function serveRecruitment(env, url) {
  const token = url.searchParams.get('token');
  const access = await getTicketAccess(env, token);
  if (!access) return accessDenied();

  const upstream = await fetch(`${env.SITE_URL}/recrutement.html`, {
    headers: { 'cache-control': 'no-cache' }
  });
  let html = await upstream.text();
  const apiUrl = `${url.origin}/api?token=${encodeURIComponent(token)}`;
  html = html
    .replace('<head>', `<head>\n<base href="${env.SITE_URL}/"><style>.site-header{display:none!important}body{padding-top:0!important}</style>`)
    .replace('<script src="config.js"></script>', `<script>window.SASP_API_URL=${JSON.stringify(apiUrl)};</script>`);

  return new Response(html, {
    headers: { 'content-type': 'text/html;charset=UTF-8', 'cache-control': 'no-store' }
  });
}

async function sendQcmRecap(env, access, payload, applicationId) {
  const answers = payload.qcm || {};
  const scores = payload.scores || {};
  const fields = ['q1','q2','q3','q4','q5','q6'].map((key, index) => ({
    name: `Question ${index + 1}`,
    value: String(answers[key] || 'Aucune réponse').slice(0, 1000),
    inline: false
  }));
  await discord(env, `/channels/${access.channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: `<@${access.userId}> <@&${env.RECRUITMENT_PING_ROLE_ID}>`,
      allowed_mentions: { parse: [], users: [access.userId], roles: [env.RECRUITMENT_PING_ROLE_ID] },
      embeds: [{
        title: 'QCM terminé — Récapitulatif',
        description: `**Candidat :** ${String(payload.prenomRP || '')} ${String(payload.nomRP || '')}\n**Score global :** ${scores.global ?? '-'} / 100\n**Référence :** #${applicationId}`,
        color: 0xD99A32,
        fields,
        footer: { text: 'Le lien du QCM est maintenant désactivé' },
        timestamp: new Date().toISOString()
      }]
    })
  });
}

async function processApplicationSubmission(env, token, access, payload) {
  const encoded = new URLSearchParams();
  encoded.set('payload', JSON.stringify(payload));
  const upstream = await fetch(env.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: encoded.toString(),
    redirect: 'follow'
  });
  const responseText = await upstream.text();
  let linkedApplicationId = '';
  try {
    const result = JSON.parse(responseText);
    if (result.success && result.id) linkedApplicationId = String(result.id);
  } catch (error) {
    console.error('Réponse Apps Script non JSON', error);
  }
  if (!linkedApplicationId) {
    const listUrl = new URL(env.APPS_SCRIPT_URL);
    listUrl.searchParams.set('action', 'list');
    const listResponse = await fetch(listUrl, { redirect: 'follow' });
    const listResult = await listResponse.json();
    const latest = (listResult.data || []).find(application =>
      String(application.pseudoDiscord || '') === String(payload.pseudoDiscord || '') &&
      String(application.nomRP || '') === String(payload.nomRP || '') &&
      String(application.prenomRP || '') === String(payload.prenomRP || '')
    );
    if (latest?.id) linkedApplicationId = String(latest.id);
  }
  if (!linkedApplicationId) throw new Error('Candidature introuvable après envoi');

  await env.TICKET_ACCESS.put(`application:${linkedApplicationId}`, JSON.stringify(access), { expirationTtl: 90 * 24 * 60 * 60 });
  if (!await env.TICKET_ACCESS.get(`qcm-completed:${access.channelId}`)) {
    await sendQcmRecap(env, access, payload, linkedApplicationId);
    await Promise.all([
      env.TICKET_ACCESS.put(`qcm-completed:${access.channelId}`, linkedApplicationId, { expirationTtl: 90 * 24 * 60 * 60 }),
      env.TICKET_ACCESS.delete(`token:${token}`),
      env.TICKET_ACCESS.delete(`channel:${access.channelId}`)
    ]);
  }
}

async function proxyAppsScript(request, env, url, ctx) {
  const token = url.searchParams.get('token');
  const access = await getTicketAccess(env, token);
  if (!access) return json({ success: false, error: 'Acces candidat expire' }, 403);

  if (request.method === 'POST') {
    const form = await request.formData();
    const payload = JSON.parse(String(form.get('payload') || '{}'));
    payload.discordUserId = access.userId;
    payload.discordChannelId = access.channelId;
    ctx.waitUntil(processApplicationSubmission(env, token, access, payload));
    return json({ success: true, id: 'QCM' }, 202);
  }

  const target = new URL(env.APPS_SCRIPT_URL);
  for (const [key, value] of url.searchParams) {
    if (key !== 'token') target.searchParams.append(key, value);
  }
  let body;
  let submittedPayload = null;
  if (request.method !== 'GET') {
    const form = await request.formData();
    const payload = JSON.parse(String(form.get('payload') || '{}'));
    payload.discordUserId = access.userId;
    payload.discordChannelId = access.channelId;
    const encoded = new URLSearchParams();
    encoded.set('payload', JSON.stringify(payload));
    body = encoded.toString();
    submittedPayload = payload;
  }
  const upstream = await fetch(target, {
    method: request.method,
    headers: request.method === 'GET' ? {} : { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body,
    redirect: 'follow'
  });
  const responseText = await upstream.text();
  if (request.method !== 'GET') {
    let linkedApplicationId = '';
    try {
      const result = JSON.parse(responseText);
      if (result.success && result.id) {
        linkedApplicationId = String(result.id);
      }
    } catch (error) {
      console.error('Impossible de lier la candidature au ticket', error);
    }
    if (!linkedApplicationId && submittedPayload) {
      const listUrl = new URL(env.APPS_SCRIPT_URL);
      listUrl.searchParams.set('action', 'list');
      const listResponse = await fetch(listUrl, { redirect: 'follow' });
      const listResult = await listResponse.json();
      const latest = (listResult.data || []).find(application =>
        String(application.pseudoDiscord || '') === String(submittedPayload.pseudoDiscord || '') &&
        String(application.nomRP || '') === String(submittedPayload.nomRP || '') &&
        String(application.prenomRP || '') === String(submittedPayload.prenomRP || '')
      );
      if (latest?.id) linkedApplicationId = String(latest.id);
    }
    if (linkedApplicationId) {
      await env.TICKET_ACCESS.put(`application:${linkedApplicationId}`, JSON.stringify(access), { expirationTtl: 90 * 24 * 60 * 60 });
      if (!await env.TICKET_ACCESS.get(`qcm-completed:${access.channelId}`)) {
        await sendQcmRecap(env, access, submittedPayload || {}, linkedApplicationId);
        await Promise.all([
          env.TICKET_ACCESS.put(`qcm-completed:${access.channelId}`, linkedApplicationId, { expirationTtl: 90 * 24 * 60 * 60 }),
          env.TICKET_ACCESS.delete(`token:${token}`),
          env.TICKET_ACCESS.delete(`channel:${access.channelId}`)
        ]);
      }
    }
  }
  return new Response(responseText, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'text/plain;charset=UTF-8',
      'cache-control': 'no-store'
    }
  });
}

async function adminLogin(request, env) {
  const body = await request.json();
  const target = new URL(env.APPS_SCRIPT_URL);
  target.searchParams.set('action', 'auth');
  target.searchParams.set('username', String(body.username || ''));
  target.searchParams.set('password', String(body.password || ''));
  const response = await fetch(target, { redirect: 'follow' });
  const result = await response.json();
  if (!result.valid) return corsJson(env, { success: false, error: 'Identifiants incorrects' }, 401);

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  await env.TICKET_ACCESS.put(`admin-session:${token}`, '1', { expirationTtl: 8 * 60 * 60 });
  return corsJson(env, { success: true, token });
}

async function requireAdmin(request, env) {
  const authorization = String(request.headers.get('authorization') || '');
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token || !await env.TICKET_ACCESS.get(`admin-session:${token}`)) return false;
  return true;
}

async function applicationDecision(request, env) {
  if (!await requireAdmin(request, env)) {
    return corsJson(env, { success: false, error: 'Session administrateur expirée' }, 401);
  }

  const body = await request.json();
  const id = String(body.id || '');
  const status = String(body.status || '');
  if (!id || !['Acceptée', 'Refusée'].includes(status)) {
    return corsJson(env, { success: false, error: 'Décision invalide' }, 400);
  }

  const ticket = await env.TICKET_ACCESS.get(`application:${id}`, 'json');
  if (!ticket?.channelId || !ticket?.userId) {
    return corsJson(env, { success: false, error: 'Aucun ticket lié à cette candidature. Demande au candidat de soumettre depuis son nouveau lien privé.' }, 409);
  }

  const accepted = status === 'Acceptée';
  const description = accepted
    ? 'Ta candidature est acceptée. Le service recrutement te communiquera la suite directement dans ce ticket.'
    : 'Ta candidature n’est pas retenue cette fois-ci. Tu pourras déposer une nouvelle candidature dans **24 heures**.';
  await discord(env, `/channels/${ticket.channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: `<@${ticket.userId}>`,
      allowed_mentions: { parse: [], users: [ticket.userId] },
      embeds: [{
        title: accepted ? 'Candidature acceptée' : 'Candidature refusée',
        description,
        color: accepted ? 0x22C55E : 0xEF4444,
        footer: { text: 'BCSO • Service recrutement' },
        timestamp: new Date().toISOString()
      }]
    })
  });

  const statusUrl = new URL(env.APPS_SCRIPT_URL);
  statusUrl.searchParams.set('action', 'status');
  statusUrl.searchParams.set('id', id);
  statusUrl.searchParams.set('status', status);
  const statusResponse = await fetch(statusUrl, { redirect: 'follow' });
  const statusResult = await statusResponse.json();
  if (!statusResult.success) return corsJson(env, statusResult, 502);

  if (!accepted) {
    await env.TICKET_ACCESS.put(`recruitment-cooldown:${ticket.userId}`, String(Date.now() + 24 * 60 * 60 * 1000), { expirationTtl: 24 * 60 * 60 });
  }
  const accessToken = await env.TICKET_ACCESS.get(`channel:${ticket.channelId}`);
  if (accessToken) {
    await Promise.all([
      env.TICKET_ACCESS.delete(`token:${accessToken}`),
      env.TICKET_ACCESS.delete(`channel:${ticket.channelId}`)
    ]);
  }
  return corsJson(env, { success: true });
}

function safeChannelName(username) {
  return String(username || 'candidat')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 45) || 'candidat';
}

function ticketConfig(env, type) {
  const supportRoles = [env.SUPPORT_ROLE_1_ID, env.SUPPORT_ROLE_2_ID];
  const configs = {
    recruitment: {
      prefix: 'recrutement',
      title: 'Recrutement BCSO',
      description: 'Le service recrutement lancera ton QCM lorsque tu seras prêt sur place.',
      categoryId: env.RECRUITMENT_CATEGORY_ID,
      staffRoleIds: [env.STAFF_ROLE_ID, env.RECRUITMENT_PING_ROLE_ID]
    },
    liaison: {
      prefix: 'liaison',
      title: 'Demande de liaison',
      description: 'Contacte le BCSO au sujet d’une liaison officielle ou interservice.',
      categoryId: env.LIAISON_CATEGORY_ID,
      staffRoleIds: supportRoles
    },
    information: {
      prefix: 'information',
      title: 'Demande d’information',
      description: 'Pose une question ou demande un renseignement à l’équipe du SASP Nord.',
      categoryId: env.INFORMATION_CATEGORY_ID,
      staffRoleIds: supportRoles
    },
    divers: {
      prefix: 'divers',
      title: 'Demande diverse',
      description: 'Pour toute demande qui ne correspond pas aux autres catégories.',
      categoryId: env.DIVERS_CATEGORY_ID,
      staffRoleIds: supportRoles
    }
  };
  return configs[type] || null;
}

async function findOpenTicket(env, userId) {
  const channels = await discord(env, `/guilds/${env.DISCORD_GUILD_ID}/channels`);
  return channels.find(channel =>
    channel.topic === `sasp-recruitment-user:${userId}` ||
    (String(channel.topic || '').startsWith('sasp-ticket:') && String(channel.topic).endsWith(`:${userId}`))
  );
}

async function findOpenTickets(env, userId) {
  const channels = await discord(env, `/guilds/${env.DISCORD_GUILD_ID}/channels`);
  return channels.filter(channel =>
    channel.topic === `sasp-recruitment-user:${userId}` ||
    (String(channel.topic || '').startsWith('sasp-ticket:') && String(channel.topic).endsWith(`:${userId}`))
  );
}

async function addCandidateRole(env, userId) {
  return discord(env, `/guilds/${env.DISCORD_GUILD_ID}/members/${userId}/roles/${env.CANDIDATE_ROLE_ID}`, {
    method: 'PUT'
  });
}

async function removeCandidateRole(env, userId) {
  return discord(env, `/guilds/${env.DISCORD_GUILD_ID}/members/${userId}/roles/${env.CANDIDATE_ROLE_ID}`, {
    method: 'DELETE'
  });
}

async function createTicket(env, interaction, origin) {
  const user = interaction.member.user;
  const openTickets = await findOpenTickets(env, user.id);
  if (openTickets.length >= 5) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Tu as déjà 5 tickets ouverts. Ferme un ticket avant d’en créer un autre.', flags: 64 }
    };
  }

  await addCandidateRole(env, user.id);
  const channel = await discord(env, `/guilds/${env.DISCORD_GUILD_ID}/channels`, {
    method: 'POST',
    body: JSON.stringify({
      name: `recrutement-${safeChannelName(user.username)}`,
      type: 0,
      parent_id: env.RECRUITMENT_CATEGORY_ID,
      topic: `sasp-recruitment-user:${user.id}`,
      permission_overwrites: [
        { id: env.DISCORD_GUILD_ID, type: 0, deny: VIEW_CHANNEL, allow: '0' },
        { id: user.id, type: 1, allow: CHANNEL_ALLOW, deny: '0' },
        { id: env.STAFF_ROLE_ID, type: 0, allow: CHANNEL_ALLOW, deny: '0' },
        { id: env.DISCORD_APPLICATION_ID, type: 1, allow: CHANNEL_ALLOW, deny: '0' }
      ]
    })
  });

  const token = crypto.randomUUID().replace(/-/g, '');
  const ttl = 7 * 24 * 60 * 60;
  await Promise.all([
    env.TICKET_ACCESS.put(`token:${token}`, JSON.stringify({ userId: user.id, channelId: channel.id }), { expirationTtl: ttl }),
    env.TICKET_ACCESS.put(`channel:${channel.id}`, token, { expirationTtl: ttl })
  ]);

  await discord(env, `/channels/${channel.id}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: `<@${user.id}> bienvenue dans ton ticket de Recrutement BCSO.`,
      embeds: [{
        title: 'Recrutement BCSO',
        description: 'Utilise le bouton ci-dessous pour accéder au test. Ton accès restera actif tant que ce ticket est ouvert.',
        color: 0xD99A32
      }],
      components: [{
        type: 1,
        components: [
          { type: 2, style: 5, label: 'Accéder au test', url: `${origin}/recrutement?token=${token}` },
          { type: 2, style: 4, label: 'Fermer le ticket', custom_id: 'close_recruitment_ticket' }
        ]
      }]
    })
  });

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: `Ton ticket a été créé : <#${channel.id}>`, flags: 64 }
  };
}

async function resetPanelSelection(env, interaction) {
  if (!interaction.message?.id || !interaction.channel_id) return;
  const components = structuredClone(interaction.message.components || []);
  for (const row of components) {
    for (const component of row.components || []) {
      for (const option of component.options || []) delete option.default;
    }
  }
  await discord(env, `/channels/${interaction.channel_id}/messages/${interaction.message.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ components })
  });
}

async function createPanelTicket(env, interaction, origin, type) {
  const user = interaction.member.user;
  const config = ticketConfig(env, type);
  if (!config) {
    await resetPanelSelection(env, interaction);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Type de ticket inconnu.', flags: 64 }
    };
  }

  if (type === 'recruitment') {
    const cooldownUntil = Number(await env.TICKET_ACCESS.get(`recruitment-cooldown:${user.id}`) || 0);
    if (cooldownUntil > Date.now()) {
      const hours = Math.max(1, Math.ceil((cooldownUntil - Date.now()) / (60 * 60 * 1000)));
      await resetPanelSelection(env, interaction);
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Tu pourras déposer une nouvelle candidature dans environ ${hours} heure(s).`, flags: 64 }
      };
    }
  }

  const openTickets = await findOpenTickets(env, user.id);
  if (openTickets.length >= 5) {
    await resetPanelSelection(env, interaction);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Tu as déjà 5 tickets ouverts. Ferme un ticket avant d’en créer un autre.', flags: 64 }
    };
  }

  if (type === 'recruitment') await addCandidateRole(env, user.id);
  const staffRoleIds = [...new Set(config.staffRoleIds.filter(Boolean))];
  const channel = await discord(env, `/guilds/${env.DISCORD_GUILD_ID}/channels`, {
    method: 'POST',
    body: JSON.stringify({
      name: `${config.prefix}-${safeChannelName(user.username)}`,
      type: 0,
      parent_id: config.categoryId,
      topic: `sasp-ticket:${type}:${user.id}`,
      permission_overwrites: [
        { id: env.DISCORD_GUILD_ID, type: 0, deny: VIEW_CHANNEL, allow: '0' },
        { id: user.id, type: 1, allow: CHANNEL_ALLOW, deny: '0' },
        ...staffRoleIds.map(id => ({ id, type: 0, allow: CHANNEL_ALLOW, deny: '0' })),
        { id: env.DISCORD_APPLICATION_ID, type: 1, allow: CHANNEL_ALLOW, deny: '0' }
      ]
    })
  });

  const buttons = [];
  if (type === 'recruitment') buttons.push({ type: 2, style: 1, label: 'Lancer le QCM', custom_id: 'launch_recruitment_qcm' });
  buttons.push({ type: 2, style: 4, label: 'Fermer le ticket', custom_id: 'close_recruitment_ticket' });

  await discord(env, `/channels/${channel.id}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: `<@${user.id}> bienvenue dans ton ticket BCSO.\n${staffRoleIds.map(id => `<@&${id}>`).join(' ')}`,
      allowed_mentions: { parse: [], users: [user.id], roles: staffRoleIds },
      embeds: [{ title: config.title, description: config.description, color: 0xD99A32 }],
      components: [{ type: 1, components: buttons }]
    })
  });

  await resetPanelSelection(env, interaction);

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: `Ton ticket a été créé : <#${channel.id}>`, flags: 64 }
  };
}

async function launchRecruitmentQcm(env, interaction, origin) {
  const channel = await discord(env, `/channels/${interaction.channel_id}`);
  const topic = String(channel.topic || '');
  const parts = topic.split(':');
  const type = topic.startsWith('sasp-recruitment-user:') ? 'recruitment' : parts[1];
  const ownerId = topic.startsWith('sasp-recruitment-user:') ? topic.replace('sasp-recruitment-user:', '') : parts[2];
  const roles = interaction.member.roles || [];
  const canLaunch = roles.includes(env.RECRUITMENT_PING_ROLE_ID) || roles.includes(env.STAFF_ROLE_ID);
  if (!canLaunch) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Seul le service recrutement peut lancer le QCM.', flags: 64 }
    };
  }
  if (type !== 'recruitment' || !ownerId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Ce bouton fonctionne uniquement dans un ticket de recrutement.', flags: 64 }
    };
  }
  if (await env.TICKET_ACCESS.get(`qcm-completed:${interaction.channel_id}`)) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Ce candidat a déjà terminé son QCM.', flags: 64 }
    };
  }
  if (await env.TICKET_ACCESS.get(`channel:${interaction.channel_id}`)) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Le QCM est déjà en cours dans ce ticket.', flags: 64 }
    };
  }

  const token = crypto.randomUUID().replace(/-/g, '');
  const ttl = 6 * 60 * 60;
  await Promise.all([
    env.TICKET_ACCESS.put(`token:${token}`, JSON.stringify({ userId: ownerId, channelId: interaction.channel_id }), { expirationTtl: ttl }),
    env.TICKET_ACCESS.put(`channel:${interaction.channel_id}`, token, { expirationTtl: ttl })
  ]);
  await discord(env, `/channels/${interaction.channel_id}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: `<@${ownerId}> ton QCM est prêt. Ce lien est personnel et ne pourra être utilisé qu’une seule fois.`,
      allowed_mentions: { parse: [], users: [ownerId] },
      embeds: [{
        title: 'QCM de recrutement',
        description: 'Lance le questionnaire uniquement lorsque le recruteur te le demande. Une fois envoyé, il sera définitivement verrouillé.',
        color: 0x3B82F6
      }],
      components: [{
        type: 1,
        components: [{ type: 2, style: 5, label: 'Commencer le QCM', url: `${origin}/recrutement?token=${token}` }]
      }]
    })
  });

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: 'Le lien du QCM a été envoyé au candidat.', flags: 64 }
  };
}

async function closeTicket(env, interaction, ctx) {
  const channel = await discord(env, `/channels/${interaction.channel_id}`);
  const ownerId = String(channel.topic || '').replace('sasp-recruitment-user:', '');
  const roles = interaction.member.roles || [];
  const allowed = interaction.member.user.id === ownerId || roles.includes(env.STAFF_ROLE_ID);

  if (!allowed || !ownerId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Tu ne peux pas fermer ce ticket.', flags: 64 }
    };
  }

  await removeCandidateRole(env, ownerId);
  const token = await env.TICKET_ACCESS.get(`channel:${interaction.channel_id}`);
  if (token) {
    await Promise.all([
      env.TICKET_ACCESS.delete(`token:${token}`),
      env.TICKET_ACCESS.delete(`channel:${interaction.channel_id}`)
    ]);
  }
  ctx.waitUntil(new Promise(resolve => setTimeout(resolve, 1200)).then(() =>
    discord(env, `/channels/${interaction.channel_id}`, { method: 'DELETE' })
  ));

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: 'Ticket fermé. Le rôle candidat a été retiré.' }
  };
}

async function closePanelTicket(env, interaction, ctx) {
  const channel = await discord(env, `/channels/${interaction.channel_id}`);
  const topic = String(channel.topic || '');
  const legacy = topic.startsWith('sasp-recruitment-user:');
  const parts = topic.split(':');
  const type = legacy ? 'recruitment' : parts[1];
  const ownerId = legacy ? topic.replace('sasp-recruitment-user:', '') : parts[2];
  const config = ticketConfig(env, type);
  const roles = interaction.member.roles || [];
  const allowed = interaction.member.user.id === ownerId || (config && config.staffRoleIds.some(id => roles.includes(id)));

  if (!allowed || !ownerId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Tu ne peux pas fermer ce ticket.', flags: 64 }
    };
  }

  if (type === 'recruitment') await removeCandidateRole(env, ownerId);
  const token = await env.TICKET_ACCESS.get(`channel:${interaction.channel_id}`);
  if (token) {
    await Promise.all([
      env.TICKET_ACCESS.delete(`token:${token}`),
      env.TICKET_ACCESS.delete(`channel:${interaction.channel_id}`)
    ]);
  }
  ctx.waitUntil(new Promise(resolve => setTimeout(resolve, 1200)).then(() =>
    discord(env, `/channels/${interaction.channel_id}`, { method: 'DELETE' })
  ));

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: type === 'recruitment' ? 'Ticket fermé. Le rôle candidat a été retiré.' : 'Ticket fermé.' }
  };
}

async function installTicketPanel(env) {
  const payload = {
    embeds: [{
      title: 'BCSO — Centre de contact',
      description: [
        'Sélectionnez le type de demande dans le menu ci-dessous pour ouvrir un ticket privé.',
        '',
        '🛡️ **Recrutement** — Déposer une candidature et accéder au questionnaire.',
        '🤝 **Liaison** — Contacter le service pour une liaison officielle ou interservice.',
        'ℹ️ **Information** — Obtenir un renseignement ou poser une question.',
        '📩 **Divers** — Toute autre demande destinée au BCSO.',
        '',
        '*Chaque personne peut avoir jusqu’à 5 tickets ouverts en même temps.*'
      ].join('\n'),
      color: 0xD99A32,
      footer: { text: 'BCSO • Protéger et servir' }
    }],
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: 'ticket_type_select',
        placeholder: 'Sélectionner un type de ticket…',
        min_values: 1,
        max_values: 1,
        options: [
          { label: 'Recrutement', value: 'recruitment', description: 'Candidature et questionnaire', emoji: { name: '🛡️' } },
          { label: 'Liaison', value: 'liaison', description: 'Liaison officielle ou interservice', emoji: { name: '🤝' } },
          { label: 'Information', value: 'information', description: 'Question ou renseignement', emoji: { name: 'ℹ️' } },
          { label: 'Divers', value: 'divers', description: 'Toute autre demande', emoji: { name: '📩' } }
        ]
      }]
    }]
  };

  const messages = await discord(env, `/channels/${env.TICKET_PANEL_CHANNEL_ID}/messages?limit=50`);
  const existing = messages.find(message =>
    message.author?.id === env.DISCORD_APPLICATION_ID &&
    message.components?.some(row => row.components?.some(component => component.custom_id === 'ticket_type_select'))
  );
  const panel = existing
    ? await discord(env, `/channels/${env.TICKET_PANEL_CHANNEL_ID}/messages/${existing.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await discord(env, `/channels/${env.TICKET_PANEL_CHANNEL_ID}/messages`, { method: 'POST', body: JSON.stringify(payload) });

  const commands = await discord(env, `/applications/${env.DISCORD_APPLICATION_ID}/guilds/${env.DISCORD_GUILD_ID}/commands`);
  await Promise.all(commands
    .filter(command => command.name === 'ticket-recrutement')
    .map(command => discord(env, `/applications/${env.DISCORD_APPLICATION_ID}/guilds/${env.DISCORD_GUILD_ID}/commands/${command.id}`, { method: 'DELETE' })));

  return panel;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/admin/')) {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': new URL(env.SITE_URL).origin,
          'access-control-allow-headers': 'authorization,content-type',
          'access-control-allow-methods': 'POST,OPTIONS'
        }
      });
    }
    if (url.pathname === '/health') return json({ ok: true });
    if (url.pathname === '/admin/install-panel' && request.method === 'GET') {
      await installTicketPanel(env);
      return json({ ok: true });
    }
    if (url.pathname === '/admin/login' && request.method === 'POST') return adminLogin(request, env);
    if (url.pathname === '/admin/decision' && request.method === 'POST') return applicationDecision(request, env);
    if (url.pathname === '/recrutement' && request.method === 'GET') return serveRecruitment(env, url);
    if (url.pathname === '/api' && (request.method === 'GET' || request.method === 'POST')) {
      return proxyAppsScript(request, env, url, ctx);
    }
    if (url.pathname !== '/interactions' || request.method !== 'POST') {
      return new Response('BCSO Discord Bot', { status: 200 });
    }

    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body = await request.text();
    const valid = signature && timestamp && await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
    if (!valid) return new Response('Signature invalide', { status: 401 });

    const interaction = JSON.parse(body);
    try {
      if (interaction.type === InteractionType.PING) {
        return json({ type: InteractionResponseType.PONG });
      }
      if (interaction.type === InteractionType.MESSAGE_COMPONENT && interaction.data.custom_id === 'ticket_type_select') {
        return json(await createPanelTicket(env, interaction, url.origin, interaction.data.values?.[0]));
      }
      if (interaction.type === InteractionType.MESSAGE_COMPONENT && interaction.data.custom_id === 'launch_recruitment_qcm') {
        return json(await launchRecruitmentQcm(env, interaction, url.origin));
      }
      if (interaction.type === InteractionType.MESSAGE_COMPONENT && interaction.data.custom_id === 'close_recruitment_ticket') {
        return json(await closePanelTicket(env, interaction, ctx));
      }
      return json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'Interaction inconnue.', flags: 64 }
      });
    } catch (error) {
      return json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Erreur du bot : ${String(error.message || error).slice(0, 1400)}`, flags: 64 }
      });
    }
  }
};
