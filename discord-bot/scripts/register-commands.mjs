const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;

if (!applicationId || !guildId || !token) {
  throw new Error('Variables DISCORD_APPLICATION_ID, DISCORD_GUILD_ID et DISCORD_BOT_TOKEN requises.');
}

const response = await fetch(`https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`, {
  method: 'PUT',
  headers: {
    authorization: `Bot ${token}`,
    'content-type': 'application/json'
  },
  body: JSON.stringify([{
    name: 'ticket-recrutement',
    description: 'Ouvre un ticket privé de recrutement SASP Nord',
    type: 1
  }])
});

if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
console.log('Commande /ticket-recrutement enregistrée.');
