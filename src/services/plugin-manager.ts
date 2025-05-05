import fs from 'fs-extra';
import path from 'path';

interface Plugin {
  id: string;
  name: string;
  version: string;
  actions: Record<string, Function>;
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private pluginPath: string;

  constructor(pluginPath: string) {
    this.pluginPath = pluginPath;
    this.loadPlugins();
  }

  private async loadPlugins() {
    const pluginFiles = await fs.readdir(this.pluginPath);
    
    for (const file of pluginFiles) {
      if (file.endsWith('.js')) {
        const pluginModule = await import(path.join(this.pluginPath, file));
        this.registerPlugin(pluginModule.default);
      }
    }
  }

  registerPlugin(plugin: Plugin) {
    this.plugins.set(plugin.id, plugin);
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  executeAction(pluginId: string, actionName: string, params: any) {
    const plugin = this.getPlugin(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
    
    const action = plugin.actions[actionName];
    if (!action) throw new Error(`Action ${actionName} not found in plugin ${pluginId}`);

    return action(params);
  }

  listPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}

export default PluginManager;