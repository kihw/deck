const fs = require('fs');
const path = require('path');

class PluginLoader {
  constructor(pluginDirectory) {
    this.pluginDirectory = pluginDirectory;
    this.loadedPlugins = new Map();
  }

  async loadPlugins() {
    const pluginFiles = fs.readdirSync(this.pluginDirectory)
      .filter(file => file.endsWith('.js') && file !== 'BasePlugin.js' && file !== 'PluginLoader.js');

    for (const file of pluginFiles) {
      try {
        const pluginPath = path.join(this.pluginDirectory, file);
        const PluginClass = require(pluginPath);
        
        // Ensure the plugin extends BasePlugin
        if (typeof PluginClass !== 'function') {
          console.warn(`Skipping ${file}: Not a valid plugin class`);
          continue;
        }

        const plugin = new PluginClass();
        await plugin.initialize();
        
        this.loadedPlugins.set(plugin.name, plugin);
        console.log(`Loaded plugin: ${plugin.name}`);
      } catch (error) {
        console.error(`Failed to load plugin ${file}:`, error);
      }
    }
  }

  async unloadPlugins() {
    for (const [name, plugin] of this.loadedPlugins.entries()) {
      try {
        await plugin.unload();
        this.loadedPlugins.delete(name);
        console.log(`Unloaded plugin: ${name}`);
      } catch (error) {
        console.error(`Failed to unload plugin ${name}:`, error);
      }
    }
  }

  getPlugin(name) {
    return this.loadedPlugins.get(name);
  }

  getAllPlugins() {
    return Array.from(this.loadedPlugins.values());
  }

  registerPluginActions() {
    const allActions = {};
    for (const plugin of this.loadedPlugins.values()) {
      const pluginActions = plugin.registerActions();
      pluginActions.forEach(action => {
        allActions[action.name] = action.handler;
      });
    }
    return allActions;
  }
}

module.exports = PluginLoader;