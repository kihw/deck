const fs = require('fs');
const path = require('path');

class PluginManager {
    constructor(pluginPath = path.join(__dirname)) {
        this.pluginPath = pluginPath;
        this.plugins = [];
    }

    loadPlugins() {
        try {
            const pluginFiles = fs.readdirSync(this.pluginPath)
                .filter(file => file.endsWith('Plugin.js') || file.endsWith('.js'));

            pluginFiles.forEach(file => {
                try {
                    const fullPath = path.join(this.pluginPath, file);
                    const PluginClass = require(fullPath);
                    const plugin = new PluginClass();
                    this.plugins.push(plugin);
                    console.log(`Loaded plugin: ${file}`);
                } catch (pluginLoadError) {
                    console.error(`Failed to load plugin ${file}:`, pluginLoadError);
                }
            });
        } catch (error) {
            console.error('Plugin loading error:', error);
        }
        
        return this.plugins;
    }

    async initializePlugins(server) {
        for (const plugin of this.plugins) {
            if (typeof plugin.initialize === 'function') {
                try {
                    await plugin.initialize(server);
                } catch (error) {
                    console.error(`Plugin initialization error:`, error);
                }
            }
        }
    }

    registerPluginActions(actionRegistry) {
        for (const plugin of this.plugins) {
            if (typeof plugin.registerActions === 'function') {
                try {
                    plugin.registerActions(actionRegistry);
                } catch (error) {
                    console.error(`Plugin action registration error:`, error);
                }
            }
        }
    }
}

module.exports = PluginManager;