class ActionRegistry {
    constructor() {
        this.actions = new Map();
        this.categories = new Map();
    }

    registerCategory(categoryId, categoryName) {
        if (!this.categories.has(categoryId)) {
            this.categories.set(categoryId, {
                id: categoryId,
                name: categoryName,
                actions: []
            });
        }
    }

    register(action) {
        if (!action.id || !action.name || !action.execute) {
            throw new Error('Invalid action structure');
        }

        this.actions.set(action.id, action);

        // Catégorisation automatique
        if (action.category) {
            const category = this.categories.get(action.category) || 
                { id: action.category, name: action.category, actions: [] };
            
            category.actions.push(action.id);
            this.categories.set(action.category, category);
        }
    }

    execute(actionId, context) {
        const action = this.actions.get(actionId);
        if (!action) {
            throw new Error(`Action ${actionId} not found`);
        }

        return action.execute(context);
    }

    getAction(actionId) {
        return this.actions.get(actionId);
    }

    listActions() {
        return Array.from(this.actions.keys());
    }

    listCategories() {
        return Array.from(this.categories.values());
    }
}

module.exports = new ActionRegistry();