import PluginManager from '../src/plugins/manager';
import ConfigManager from '../src/plugins/config-manager';
import { Plugin } from '../src/plugins/types';
import path from 'path';

describe('Plugin System', () => {
  let pluginManager: PluginManager;
  let configManager: ConfigManager;

  beforeEach(() => {
    pluginManager = new PluginManager(path.join(__dirname, '..', 'src', 'plugins'));
    configManager = new ConfigManager(path.join(__dirname, '..', 'src', 'config'));
  });

  test('should load default plugins', async () => {
    const plugins = await pluginManager.listPlugins();
    
    expect(plugins.length).toBeGreaterThan(0);
    
    const pluginNames = plugins.map(p => p.metadata.id);
    expect(pluginNames).toContain('system-monitor');
    expect(pluginNames).toContain('discord-integration');
  });

  test('should validate plugin configuration', async () => {
    const configs = await configManager.loadConfig();
    
    for (const [pluginId, config] of Object.entries(configs)) {
      expect(config).toHaveProperty('enabled');
      expect(typeof config.enabled).toBe('boolean');
      
      if (config.settings) {
        expect(typeof config.settings).toBe('object');
      }
    }
  });

  test('should initialize plugins with configuration', async () => {
    const mockPlugin: Plugin = {
      metadata: {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin'
      },
      actions: {
        testAction: {
          id: 'test-action',
          name: 'Test Action',
          async execute() {
            return { success: true };
          }
        }
      },
      async initialize(config) {
        // Simulate initialization with config
        if (config && config.enabled) {
          return Promise.resolve();
        }
        throw new Error('Plugin not enabled');
      }
    };

    await pluginManager.registerPlugin(mockPlugin);
    
    const config = await configManager.getPluginConfig('test-plugin');
    
    if (config.enabled) {
      await expect(mockPlugin.initialize(config.settings)).resolves.toBeUndefined();
    }
  });

  test('should handle plugin action execution', async () => {
    const systemMonitor = pluginManager.getPlugin('system-monitor');
    
    if (systemMonitor) {
      const cpuUsage = await systemMonitor.actions.getCPUUsage.execute();
      
      expect(cpuUsage).toHaveProperty('usage');
      expect(cpuUsage).toHaveProperty('cores');
      expect(typeof cpuUsage.usage).toBe('number');
      expect(typeof cpuUsage.cores).toBe('number');
    }
  });

  test('should validate plugin registration', async () => {
    const invalidPlugin = {
      // Missing required properties
      metadata: {
        name: 'Invalid Plugin'
      }
    };

    await expect(pluginManager.registerPlugin(invalidPlugin as Plugin)).rejects.toThrow();
  });

  test('should unload plugins gracefully', async () => {
    const systemMonitor = pluginManager.getPlugin('system-monitor');
    
    if (systemMonitor && systemMonitor.unload) {
      await expect(systemMonitor.unload()).resolves.not.toThrow();
    }
  });

  describe('Plugin Configuration Management', () => {
    test('should update plugin configuration', async () => {
      const pluginId = 'system-monitor';
      const originalConfig = await configManager.getPluginConfig(pluginId);
      
      const updatedConfig = {
        ...originalConfig,
        settings: {
          ...originalConfig.settings,
          autoStart: true,
          interval: 5000
        }
      };

      await configManager.saveConfig({
        [pluginId]: updatedConfig
      });

      const reloadedConfig = await configManager.getPluginConfig(pluginId);
      
      expect(reloadedConfig.settings?.autoStart).toBe(true);
      expect(reloadedConfig.settings?.interval).toBe(5000);
    });

    test('should validate configuration schema', async () => {
      const testConfig = {
        'system-monitor': {
          enabled: true,
          settings: {
            autoStart: true,
            interval: 5000,
            alertThresholds: {
              cpu: 80,
              memory: 90
            }
          }
        }
      };

      const isValid = await configManager.validateConfig(testConfig);
      expect(isValid).toBe(true);
    });
  });
});
