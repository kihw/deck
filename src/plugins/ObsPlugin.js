const BasePlugin = require('./BasePlugin');
const OBSWebSocket = require('obs-websocket-js').default;

class ObsPlugin extends BasePlugin {
    constructor() {
        super();
        this.obs = new OBSWebSocket();
    }

    async initialize(server) {
        // Check if OBS is configured
        const address = process.env.OBS_ADDRESS;
        
        if (!address) {
            // OBS is not configured - this is OK
            this.connected = false;
            return;
        }

        try {
            const password = process.env.OBS_PASSWORD || '';
            const url = `ws://${address}`;
            
            await this.obs.connect(url, password);
            
            this.connected = true;
            console.log('✅ OBS WebSocket connected');
        } catch (error) {
            // OBS connection failed - this is OK too
            this.connected = false;
            // Only log in development mode
            if (process.env.NODE_ENV === 'development') {
                console.log('ℹ️ OBS not available (optional)');
            }
        }
    }

    registerActions(actionRegistry) {
        // Only call super if connected
        if (this.connected) {
            super.registerActions(actionRegistry);
            
            actionRegistry.register('obs.toggleStream', async () => {
                try {
                    const streamStatus = await this.obs.call('GetStreamStatus');
                    await this.obs.call(streamStatus.outputActive ? 'StopStream' : 'StartStream');
                } catch (error) {
                    console.error('Error toggling OBS stream:', error);
                }
            });

            actionRegistry.register('obs.toggleRecording', async () => {
                try {
                    const recordStatus = await this.obs.call('GetRecordStatus');
                    await this.obs.call(recordStatus.outputActive ? 'StopRecord' : 'StartRecord');
                } catch (error) {
                    console.error('Error toggling OBS recording:', error);
                }
            });

            actionRegistry.register('obs.switchScene', async (sceneName) => {
                try {
                    await this.obs.call('SetCurrentProgramScene', { sceneName });
                } catch (error) {
                    console.error('Error switching OBS scene:', error);
                }
            });
        } else {
            // No need to call super.registerActions if not connected
            // This avoids the "ObsPlugin non connecté" message
        }
    }
}

module.exports = ObsPlugin;