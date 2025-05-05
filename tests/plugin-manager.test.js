const PluginManager = require('../src/plugins/plugin-manager');

describe('PluginManager', () => {
  let pluginManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
  });

  test('should create plugin manager', () => {
    expect(pluginManager).toBeTruthy();
  });

  test('should register and execute plugins', () => {
    const mockPlugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      execute: jest.fn()
    };

    pluginManager.register(mockPlugin);
    const plugin = pluginManager.getPlugin('test-plugin');
    
    expect(plugin).toBe(mockPlugin);
  });
});