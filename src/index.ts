import PluginManager from './plugins/manager';
import ConfigManager from './plugins/config-manager';
import SystemMonitorPlugin from './plugins/system-monitor';
import DiscordIntegrationPlugin from './plugins/discord-integration';
import { Plugin } from './plugins/types';
import dotenv from 'dotenv';
import path from 'path';

class DeckApplication {
  private pluginManager: PluginManager;
  private configManager: ConfigManager;
  private plugins: Map<string, Plugin> = new Map();

  constructor() {
    // Load environment variables
    dotenv.config();

    this.pluginManager = new PluginManager(path.join(__dirname, 'plugins'));
    this.configManager = new ConfigManager(path.join(__dirname, 'config'));
  }

  async initialize() {
    try {
      // Load configuration
      const pluginConfigs = await this.configManager.loadConfig();

      // Register default plugins
      await this.registerDefaultPlugins();

      // Initialize plugins with their configurations
      await this.initializePlugins(pluginConfigs);

      // Setup plugin-specific integrations
      await this.setupPluginIntegrations();

      console.log('Deck Application initialized successfully');
    } catch (error) {
      console.error('Initialization failed:', error);
      process.exit(1);
    }
  }

  private async registerDefaultPlugins() {
    const defaultPlugins = [
      SystemMonitorPlugin,
      DiscordIntegrationPlugin
    ];

    for (const plugin of defaultPlugins) {
      await this.registerPlugin(plugin);
    }
  }

  async registerPlugin(plugin: Plugin): Promise<void> {
    try {
      // Validate plugin
      if (!plugin.metadata || !plugin.metadata.id) {
        throw new Error('Invalid plugin: missing metadata');
      }

      // Check for existing plugin
      if (this.plugins.has(plugin.metadata.id)) {
        console.warn(`Plugin ${plugin.metadata.id} already registered. Replacing.`);
      }

      // Register plugin
      this.plugins.set(plugin.metadata.id, plugin);
      console.log(`Registered plugin: ${plugin.metadata.id}`);
    } catch (error) {
      console.error(`Failed to register plugin: ${error.message}`);
    }
  }

  private async initializePlugins(pluginConfigs: Record<string, any>) {
    for (const [pluginId, plugin] of this.plugins.entries()) {
      try {
        const config = pluginConfigs[pluginId] || {};
        
        // Only initialize if plugin is enabled
        if (config.enabled !== false) {
          await plugin.initialize(config.settings);
          console.log(`Initialized plugin: ${pluginId}`);
        }
      } catch (error) {
        console.error(`Failed to initialize plugin ${pluginId}:`, error);
      }
    }
  }

  private async setupPluginIntegrations() {
    await this.setupSystemMonitoring();
    await this.setupDiscordIntegration();
  }

  private async setupSystemMonitoring() {
    try {
      const systemMonitor = this.plugins.get('system-monitor');
      
      if (systemMonitor) {
        // Start continuous monitoring
        await systemMonitor.actions.startContinuousMonitoring.execute({
          interval: 10000 // 10 seconds
        });

        // Add a metrics listener
        systemMonitor.helpers.addMetricsListener((metrics) => {
          if (metrics.cpu.usage > 80) {
            this.handleHighResourceUsage('CPU', metrics.cpu.usage);
          }
          
          if (metrics.memory.percentUsed > 90) {
            this.handleHighResourceUsage('Memory', metrics.memory.percentUsed);
          }
        });
      }
    } catch (error) {
      console.error('System monitoring setup failed:', error);
    }
  }

  private async setupDiscordIntegration() {
    try {
      const discordPlugin = this.plugins.get('discord-integration');
      
      if (discordPlugin) {
        // Check if Discord bot token is available
        const discordToken = process.env.DISCORD_BOT_TOKEN;
        
        if (discordToken) {
          // Connect to Discord
          await discordPlugin.actions.connect.execute({
            token: discordToken
          });

          // Set initial status
          await discordPlugin.actions.setStatus.execute({
            status: 'online',
            activity: 'Monitoring Systems'
          });
        }
      }
    } catch (error) {
      console.error('Discord integration setup failed:', error);
    }
  }

  // Dynamic plugin loading
  async loadExternalPlugin(pluginPath: string): Promise<void> {
    try {
      // Dynamically import the plugin
      const pluginModule = await import(pluginPath);
      const plugin = pluginModule.default;

      // Register and initialize the plugin
      await this.registerPlugin(plugin);
      
      // Load its configuration
      const config = await this.configManager.getPluginConfig(plugin.metadata.id);
      await plugin.initialize(config.settings);

      console.log(`Loaded external plugin: ${plugin.metadata.id}`);
    } catch (error) {
      console.error('Failed to load external plugin:', error);
    }
  }

  // Unload a specific plugin
  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    
    if (plugin) {
      try {
        // Call plugin's unload method if exists
        if (plugin.unload) {
          await plugin.unload();
        }

        // Remove from active plugins
        this.plugins.delete(pluginId);
        console.log(`Unloaded plugin: ${pluginId}`);
      } catch (error) {
        console.error(`Failed to unload plugin ${pluginId}:`, error);
      }
    }
  }

  // Handle high resource usage
  private async handleHighResourceUsage(
    resource: 'CPU' | 'Memory', 
    usage: number
  ) {
    console.warn(`High ${resource} usage detected: ${usage}%`);

    try {
      const discordPlugin = this.plugins.get('discord-integration');
      
      if (discordPlugin) {
        // Send alert message to a predefined channel
        await discordPlugin.actions.sendMessage.execute({
          channelId: process.env.ALERT_CHANNEL_ID || '',
          message: `⚠️ High ${resource} usage alert: ${usage}%`
        });
      }
    } catch (error) {
      console.error('Failed to send resource usage alert:', error);
    }
  }

  // Graceful shutdown
  async shutdown() {
    console.log('Shutting down Deck Application...');

    // Unload all plugins
    for (const pluginId of this.plugins.keys()) {
      await this.unloadPlugin(pluginId);
    }

    console.log('Deck Application shutdown complete');
    process.exit(0);
  }
}

// Application lifecycle management
const app = new DeckApplication();

// Initialize the application
app.initialize().catch(console.error);

// Handle process signals for graceful shutdown
process.on('SIGINT', () => app.shutdown());
process.on('SIGTERM', () => app.shutdown());

export default app;
