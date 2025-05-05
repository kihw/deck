import fs from 'fs';
import path from 'path';

interface PluginConfig {
  name: string;
  version: string;
  actions: string[];
}

class PluginManager {
  private pluginsDirectory: string;
  private loadedPlugins: Map<string, any> = new Map();

  constructor(pluginsDir: string) {
    this.pluginsDirectory = pluginsDir;
  }

  public loadPlugins() {
    const pluginFiles = fs.readdirSync(this.pluginsDirectory);
    
    for (const file of pluginFiles) {
      if (file.endsWith('.js')) {
        const pluginPath = path.join(this.pluginsDirectory, file);
        const plugin = require(pluginPath);
        
        if (plugin.name && plugin.init) {
          plugin.init();
          this.loadedPlugins.set(plugin.name, plugin);
        }
      }
    }
  }

  public getPlugin(name: string) {
    return this.loadedPlugins.get(name);
  }

  public listPlugins(): PluginConfig[] {
    return Array.from(this.loadedPlugins.values()).map(plugin => ({
      name: plugin.name,
      version: plugin.version,
      actions: plugin.actions || []
    }));
  }

  public executePluginAction(pluginName: string, actionName: string, params: any) {
    const plugin = this.getPlugin(pluginName);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    if (!plugin[actionName]) {
      throw new Error(`Action ${actionName} not found in plugin ${pluginName}`);
    }

    return plugin[actionName](params);
  }
}

export default new PluginManager(path.join(__dirname, '../../plugins'));