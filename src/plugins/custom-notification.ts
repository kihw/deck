import { Plugin, PluginAction } from './types';
import nodemailer from 'nodemailer';
import axios from 'axios';

interface NotificationConfig {
  email?: string;
  slackWebhook?: string;
  discordWebhook?: string;
}

class CustomNotificationPlugin implements Plugin {
  metadata = {
    id: 'custom-notifications',
    name: 'Custom Notification System',
    version: '1.0.0',
    description: 'Flexible multi-channel notification plugin',
    author: 'Deck Team'
  };

  private config: NotificationConfig = {};
  private transporters: Record<string, any> = {};

  actions: Record<string, PluginAction> = {
    configureNotifications: {
      id: 'configure',
      name: 'Configure Notifications',
      description: 'Set up notification channels',
      async execute(context: NotificationConfig) {
        // Validate and store configuration
        if (context.email) {
          this.setupEmailTransport(context.email);
        }
        
        this.config = { ...this.config, ...context };
        return { status: 'Configuration updated', channels: Object.keys(context) };
      }
    },

    sendNotification: {
      id: 'send',
      name: 'Send Notification',
      description: 'Send a notification through configured channels',
      async execute(context: { 
        message: string, 
        type?: 'info' | 'warning' | 'error',
        channels?: ('email' | 'slack' | 'discord')[]
      }) {
        const { message, type = 'info', channels = ['email', 'slack', 'discord'] } = context;

        const results: Record<string, boolean> = {};

        if (channels.includes('email') && this.config.email) {
          results.email = await this.sendEmailNotification(message, type);
        }

        if (channels.includes('slack') && this.config.slackWebhook) {
          results.slack = await this.sendSlackNotification(message, type);
        }

        if (channels.includes('discord') && this.config.discordWebhook) {
          results.discord = await this.sendDiscordNotification(message, type);
        }

        return { 
          status: 'Notifications sent', 
          channels: results 
        };
      }
    }
  };

  private setupEmailTransport(emailConfig: string) {
    this.transporters.email = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NOTIFICATION_EMAIL,
        pass: process.env.NOTIFICATION_EMAIL_PASSWORD
      }
    });
  }

  private async sendEmailNotification(message: string, type: string): Promise<boolean> {
    if (!this.transporters.email) return false;

    try {
      await this.transporters.email.sendMail({
        from: process.env.NOTIFICATION_EMAIL,
        to: this.config.email,
        subject: `Deck Notification - ${type.toUpperCase()}`,
        text: message
      });
      return true;
    } catch (error) {
      console.error('Email notification failed:', error);
      return false;
    }
  }

  private async sendSlackNotification(message: string, type: string): Promise<boolean> {
    if (!this.config.slackWebhook) return false;

    try {
      await axios.post(this.config.slackWebhook, {
        text: message,
        attachments: [{
          color: this.getColorForType(type),
          title: `Deck Notification - ${type.toUpperCase()}`
        }]
      });
      return true;
    } catch (error) {
      console.error('Slack notification failed:', error);
      return false;
    }
  }

  private async sendDiscordNotification(message: string, type: string): Promise<boolean> {
    if (!this.config.discordWebhook) return false;

    try {
      await axios.post(this.config.discordWebhook, {
        content: message,
        embeds: [{
          color: this.getColorForType(type),
          title: `Deck Notification - ${type.toUpperCase()}`
        }]
      });
      return true;
    } catch (error) {
      console.error('Discord notification failed:', error);
      return false;
    }
  }

  private getColorForType(type: string): number {
    const colors = {
      'info': 0x3498db,    // Blue
      'warning': 0xf39c12, // Orange
      'error': 0xe74c3c    // Red
    };
    return colors[type] || colors.info;
  }

  async initialize(config?: NotificationConfig): Promise<void> {
    if (config) {
      await this.actions.configureNotifications.execute(config);
    }
  }

  async unload(): Promise<void> {
    // Reset configuration and close any open connections
    this.config = {};
    this.transporters = {};
  }
}

export default new CustomNotificationPlugin();
