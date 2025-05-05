class ActionRegistry {
    constructor() {
        this.actions = new Map();
    }

    register(actionName, actionHandler) {
        if (typeof actionHandler !== 'function') {
            throw new Error(`Invalid action handler for ${actionName}`);
        }
        
        if (this.actions.has(actionName)) {
            console.warn(`Action ${actionName} is being overwritten`);
        }
        
        this.actions.set(actionName, actionHandler);
        console.log(`Registered action: ${actionName}`);
    }

    getAction(actionName) {
        const action = this.actions.get(actionName);
        if (!action) {
            throw new Error(`Action ${actionName} not found`);
        }
        return action;
    }

    listActions() {
        return Array.from(this.actions.keys());
    }

    async executeAction(actionName, ...args) {
        const action = this.getAction(actionName);
        try {
            return await action(...args);
        } catch (error) {
            console.error(`Error executing action ${actionName}:`, error);
            throw error;
        }
    }
}

module.exports = ActionRegistry;