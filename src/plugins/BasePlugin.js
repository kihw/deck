class BasePlugin {
    constructor() {
        this.name = this.constructor.name;
        this.connected = false;
    }

    async initialize(server) {
        console.log(`✅ Plugin chargé : ${this.name}`);
    }

    registerActions(actionRegistry) {
        // This method should not be called directly from BasePlugin.
        // Each plugin should override this method and decide if and when to call super.
        // This avoids the annoying "non connecté" messages when plugins are optional.
    }
}

module.exports = BasePlugin;