class PluginManager {
    constructor(pluginDir) {
        this.pluginDir = pluginDir;
        this.plugins = new Map();
        this.loadPlugins();
    }

    loadPlugins() {
        const pluginFiles = require('fs').readdirSync(this.pluginDir)
            .filter(file => file.endsWith('.js'));

        pluginFiles.forEach(file => {
            try {
                const Plugin = require(require('path').join(this.pluginDir, file));
                const pluginInstance = new Plugin();
                this.registerPlugin(pluginInstance);
            } catch (error) {
                console.error(`Plugin load error: ${file}`, error);
            }
        });
    }

    registerPlugin(plugin) {
        if (!plugin.id || !plugin.name) {
            throw new Error('Invalid plugin structure');
        }

        this.plugins.set(plugin.id, {
            instance: plugin,
            actions: plugin.getActions ? plugin.getActions() : [],
            triggers: plugin.getTriggers ? plugin.getTriggers() : []
        });
    }

    executePluginAction(pluginId, actionId, context) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) throw new Error(`Plugin ${pluginId} not found`);

        const action = plugin.actions.find(a => a.id === actionId);
        if (!action) throw new Error(`Action ${actionId} not found`);

        return action.execute(context);
    }
}

module.exports = PluginManager;