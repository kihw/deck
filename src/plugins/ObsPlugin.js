const BasePlugin = require('./BasePlugin');
const OBSWebSocket = require('obs-websocket-js');

class ObsPlugin extends BasePlugin {
  constructor() {
    super('ObsPlugin', 'OBS Studio Integration');
    this.obs = new OBSWebSocket();
    this.connected = false;
  }

  async initialize() {
    super.initialize();
    try {
      // Connect to OBS WebSocket (configure host/port/password as needed)
      await this.obs.connect({ 
        address: 'localhost:4444', 
        password: 'your_obs_password' 
      });
      this.connected = true;
      console.log('Connected to OBS WebSocket');
    } catch (error) {
      console.error('Failed to connect to OBS:', error);
    }
  }

  async unload() {
    super.unload();
    if (this.connected) {
      await this.obs.disconnect();
      this.connected = false;
    }
  }

  registerActions() {
    return [
      {
        name: 'obs.toggleStream',
        handler: async () => {
          if (!this.connected) return { success: false, error: 'Not connected to OBS' };
          
          const streamStatus = await this.obs.call('GetStreamStatus');
          if (streamStatus.outputActive) {
            await this.obs.call('StopStream');
            return { success: true, message: 'Stream stopped' };
          } else {
            await this.obs.call('StartStream');
            return { success: true, message: 'Stream started' };
          }
        }
      },
      {
        name: 'obs.toggleRecording',
        handler: async () => {
          if (!this.connected) return { success: false, error: 'Not connected to OBS' };
          
          const recordStatus = await this.obs.call('GetRecordStatus');
          if (recordStatus.outputActive) {
            await this.obs.call('StopRecord');
            return { success: true, message: 'Recording stopped' };
          } else {
            await this.obs.call('StartRecord');
            return { success: true, message: 'Recording started' };
          }
        }
      }
    ];
  }

  registerListeners() {
    return {
      'StreamStarted': () => {
        console.log('OBS Stream Started');
      },
      'StreamStopped': () => {
        console.log('OBS Stream Stopped');
      }
    };
  }
}

module.exports = ObsPlugin;