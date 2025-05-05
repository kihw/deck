const BasePlugin = require('./BasePlugin');
const OBSWebSocket = require('obs-websocket-js').default;

class ObsPlugin extends BasePlugin {
    constructor() {
        super();
        this.obs = new OBSWebSocket();
    }

    async initialize(server) {
        try {
            // Correction du format de connexion - utilisant le format d'URL attendu
            // Format: "ws://address:port" ou "ws://address:port/password"
            const address = process.env.OBS_ADDRESS || 'localhost:4444';
            const password = process.env.OBS_PASSWORD || '';
            const url = `ws://${address}`;
            
            // Connexion avec l'URL appropriée et le mot de passe en option
            await this.obs.connect(url, password);
            
            this.connected = true;
            console.log('OBS WebSocket connecté');
        } catch (error) {
            console.error('Échec de connexion à OBS:', error);
            this.connected = false;
        }
    }

    registerActions(actionRegistry) {
        super.registerActions(actionRegistry);
        
        if (!this.connected) {
            console.log('ObsPlugin non connecté. Actions non enregistrées.');
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