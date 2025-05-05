const PluginManager = require('../src/plugins/plugin-manager');
const path = require('path');

describe('PluginManager', () => {
  let pluginManager;
  const mockPluginDir = path.join(__dirname, '__mocks__', 'plugins');

  beforeEach(() => {
    // Mock plugin directory avec des plugins de test
    pluginManager = new PluginManager(mockPluginDir);
  });

  test('should load plugins correctly', () => {
    expect(pluginManager.plugins.size).toBeGreaterThan(0);
  });

  test('should retrieve plugin by ID', () => {
    const spotifyPlugin = pluginManager.getPlugin('spotify');
    expect(spotifyPlugin).toBeDefined();
    expect(spotifyPlugin.name).toBe('Spotify Plugin');
  });

  test('should execute plugin actions', () => {
    const spotifyPlugin = pluginManager.getPlugin('spotify');
    const playAction = spotifyPlugin.actions.find(a => a.id === 'play-pause');
    
    expect(playAction).toBeDefined();
    expect(typeof playAction.execute).toBe('function');
  });
});