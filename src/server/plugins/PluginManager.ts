import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { Plugin, PluginMetadata } from './PluginTypes';

export class PluginManager extends EventEmitter {
  private plugins: Map<string, Plugin> = new Map();
  private pluginDirectory: string;

  constructor(pluginDirectory: string) {
    super();
    this.pluginDirectory = pluginDirectory;
    this.loadPlugins();
  }

  private async loadPlugins() {
    try {
      const pluginFiles = await fs.promises.readdir(this.pluginDirectory);
      
      for (const file of pluginFiles) {
        if (file.endsWith('.js') || file.endsWith('.ts')) {
          try {
            const pluginPath = path.join(this.pluginDirectory, file);
            const pluginModule = await import(pluginPath);
            
            if (this.isValidPlugin(pluginModule.default)) {
              this.registerPlugin(pluginModule.default);
            }
          } catch (error) {
            console.error(`Failed to load plugin ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error reading plugin directory:', error);
    }
  }

  private isValidPlugin(plugin: Plugin): boolean {
    return plugin && 
           typeof plugin.metadata === 'object' &&
           typeof plugin.initialize === 'function' &&
           typeof plugin.metadata.id === 'string';
  }

  registerPlugin(plugin: Plugin) {
    if (this.plugins.has(plugin.metadata.id)) {
      throw new Error(`Plugin with ID ${plugin.metadata.id} already exists`);
    }

    try {
      plugin.initialize();
      this.plugins.set(plugin.metadata.id, plugin);
      this.emit('pluginLoaded', plugin.metadata);
      console.log(`Plugin loaded: ${plugin.metadata.name}`);
    } catch (error) {
      console.error(`Failed to initialize plugin ${plugin.metadata.name}:`, error);
    }
  }

  unloadPlugin(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (plugin && plugin.unload) {
      plugin.unload();
      this.plugins.delete(pluginId);
      this.emit('pluginUnloaded', plugin.metadata);
    }
  }

  getPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map(p => p.metadata);
  }

  executePluginAction(pluginId: string, actionName: string, ...args: any[]) {
    const plugin = this.plugins.get(pluginId);
    if (plugin && plugin.actions && plugin.actions[actionName]) {
      return plugin.actions[actionName](...args);
    }
    throw new Error(`Action ${actionName} not found in plugin ${pluginId}`);
  }
}

export default new PluginManager(path.join(__dirname, '../../plugins'));