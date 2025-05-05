const BasePlugin = require('./BasePlugin');
const OBSWebSocket = require('obs-websocket-js');

/**
 * OBS Studio Plugin for deck
 * Provides actions for controlling OBS via WebSocket
 */
class ObsPlugin extends BasePlugin {
    constructor() {
        super('ObsPlugin', '1.0.0');
        this.obs = new OBSWebSocket();
    }

    /**
     * Initialize OBS WebSocket connection
     */
    async initialize() {
        try {
            const { obsWebSocketVersion } = await this.obs.connect({
                address: process.env.OBS_WEBSOCKET_ADDRESS || 'localhost:4444',
                password: process.env.OBS_WEBSOCKET_PASSWORD || ''
            });

            console.log(`Connected to OBS WebSocket v${obsWebSocketVersion}`);

            // Register OBS-specific actions
            this.registerAction('toggleStream', this.toggleStream.bind(this));
            this.registerAction('toggleRecording', this.toggleRecording.bind(this));
            this.registerAction('switchScene', this.switchScene.bind(this));

            this.isInitialized = true;
        } catch (error) {
            console.error('OBS Plugin initialization failed:', error);
        }
    }

    /**
     * Toggle streaming on/off
     */
    async toggleStream() {
        try {
            const { outputActive } = await this.obs.call('ToggleStream');
            return { status: outputActive ? 'started' : 'stopped' };
        } catch (error) {
            console.error('Stream toggle failed:', error);
            throw error;
        }
    }

    /**
     * Toggle recording on/off
     */
    async toggleRecording() {
        try {
            const { outputActive } = await this.obs.call('ToggleRecord');
            return { status: outputActive ? 'started' : 'stopped' };
        } catch (error) {
            console.error('Recording toggle failed:', error);
            throw error;
        }
    }

    /**
     * Switch to a specific scene
     * @param {string} sceneName 
     */
    async switchScene(sceneName) {
        try {
            await this.obs.call('SetCurrentProgramScene', { sceneName });
            return { scene: sceneName, status: 'switched' };
        } catch (error) {
            console.error(`Scene switch to ${sceneName} failed:`, error);
            throw error;
        }
    }

    /**
     * Close WebSocket connection on unload
     */
    async unload() {
        try {
            await this.obs.disconnect();
            await super.unload();
        } catch (error) {
            console.error('OBS Plugin unload failed:', error);
        }
    }
}

module.exports = ObsPlugin;