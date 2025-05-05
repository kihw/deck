const OBSWebSocket = require('obs-websocket-js');

class ObsPlugin {
    constructor() {
        this.obs = new OBSWebSocket();
    }

    async initialize(server) {
        try {
            await this.obs.connect({
                address: 'localhost:4444',
                password: '' // Optional OBS WebSocket password
            });
            console.log('OBS WebSocket connected');
        } catch (error) {
            console.error('Failed to connect to OBS:', error);
        }
    }

    registerActions(actionRegistry) {
        actionRegistry.register('obs.toggleStream', async () => {
            try {
                const streamStatus = await this.obs.call('GetStreamStatus');
                await this.obs.call(streamStatus.outputActive ? 'StopStream' : 'StartStream');
            } catch (error) {
                console.error('OBS Stream Toggle Error:', error);
            }
        });
    }
}

module.exports = ObsPlugin;