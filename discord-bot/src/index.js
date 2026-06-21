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
    .replace('<head>', `<head>\n<base href="${env.SITE_URL}/">`)
    .replace('<script src="config.js"></script>', `<script>window.SASP_API_URL=${JSON.stringify(apiUrl)};</script>`);

  return new Response(html, {
    headers: { 'content-type': 'text/html;charset=UTF-8', 'cache-control': 'no-store' }
  });
}

async function proxyAppsScript(request, env, url) {
  const token = url.searchParams.get('token');
  const access = await getTicketAccess(env, token);
  if (!access) return json({ success: false, error: 'Acces candidat expire' }, 403);

  const target = new URL(env.APPS_SCRIPT_URL);
  for (const [key, value] of url.searchParams) {
    if (key !== 'token') target.searchParams.append(key, value);
  }
  const contentType = request.headers.get('content-type');
  const upstream = await fetch(target, {
    method: request.method,
    headers: contentType ? { 'content-type': contentType } : {},
    body: request.method === 'GET' ? undefined : await request.arrayBuffer(),
    redirect: 'follow'
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'text/plain;charset=UTF-8',
      'cache-control': 'no-store'
    }
  });
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
      title: 'Recrutement SASP Nord',
      description: 'Présente ta candidature et accède au questionnaire sécurisé.',
      staffRoleIds: [env.STAFF_ROLE_ID]
    },
    liaison: {
      prefix: 'liaison',
      title: 'Demande de liaison',
      description: 'Contacte le SASP Nord au sujet d’une liaison officielle ou interservice.',
      staffRoleIds: supportRoles
    },
    information: {
      prefix: 'information',
      title: 'Demande d’information',
      description: 'Pose une question ou demande un renseignement à l’équipe du SASP Nord.',
      staffRoleIds: supportRoles
    },
    divers: {
      prefix: 'divers',
      title: 'Demande diverse',
      description: 'Pour toute demande qui ne correspond pas aux autres catégories.',
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
  const existing = await findOpenTicket(env, user.id);
  if (existing) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Tu as déjà un ticket ouvert : <#${existing.id}>`, flags: 64 }
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
      content: `<@${user.id}> bienvenue dans ton ticket de recrutement SASP Nord.`,
      embeds: [{
        title: 'Recrutement SASP Nord',
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

async function createPanelTicket(env, interaction, origin, type) {
  const user = interaction.member.user;
  const config = ticketConfig(env, type);
  if (!config) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Type de ticket inconnu.', flags: 64 }
    };
  }

  const existing = await findOpenTicket(env, user.id);
  if (existing) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Tu as déjà un ticket ouvert : <#${existing.id}>`, flags: 64 }
    };
  }

  if (type === 'recruitment') await addCandidateRole(env, user.id);
  const staffRoleIds = [...new Set(config.staffRoleIds.filter(Boolean))];
  const channel = await discord(env, `/guilds/${env.DISCORD_GUILD_ID}/channels`, {
    method: 'POST',
    body: JSON.stringify({
      name: `${config.prefix}-${safeChannelName(user.username)}`,
      type: 0,
      parent_id: env.RECRUITMENT_CATEGORY_ID,
      topic: `sasp-ticket:${type}:${user.id}`,
      permission_overwrites: [
        { id: env.DISCORD_GUILD_ID, type: 0, deny: VIEW_CHANNEL, allow: '0' },
        { id: user.id, type: 1, allow: CHANNEL_ALLOW, deny: '0' },
        ...staffRoleIds.map(id => ({ id, type: 0, allow: CHANNEL_ALLOW, deny: '0' })),
        { id: env.DISCORD_APPLICATION_ID, type: 1, allow: CHANNEL_ALLOW, deny: '0' }
      ]
    })
  });

  let token = null;
  if (type === 'recruitment') {
    token = crypto.randomUUID().replace(/-/g, '');
    const ttl = 7 * 24 * 60 * 60;
    await Promise.all([
      env.TICKET_ACCESS.put(`token:${token}`, JSON.stringify({ userId: user.id, channelId: channel.id }), { expirationTtl: ttl }),
      env.TICKET_ACCESS.put(`channel:${channel.id}`, token, { expirationTtl: ttl })
    ]);
  }

  const buttons = [];
  if (token) buttons.push({ type: 2, style: 5, label: 'Accéder au questionnaire', url: `${origin}/recrutement?token=${token}` });
  buttons.push({ type: 2, style: 4, label: 'Fermer le ticket', custom_id: 'close_recruitment_ticket' });

  await discord(env, `/channels/${channel.id}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: `<@${user.id}> bienvenue dans ton ticket SASP Nord.`,
      embeds: [{ title: config.title, description: config.description, color: 0xD99A32 }],
      components: [{ type: 1, components: buttons }]
    })
  });

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: `Ton ticket a été créé : <#${channel.id}>`, flags: 64 }
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
      title: 'SASP Nord — Centre de contact',
      description: [
        'Sélectionnez le type de demande dans le menu ci-dessous pour ouvrir un ticket privé.',
        '',
        '🛡️ **Recrutement** — Déposer une candidature et accéder au questionnaire.',
        '🤝 **Liaison** — Contacter le service pour une liaison officielle ou interservice.',
        'ℹ️ **Information** — Obtenir un renseignement ou poser une question.',
        '📩 **Divers** — Toute autre demande destinée au SASP Nord.',
        '',
        '*Un seul ticket peut être ouvert à la fois par personne.*'
      ].join('\n'),
      color: 0xD99A32,
      footer: { text: 'SASP Nord • Protéger et servir' }
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
    if (url.pathname === '/health') return json({ ok: true });
    if (url.pathname === '/recrutement' && request.method === 'GET') return serveRecruitment(env, url);
    if (url.pathname === '/api' && (request.method === 'GET' || request.method === 'POST')) {
      return proxyAppsScript(request, env, url);
    }
    if (url.pathname !== '/interactions' || request.method !== 'POST') {
      return new Response('SASP Nord Discord Bot', { status: 200 });
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
