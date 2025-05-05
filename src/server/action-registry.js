class ActionRegistry {
    constructor() {
        this.actions = new Map();
    }

    register(actionName, actionHandler) {
        if (typeof actionHandler !== 'function') {
            throw new Error(`Action handler for ${actionName} must be a function`);
        }
        
        if (this.actions.has(actionName)) {
            console.warn(`Overwriting existing action: ${actionName}`);
        }
        
        this.actions.set(actionName, actionHandler);
        console.log(`Registered action: ${actionName}`);
    }

    getAction(actionName) {
        return this.actions.get(actionName);
    }

    executeAction(actionName, ...args) {
        const action = this.getAction(actionName);
        
        if (!action) {
            throw new Error(`Action not found: ${actionName}`);
        }
        
        return action(...args);
    }

    listActions() {
        return Array.from(this.actions.keys());
    }
}

module.exports = ActionRegistry;