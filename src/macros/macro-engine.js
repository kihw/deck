class MacroEngine {
    constructor(actionRegistry) {
        this.actionRegistry = actionRegistry;
        this.macros = new Map();
    }

    createMacro(macroId, steps) {
        this.macros.set(macroId, {
            id: macroId,
            steps: steps.map(step => ({
                actionType: step.actionType,
                context: step.context || {},
                delay: step.delay || 0
            }))
        });
    }

    async executeMacro(macroId, context = {}) {
        const macro = this.macros.get(macroId);
        if (!macro) {
            throw new Error(`Macro ${macroId} not found`);
        }

        for (const step of macro.steps) {
            // Attendre le délai spécifié
            if (step.delay > 0) {
                await new Promise(resolve => setTimeout(resolve, step.delay));
            }

            try {
                await this.actionRegistry.execute(step.actionType, {
                    ...context,
                    ...step.context
                });
            } catch (error) {
                console.error(`Macro execution error:`, error);
                break;
            }
        }
    }

    listMacros() {
        return Array.from(this.macros.keys());
    }

    deleteMacro(macroId) {
        this.macros.delete(macroId);
    }

    getMacro(macroId) {
        return this.macros.get(macroId);
    }
}

module.exports = MacroEngine;