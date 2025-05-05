const fs = require('fs');
const path = require('path');

class PluginLoader {
    constructor(pluginsPath) {
        this.pluginsPath = pluginsPath || path.join(__dirname);
        this.plugins = [];
        this.loadedPluginNames = [];
    }

    loadPlugins() {
        try {
            const pluginFiles = fs.readdirSync(this.pluginsPath)
                .filter(file => 
                    file.endsWith('Plugin.js') && 
                    file !== 'PluginLoader.js' && 
                    file !== 'BasePlugin.js'
                );

            pluginFiles.forEach(file => {
                try {
                    const pluginPath = path.join(this.pluginsPath, file);
                    const PluginClass = require(pluginPath);
                    const plugin = new PluginClass();
                    
                    if (plugin) {
                        this.plugins.push(plugin);
                        this.loadedPluginNames.push(file);
                        console.log(`✅ Plugin chargé : ${file}`);
                    }
                } catch (pluginError) {
                    console.error(`❌ Erreur de chargement du plugin ${file}:`, pluginError);
                }
            });

            console.log(`📦 Total plugins chargés : ${this.loadedPluginNames.length}`);
        } catch (error) {
            console.error('❌ Erreur globale de chargement des plugins:', error);
        }
    }

    async initializePlugins(server) {
        for (const plugin of this.plugins) {
            try {
                if (typeof plugin.initialize === 'function') {
                    await plugin.initialize(server);
                    console.log(`🚀 Plugin initialisé : ${plugin.constructor.name}`);
                } else {
                    console.warn(`⚠️ Méthode initialize manquante pour : ${plugin.constructor.name}`);
                }
            } catch (error) {
                console.error(`❌ Erreur d'initialisation du plugin ${plugin.constructor.name}:`, error);
            }
        }
    }

    registerPluginActions(actionRegistry) {
        for (const plugin of this.plugins) {
            try {
                if (typeof plugin.registerActions === 'function') {
                    plugin.registerActions(actionRegistry);
                    console.log(`🔧 Actions enregistrées pour : ${plugin.constructor.name}`);
                } else {
                    console.warn(`⚠️ Méthode registerActions manquante pour : ${plugin.constructor.name}`);
                }
            } catch (error) {
                console.error(`❌ Erreur d'enregistrement des actions du plugin ${plugin.constructor.name}:`, error);
            }
        }
    }
}

module.exports = PluginLoader;