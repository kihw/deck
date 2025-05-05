const fs = require('fs');
const path = require('path');

/**
 * Dynamic plugin loader for deck application
 */
class PluginLoader {
    constructor(pluginDirectory) {
        this.pluginDirectory = pluginDirectory;
        this.loadedPlugins = new Map();
    }

    /**
     * Load all plugins from the specified directory
     * @returns {Promise<void>}
     */
    async loadPlugins() {
        const pluginFiles = fs.readdirSync(this.pluginDirectory)
            .filter(file => file.endsWith('.js') && file !== 'BasePlugin.js' && file !== 'PluginLoader.js');

        for (const file of pluginFiles) {
            try {
                const pluginPath = path.join(this.pluginDirectory, file);
                const PluginClass = require(pluginPath);
                
                // Ensure the plugin extends BasePlugin
                if (!(PluginClass.prototype instanceof require('./BasePlugin'))) {
                    console.warn(`Plugin ${file} does not extend BasePlugin. Skipping.`);
                    continue;
                }

                const plugin = new PluginClass();
                await plugin.initialize();
                
                this.loadedPlugins.set(plugin.name, plugin);
                console.log(`Loaded plugin: ${plugin.name} (v${plugin.version})`);
            } catch (error) {
                console.error(`Error loading plugin ${file}:`, error);
            }
        }
    }

    /**
     * Get a loaded plugin by name
     * @param {string} pluginName 
     * @returns {BasePlugin|undefined}
     */
    getPlugin(pluginName) {
        return this.loadedPlugins.get(pluginName);
    }

    /**
     * Execute an action from a specific plugin
     * @param {string} pluginName 
     * @param {string} actionId 
     * @param  {...any} params 
     * @returns {Promise<any>}
     */
    async executePluginAction(pluginName, actionId, ...params) {
        const plugin = this.getPlugin(pluginName);
        if (!plugin) {
            throw new Error(`Plugin ${pluginName} not found`);
        }
        return await plugin.executeAction(actionId, ...params);
    }

    /**
     * Unload all plugins
     * @returns {Promise<void>}
     */
    async unloadPlugins() {
        for (const plugin of this.loadedPlugins.values()) {
            await plugin.unload();
        }
        this.loadedPlugins.clear();
    }

    /**
     * List all loaded plugins
     * @returns {Array<{name: string, version: string}>}
     */
    listPlugins() {
        return Array.from(this.loadedPlugins.values()).map(plugin => ({
            name: plugin.name,
            version: plugin.version
        }));
    }
}

module.exports = PluginLoader;