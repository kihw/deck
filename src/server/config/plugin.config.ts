import { Plugin, PluginMetadata, PluginAction } from '../models/plugin.model';

export class PluginConfig {
  static DEFAULT_PLUGINS: Plugin[] = [
    new Plugin('obs-control', {
      id: 'obs-control',
      name: 'OBS Studio Control',
      version: '1.0.0',
      description: 'Plugin pour contrôler OBS Studio',
      author: 'deck-team'
    }, [
      {
        name: 'toggle-stream',
        execute: async () => {
          // Logique de toggle stream OBS
          return { status: 'streaming' };
        }
      },
      {
        name: 'switch-scene',
        execute: async (sceneName: string) => {
          // Basculer vers une scène spécifique
          return { scene: sceneName };
        }
      }
    ])
  ];

  static getDefaultPlugins(): Plugin[] {
    return this.DEFAULT_PLUGINS;
  }
}