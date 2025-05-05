import { Plugin } from '../models/plugin.model';
import { EventEmitter } from 'events';

export class PluginManager extends EventEmitter {
  private plugins: Map<string, Plugin> = new Map();

  loadPlugin(plugin: Plugin) {
    this.plugins.set(plugin.id, plugin);
    this.emit('plugin:loaded', plugin);
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  listPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}