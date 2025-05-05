const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor(configPath) {
        this.configPath = configPath;
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            const configFile = path.join(this.configPath, 'config.json');
            if (fs.existsSync(configFile)) {
                return JSON.parse(fs.readFileSync(configFile, 'utf-8'));
            }
            return this.createDefaultConfig();
        } catch (error) {
            console.error('Configuration loading error:', error);
            return this.createDefaultConfig();
        }
    }

    createDefaultConfig() {
        const defaultConfig = {
            version: '1.0.0',
            buttons: [],
            plugins: [],
            macros: []
        };
        this.saveConfig(defaultConfig);
        return defaultConfig;
    }

    saveConfig(config) {
        try {
            const configFile = path.join(this.configPath, 'config.json');
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        } catch (error) {
            console.error('Configuration saving error:', error);
        }
    }

    updateButton(buttonId, buttonConfig) {
        const buttonIndex = this.config.buttons.findIndex(b => b.id === buttonId);
        
        if (buttonIndex !== -1) {
            this.config.buttons[buttonIndex] = {
                ...this.config.buttons[buttonIndex],
                ...buttonConfig
            };
        } else {
            this.config.buttons.push(buttonConfig);
        }

        this.saveConfig(this.config);
    }

    getButton(buttonId) {
        return this.config.buttons.find(b => b.id === buttonId);
    }
}

module.exports = ConfigManager;