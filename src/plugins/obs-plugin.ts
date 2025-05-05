import OBSWebSocket from 'obs-websocket-js';

const obs = new OBSWebSocket();

export default {
  id: 'obs-control',
  name: 'OBS Control',
  version: '1.0.0',
  actions: {
    connect: async (params: { host: string, port: number, password?: string }) => {
      try {
        await obs.connect({
          address: `${params.host}:${params.port}`,
          password: params.password
        });
        return { success: true, message: 'Connecté à OBS' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    toggleStream: async () => {
      try {
        const streamStatus = await obs.call('GetStreamStatus');
        await obs.call(streamStatus.outputActive ? 'StopStream' : 'StartStream');
        return { success: true, streaming: !streamStatus.outputActive };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
    switchScene: async (sceneName: string) => {
      try {
        await obs.call('SetCurrentProgramScene', { sceneName });
        return { success: true, scene: sceneName };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  }
};