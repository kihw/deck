import fs from 'fs';
import path from 'path';
import { PluginConfiguration, PluginConfigurationMap } from './PluginTypes';

export class PluginConfigManager {
  private configPath: string;
  private configurations: PluginConfigurationMap = {};

  constructor(configDir: string) {
    this.configPath = path.join(configDir, 'plugin-configs.json');
    this.loadConfigurations();
  }

  private loadConfigurations() {
    try {
      if (fs.existsSync(this.configPath)) {
        const rawConfig = fs.readFileSync(this.configPath, 'utf-8');
        this.configurations = JSON.parse(rawConfig);
      } else {
        // Default: all plugins enabled
        this.configurations = {};
      }
    } catch (error) {
      console.error('Error loading plugin configurations:', error);
      this.configurations = {};
    }
  }

  saveConfigurations() {
    try {
      fs.writeFileSync(
        this.configPath, 
        JSON.stringify(this.configurations, null, 2)
      );
    } catch (error) {
      console.error('Error saving plugin configurations:', error);
    }
  }

  getPluginConfig(pluginId: string): PluginConfiguration {
    return this.configurations[pluginId] || { 
      enabled: true,
      settings: {}
    };
  }

  setPluginConfig(
    pluginId: string, 
    config: Partial<PluginConfiguration>
  ) {
    this.configurations[pluginId] = {
      ...this.getPluginConfig(pluginId),
      ...config
    };
    this.saveConfigurations();
  }

  isPluginEnabled(pluginId: string): boolean {
    return this.getPluginConfig(pluginId).enabled;
  }

  getPluginSetting(
    pluginId: string, 
    settingKey: string, 
    defaultValue?: any
  ) {
    const config = this.getPluginConfig(pluginId);
    return config.settings?.[settingKey] ?? defaultValue;
  }

  updatePluginSetting(
    pluginId: string, 
    settingKey: string, 
    value: any
  ) {
    const config = this.getPluginConfig(pluginId);
    config.settings = config.settings || {};
    config.settings[settingKey] = value;
    this.setPluginConfig(pluginId, config);
  }
}

export default new PluginConfigManager(path.join(__dirname, '../../config'));