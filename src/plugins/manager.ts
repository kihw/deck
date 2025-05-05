import fs from 'fs-extra';
import path from 'path';
import { Plugin, PluginConfig, PluginRegistry } from './types';

export class PluginManager {
  private registry: PluginRegistry = new Map();
  private configPath: string;

  constructor(pluginDirectory: string) {
    this.configPath = path.join(pluginDirectory, 'config.json');
  }

  async loadPlugins(pluginDirectory: string): Promise<void> {
    const pluginFiles = await fs.readdir(pluginDirectory);

    for (const file of pluginFiles) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        try {
          const pluginPath = path.join(pluginDirectory, file);
          const pluginModule = await import(pluginPath);
          const plugin = pluginModule.default as Plugin;

          if (this.validatePlugin(plugin)) {
            await this.registerPlugin(plugin);
          }
        } catch (error) {
          console.error(`Failed to load plugin ${file}:`, error);
        }
      }
    }
  }

  private validatePlugin(plugin: Plugin): boolean {
    return !!(
      plugin.metadata &&
      plugin.metadata.id &&
      plugin.actions &&
      typeof plugin.initialize === 'function'
    );
  }

  async registerPlugin(plugin: Plugin): Promise<void> {
    const config = await this.loadPluginConfig(plugin.metadata.id);
    
    if (config.enabled) {
      await plugin.initialize(config.settings);
      this.registry.set(plugin.metadata.id, plugin);
      console.log(`Registered plugin: ${plugin.metadata.name}`);
    }
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.get(pluginId);
    
    if (plugin && plugin.unload) {
      await plugin.unload();
      this.registry.delete(pluginId);
    }
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.registry.get(pluginId);
  }

  listPlugins(): Plugin[] {
    return Array.from(this.registry.values());
  }

  async executePluginAction(
    pluginId: string, 
    actionId: string, 
    context?: Record<string, any>
  ): Promise<any> {
    const plugin = this.getPlugin(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const action = plugin.actions[actionId];
    
    if (!action) {
      throw new Error(`Action ${actionId} not found in plugin ${pluginId}`);
    }

    // Optional validation before execution
    if (action.validate && !action.validate(context)) {
      throw new Error('Invalid action parameters');
    }

    return await action.execute(context);
  }

  private async loadPluginConfig(pluginId: string): Promise<PluginConfig> {
    try {
      const configFile = await fs.readJSON(this.configPath);
      return configFile[pluginId] || {
        enabled: true,
        settings: {}
      };
    } catch {
      return {
        enabled: true,
        settings: {}
      };
    }
  }

  async savePluginConfig(pluginId: string, config: Partial<PluginConfig>): Promise<void> {
    const currentConfig = await this.loadPluginConfig(pluginId);
    const updatedConfig = { ...currentConfig, ...config };

    try {
      const configFile = await fs.readJSON(this.configPath);
      configFile[pluginId] = updatedConfig;
      await fs.writeJSON(this.configPath, configFile, { spaces: 2 });
    } catch (error) {
      console.error('Failed to save plugin config:', error);
    }
  }
}

export default new PluginManager(path.join(__dirname, 'plugins'));
