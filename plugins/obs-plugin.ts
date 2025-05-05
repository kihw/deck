export default {
  id: 'obs-control',
  name: 'OBS Control',
  version: '1.0.0',
  actions: {
    toggleStream: () => {
      // Logique de toggle stream OBS
      console.log('Toggling OBS Stream');
    },
    switchScene: (sceneName: string) => {
      // Logique de changement de scène
      console.log(`Switching to scene: ${sceneName}`);
    }
  }
};