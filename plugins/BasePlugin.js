/**
 * Abstract base class for deck plugins
 * Provides a standardized interface for plugin lifecycle and capabilities
 */
class BasePlugin {
    constructor(name, version) {
        if (this.constructor === BasePlugin) {
            throw new Error('BasePlugin is an abstract class and cannot be instantiated directly');
        }
        
        this.name = name;
        this.version = version;
        this.actions = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize the plugin
     * Must be overridden by child classes
     * @returns {Promise<void>}
     */
    async initialize() {
        throw new Error('initialize() method must be implemented');
    }

    /**
     * Unload and clean up plugin resources
     * @returns {Promise<void>}
     */
    async unload() {
        this.actions.clear();
        this.isInitialized = false;
    }

    /**
     * Register a new action for this plugin
     * @param {string} actionId Unique identifier for the action
     * @param {Function} actionHandler Function to execute the action
     */
    registerAction(actionId, actionHandler) {
        if (this.actions.has(actionId)) {
            throw new Error(`Action ${actionId} already exists in plugin ${this.name}`);
        }
        this.actions.set(actionId, actionHandler);
    }

    /**
     * Execute a registered action
     * @param {string} actionId 
     * @param {*} params 
     * @returns {Promise<any>}
     */
    async executeAction(actionId, ...params) {
        const action = this.actions.get(actionId);
        if (!action) {
            throw new Error(`Action ${actionId} not found in plugin ${this.name}`);
        }
        return await action(...params);
    }

    /**
     * Get all registered actions
     * @returns {Map} Map of action IDs to action handlers
     */
    getActions() {
        return this.actions;
    }
}

module.exports = BasePlugin;