class BasePlugin {
    constructor() {
        this.name = this.constructor.name;
        this.connected = false;
    }

    async initialize(server) {
        console.log(`Initialisation de base pour ${this.name}`);
        this.connected = true;
    }

    registerActions(actionRegistry) {
        if (!this.connected) {
            console.warn(`${this.name} non connecté. Actions non enregistrées.`);
            return;
        }
        console.log(`Aucune action spécifique pour ${this.name}`);
    }
}

module.exports = BasePlugin;