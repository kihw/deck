const { executeAction } = require('../../src/server/actions');
const { loadPlugins } = require('../../src/server/plugin-manager');

describe('Server Actions', () => {
  let plugins;

  beforeAll(async () => {
    plugins = await loadPlugins();
  });

  test('executeAction should call correct plugin method', async () => {
    const mockPlugin = {
      execute: jest.fn()
    };
    plugins.push(mockPlugin);

    await executeAction('testAction', { data: 'test' });
    
    expect(mockPlugin.execute).toHaveBeenCalledWith('testAction', { data: 'test' });
  });

  test('executeAction handles unknown actions gracefully', async () => {
    const result = await executeAction('unknownAction', {});
    expect(result).toEqual({ status: 'error', message: 'Action not found' });
  });

  test('executeAction supports multiple plugin execution', async () => {
    const plugin1 = { execute: jest.fn() };
    const plugin2 = { execute: jest.fn() };
    plugins.push(plugin1, plugin2);

    await executeAction('multiPluginAction', { data: 'test' });
    
    expect(plugin1.execute).toHaveBeenCalled();
    expect(plugin2.execute).toHaveBeenCalled();
  });
});