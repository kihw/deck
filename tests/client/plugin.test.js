import { PluginManager } from '../../src/client/services/plugin-manager';

describe('Frontend Plugin System', () => {
  let pluginManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
  });

  test('loads plugin correctly', () => {
    const mockPlugin = {
      name: 'test-plugin',
      init: jest.fn(),
      actions: ['action1', 'action2']
    };

    pluginManager.registerPlugin(mockPlugin);
    
    expect(pluginManager.getPlugin('test-plugin')).toBe(mockPlugin);
    expect(mockPlugin.init).toHaveBeenCalled();
  });

  test('executes plugin actions', () => {
    const mockAction = jest.fn();
    const mockPlugin = {
      name: 'obs-plugin',
      actions: {
        toggleStream: mockAction
      }
    };

    pluginManager.registerPlugin(mockPlugin);
    pluginManager.executeAction('obs-plugin', 'toggleStream');

    expect(mockAction).toHaveBeenCalled();
  });

  test('handles plugin errors gracefully', () => {
    const brokenPlugin = {
      name: 'broken-plugin',
      init: () => { throw new Error('Init failed'); }
    };

    expect(() => pluginManager.registerPlugin(brokenPlugin)).not.toThrow();
  });
});