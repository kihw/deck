import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { Plugin, PluginAction } from './types';

class DiscordIntegrationPlugin implements Plugin {
  metadata = {
    id: 'discord-integration',
    name: 'Discord Integration',
    version: '1.1.0',
    description: 'Advanced Discord communication and notification plugin',
    author: 'Deck Team',
    requiredPermissions: ['send_messages', 'read_channels']
  };

  private client: Client;
  private connectedGuilds: Set<string> = new Set();

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    this.setupClientEvents();
  }

  actions: Record<string, PluginAction> = {
    connect: {
      id: 'discord-connect',
      name: 'Connect to Discord',
      description: 'Establish connection with Discord',
      async execute(context: { token: string }) {
        if (!context.token) {
          throw new Error('Discord bot token is required');
        }

        try {
          await this.client.login(context.token);
          return { 
            status: 'Connected', 
            user: this.client.user?.username 
          };
        } catch (error) {
          throw new Error(`Discord connection failed: ${error.message}`);
        }
      }
    },
    sendMessage: {
      id: 'send-discord-message',
      name: 'Send Discord Message',
      description: 'Send a message to a specific Discord channel',
      async execute(context: { 
        channelId: string, 
        message: string, 
        mention?: string 
      }) {
        const { channelId, message, mention } = context;
        
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel || !(channel instanceof TextChannel)) {
          throw new Error('Invalid channel');
        }

        const finalMessage = mention 
          ? `<@${mention}> ${message}` 
          : message;

        await channel.send(finalMessage);
        
        return { 
          status: 'Message sent', 
          channel: channel.name 
        };
      }
    },
    setStatus: {
      id: 'set-discord-status',
      name: 'Set Discord Status',
      description: 'Update bot\'s online status and activity',
      async execute(context: { 
        status: 'online' | 'idle' | 'dnd' | 'invisible', 
        activity?: string 
      }) {
        const { status, activity } = context;

        this.client.user?.setPresence({
          status,
          activities: activity 
            ? [{ name: activity, type: 0 }] 
            : []
        });

        return { 
          status: 'Status updated', 
          currentStatus: status,
          activity: activity || 'None'
        };
      }
    }
  };

  private setupClientEvents() {
    this.client.on('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
    });

    this.client.on('guildCreate', (guild) => {
      this.connectedGuilds.add(guild.id);
      console.log(`Joined guild: ${guild.name}`);
    });

    this.client.on('guildDelete', (guild) => {
      this.connectedGuilds.delete(guild.id);
      console.log(`Left guild: ${guild.name}`);
    });
  }

  helpers = {
    getConnectedGuilds: () => Array.from(this.connectedGuilds),
    
    createWebhook: async (channelId: string, name: string) => {
      const channel = await this.client.channels.fetch(channelId);
      
      if (channel instanceof TextChannel) {
        const webhook = await channel.createWebhook({
          name: name || 'Deck Webhook'
        });
        
        return {
          id: webhook.id,
          token: webhook.token,
          url: webhook.url
        };
      }
      
      throw new Error('Cannot create webhook in this channel');
    }
  };

  async initialize(config?: Record<string, any>): Promise<void> {
    if (config?.autoConnect && config.token) {
      await this.actions.connect.execute({ token: config.token });
    }
  }

  async unload(): Promise<void> {
    this.client.destroy();
    this.connectedGuilds.clear();
  }
}

export default new DiscordIntegrationPlugin();
