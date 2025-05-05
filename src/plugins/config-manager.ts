import fs from 'fs-extra';
import path from 'path';
import { PluginConfig, Plugin } from './types';
import { validateConfig } from './config-validator';

export class PluginConfigManager {
  private configPath: string;
  private defaultConfigPath: string;

  constructor(configDir: string) {
    this.configPath = path.join(configDir, 'plugins.json');
    this.defaultConfigPath = path.join(configDir, 'plugins.default.json');
  }

  async initializeConfig(): Promise<void> {
    if (!await fs.pathExists(this.configPath)) {
      await this.createDefaultConfig();
    }
  }

  private async createDefaultConfig(): Promise<void> {
    const defaultConfig = await this.loadDefaultConfig();
    await fs.writeJSON(this.configPath, defaultConfig, { spaces: 2 });
  }

  private async loadDefaultConfig(): Promise<Record<string, PluginConfig>> {
    try {
      return await fs.readJSON(this.defaultConfigPath);
    } catch {
      return {};
    }
  }

  async getPluginConfig(pluginId: string): Promise<PluginConfig> {
    const config = await this.loadConfig();
    return config[pluginId] || {
      enabled: true,
      settings: {}
    };
  }

  async updatePluginConfig(
    pluginId: string, 
    updates: Partial<PluginConfig>
  ): Promise<void> {
    const config = await this.loadConfig();
    const currentConfig = config[pluginId] || {};
    
    config[pluginId] = {
      ...currentConfig,
      ...updates
    };

    await this.saveConfig(config);
  }

  async loadConfig(): Promise<Record<string, PluginConfig>> {
    await this.initializeConfig();
    return await fs.readJSON(this.configPath);
  }

  async saveConfig(config: Record<string, PluginConfig>): Promise<void> {
    if (validateConfig(config)) {
      await fs.writeJSON(this.configPath, config, { spaces: 2 });
    } else {
      throw new Error('Invalid plugin configuration');
    }
  }

  async validateAndApplySettings(
    plugin: Plugin, 
    settings: Record<string, any>
  ): Promise<Record<string, any>> {
    const defaultSettings = await this.getDefaultSettings(plugin);
    const validatedSettings = { ...defaultSettings, ...settings };

    // Optional plugin-specific validation
    if (plugin.helpers?.validateSettings) {
      const isValid = plugin.helpers.validateSettings(validatedSettings);
      if (!isValid) {
        throw new Error(`Invalid settings for plugin ${plugin.metadata.id}`);
      }
    }

    return validatedSettings;
  }

  private async getDefaultSettings(plugin: Plugin): Promise<Record<string, any>> {
    const config = await this.getPluginConfig(plugin.metadata.id);
    return config.settings || {};
  }

  async resetPluginConfig(pluginId: string): Promise<void> {
    const defaultConfig = await this.loadDefaultConfig();
    const config = await this.loadConfig();
    
    config[pluginId] = defaultConfig[pluginId] || {
      enabled: true,
      settings: {}
    };

    await this.saveConfig(config);
  }
}

export default new PluginConfigManager(path.join(__dirname, '..', 'config'));
