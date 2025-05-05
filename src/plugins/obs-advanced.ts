import OBSWebSocket from 'obs-websocket-js';
import { Plugin, PluginAction } from './types';

interface OBSScene {
  name: string;
  sources: string[];
}

interface StreamStats {
  streaming: boolean;
  recording: boolean;
  currentScene: string;
  fps: number;
  droppedFrames: number;
}

class OBSAdvancedPlugin implements Plugin {
  metadata = {
    id: 'obs-advanced',
    name: 'OBS Advanced Control',
    version: '2.0.0',
    description: 'Comprehensive OBS Studio control and monitoring',
    author: 'Deck Team',
    requiredPermissions: ['obs_control', 'scene_management']
  };

  private obs: OBSWebSocket;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private autoDetectInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.obs = new OBSWebSocket();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.obs.on('ConnectionOpened', () => {
      this.connectionStatus = 'connected';
      console.log('OBS WebSocket connection established');
    });

    this.obs.on('ConnectionClosed', () => {
      this.connectionStatus = 'disconnected';
      console.log('OBS WebSocket connection closed');
    });
  }

  actions: Record<string, PluginAction> = {
    connect: {
      id: 'obs-connect',
      name: 'Connect to OBS',
      description: 'Establish connection with OBS WebSocket',
      async execute(context: { 
        address?: string, 
        password?: string 
      }) {
        try {
          const address = context.address || 'localhost:4444';
          await this.obs.connect({
            address,
            password: context.password || ''
          });
          return { 
            status: 'Connected', 
            address 
          };
        } catch (error) {
          throw new Error(`OBS connection failed: ${error.message}`);
        }
      }
    },

    switchScene: {
      id: 'switch-scene',
      name: 'Switch Scene',
      description: 'Change current OBS scene',
      async execute(context: { sceneName: string }) {
        try {
          await this.obs.call('SetCurrentProgramScene', { 
            sceneName: context.sceneName 
          });
          return { 
            status: 'Scene switched', 
            scene: context.sceneName 
          };
        } catch (error) {
          throw new Error(`Scene switch failed: ${error.message}`);
        }
      }
    },

    toggleStream: {
      id: 'toggle-stream',
      name: 'Toggle Streaming',
      description: 'Start or stop OBS streaming',
      async execute() {
        try {
          const streamStatus = await this.obs.call('GetStreamStatus');
          await this.obs.call(
            streamStatus.outputActive ? 'StopStream' : 'StartStream'
          );
          return { 
            status: streamStatus.outputActive ? 'Stopped' : 'Started' 
          };
        } catch (error) {
          throw new Error(`Stream toggle failed: ${error.message}`);
        }
      }
    },

    getStreamStats: {
      id: 'stream-stats',
      name: 'Get Stream Statistics',
      description: 'Retrieve current streaming statistics',
      async execute(): Promise<StreamStats> {
        try {
          const [streamStatus, recordStatus, currentScene] = await Promise.all([
            this.obs.call('GetStreamStatus'),
            this.obs.call('GetRecordStatus'),
            this.obs.call('GetCurrentProgramScene')
          ]);

          return {
            streaming: streamStatus.outputActive,
            recording: recordStatus.outputActive,
            currentScene: currentScene.currentProgramSceneName,
            fps: streamStatus.averageFrameRate,
            droppedFrames: streamStatus.droppedFrames
          };
        } catch (error) {
          throw new Error(`Failed to retrieve stream stats: ${error.message}`);
        }
      }
    },

    autoDetectScenes: {
      id: 'auto-detect-scenes',
      name: 'Auto Detect Scenes',
      description: 'Automatically discover and monitor OBS scenes',
      async execute(context: { 
        interval?: number, 
        callback?: (scenes: OBSScene[]) => void 
      }) {
        const interval = context.interval || 30000; // Default 30 seconds

        if (this.autoDetectInterval) {
          clearInterval(this.autoDetectInterval);
        }

        this.autoDetectInterval = setInterval(async () => {
          try {
            const sceneList = await this.obs.call('GetSceneList');
            const detailedScenes: OBSScene[] = await Promise.all(
              sceneList.scenes.map(async (scene) => {
                const sceneItems = await this.obs.call('GetSceneItemList', {
                  sceneName: scene.sceneName
                });

                return {
                  name: scene.sceneName,
                  sources: sceneItems.sceneItems.map(item => item.sourceName)
                };
              })
            );

            if (context.callback) {
              context.callback(detailedScenes);
            }
          } catch (error) {
            console.error('Scene auto-detection failed:', error);
          }
        }, interval);

        return { 
          status: 'Auto-detection started', 
          interval 
        };
      }
    }
  };

  helpers = {
    getConnectionStatus: () => this.connectionStatus,
    
    stopAutoDetection: () => {
      if (this.autoDetectInterval) {
        clearInterval(this.autoDetectInterval);
        this.autoDetectInterval = null;
      }
    }
  };

  async initialize(config?: Record<string, any>): Promise<void> {
    if (config?.autoConnect) {
      try {
        await this.actions.connect.execute({
          address: config.address,
          password: config.password
        });
      } catch (error) {
        console.error('Automatic OBS connection failed:', error);
      }
    }
  }

  async unload(): Promise<void> {
    if (this.connectionStatus === 'connected') {
      await this.obs.disconnect();
    }
    this.helpers.stopAutoDetection();
  }
}

export default new OBSAdvancedPlugin();
