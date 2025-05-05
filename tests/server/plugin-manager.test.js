const { 
  loadPlugins, 
  registerPlugin, 
  unregisterPlugin 
} = require('../../src/server/plugin-manager');

describe('Plugin Manager', () => {
  let initialPlugins;

  beforeAll(async () => {
    initialPlugins = await loadPlugins();
  });

  test('loadPlugins returns an array of plugins', async () => {
    expect(Array.isArray(initialPlugins)).toBe(true);
    expect(initialPlugins.length).toBeGreaterThan(0);
  });

  test('registerPlugin adds a new plugin', async () => {
    const mockPlugin = {
      name: 'testPlugin',
      execute: jest.fn()
    };

    await registerPlugin(mockPlugin);
    const updatedPlugins = await loadPlugins();
    
    const foundPlugin = updatedPlugins.find(p => p.name === 'testPlugin');
    expect(foundPlugin).toBeTruthy();
  });

  test('unregisterPlugin removes a plugin', async () => {
    const mockPlugin = {
      name: 'removablePlugin',
      execute: jest.fn()
    };

    await registerPlugin(mockPlugin);
    await unregisterPlugin('removablePlugin');

    const updatedPlugins = await loadPlugins();
    const foundPlugin = updatedPlugins.find(p => p.name === 'removablePlugin');
    
    expect(foundPlugin).toBeFalsy();
  });

  test('plugin has required methods', async () => {
    const plugins = await loadPlugins();
    plugins.forEach(plugin => {
      expect(plugin).toHaveProperty('name');
      expect(plugin).toHaveProperty('execute');
      expect(typeof plugin.execute).toBe('function');
    });
  });
});