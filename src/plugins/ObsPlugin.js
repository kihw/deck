const OBSWebSocket = require('obs-websocket-js').default; // Ajout de .default

class ObsPlugin {
    constructor() {
        this.obs = new OBSWebSocket();
        this.connected = false;
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
        if (!this.connected) {
            console.warn('OBS Plugin non connecté. Impossible d\'enregistrer les actions.');
            return;
        }

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