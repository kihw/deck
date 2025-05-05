const OBSWebSocket = require('obs-websocket-js');

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
            console.log('OBS WebSocket connected successfully');
        } catch (error) {
            console.error('Failed to connect to OBS WebSocket:', error);
            this.connected = false;
        }
    }

    registerActions(actionRegistry) {
        if (!this.connected) {
            console.warn('OBS Plugin not connected. Skipping action registration.');
            return;
        }

        actionRegistry.register('obs.toggleStream', async () => {
            try {
                const streamStatus = await this.obs.call('GetStreamStatus');
                await this.obs.call(streamStatus.outputActive ? 'StopStream' : 'StartStream');
            } catch (error) {
                console.error('OBS Stream Toggle Error:', error);
            }
        });

        actionRegistry.register('obs.toggleRecord', async () => {
            try {
                const recordStatus = await this.obs.call('GetRecordStatus');
                await this.obs.call(recordStatus.outputActive ? 'StopRecord' : 'StartRecord');
            } catch (error) {
                console.error('OBS Record Toggle Error:', error);
            }
        });
    }
}

module.exports = ObsPlugin;