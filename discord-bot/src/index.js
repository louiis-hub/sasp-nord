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

async function findOpenTicket(env, userId) {
  const channels = await discord(env, `/guilds/${env.DISCORD_GUILD_ID}/channels`);
  return channels.find(channel => channel.topic === `sasp-recruitment-user:${userId}`);
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

async function createTicket(env, interaction) {
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
          { type: 2, style: 5, label: 'Accéder au test', url: `${env.SITE_URL}/recrutement.html` },
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
  ctx.waitUntil(new Promise(resolve => setTimeout(resolve, 1200)).then(() =>
    discord(env, `/channels/${interaction.channel_id}`, { method: 'DELETE' })
  ));

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: 'Ticket fermé. Le rôle candidat a été retiré.' }
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ ok: true });
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
      if (interaction.type === InteractionType.APPLICATION_COMMAND && interaction.data.name === 'ticket-recrutement') {
        return json(await createTicket(env, interaction));
      }
      if (interaction.type === InteractionType.MESSAGE_COMPONENT && interaction.data.custom_id === 'close_recruitment_ticket') {
        return json(await closeTicket(env, interaction, ctx));
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
