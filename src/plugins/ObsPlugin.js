const BasePlugin = require('./BasePlugin');
const OBSWebSocket = require('obs-websocket-js').default;

class ObsPlugin extends BasePlugin {
    constructor() {
        super();
        this.obs = new OBSWebSocket();
    }

    async initialize(server) {
        try {
            await this.obs.connect({
                address: 'localhost:4444',
                password: process.env.OBS_PASSWORD || ''
            });
            this.connected = true;
            console.log('OBS WebSocket connecté');
        } catch (error) {
            console.error('Échec de connexion à OBS:', error);
            this.connected = false;
        }
    }

    registerActions(actionRegistry) {
        super.registerActions(actionRegistry);
        
        if (!this.connected) return;

        actionRegistry.register('obs.toggleStream', async () => {
            try {
                const streamStatus = await this.obs.call('GetStreamStatus');
                await this.obs.call(streamStatus.outputActive ? 'StopStream' : 'StartStream');
            } catch (error) {
                console.error('Erreur de toggle Stream:', error);
            }
        });
    }
}

module.exports = ObsPlugin;