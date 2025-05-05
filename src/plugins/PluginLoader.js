const fs = require('fs');
const path = require('path');

class PluginLoader {
    constructor(pluginsPath) {
        this.pluginsPath = pluginsPath || path.join(__dirname);
        this.plugins = [];
    }

    loadPlugins() {
        try {
            const pluginFiles = fs.readdirSync(this.pluginsPath)
                .filter(file => file.endsWith('Plugin.js') && file !== 'PluginLoader.js');

            pluginFiles.forEach(file => {
                try {
                    const pluginPath = path.join(this.pluginsPath, file);
                    const PluginClass = require(pluginPath);
                    const plugin = new PluginClass();
                    this.plugins.push(plugin);
                    console.log(`Plugin chargé : ${file}`);
                } catch (pluginError) {
                    console.error(`Erreur de chargement du plugin ${file}:`, pluginError);
                }
            });
        } catch (error) {
            console.error('Erreur de chargement des plugins:', error);
        }
    }

    async initializePlugins(server) {
        for (const plugin of this.plugins) {
            if (typeof plugin.initialize === 'function') {
                try {
                    await plugin.initialize(server);
                } catch (error) {
                    console.error(`Erreur d'initialisation du plugin:`, error);
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
                    console.error(`Erreur d'enregistrement des actions du plugin:`, error);
                }
            }
        }
    }
}

module.exports = PluginLoader;