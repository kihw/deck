import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

export default {
  id: 'discord-control',
  name: 'Discord Control',
  version: '1.0.0',
  actions: {
    connect: async (token: string) => {
      try {
        await client.login(token);
        return { success: true, message: 'Connecté à Discord' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    sendMessage: async (params: { channelId: string, message: string }) => {
      try {
        const channel = await client.channels.fetch(params.channelId);
        if (channel.isTextBased()) {
          await channel.send(params.message);
          return { success: true, message: 'Message envoyé' };
        }
        return { success: false, message: 'Canal invalide' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    setStatus: async (status: string) => {
      try {
        await client.user?.setPresence({
          activities: [{ name: status }],
          status: 'online'
        });
        return { success: true, status };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  }
};