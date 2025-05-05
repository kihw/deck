import { ConfigManager } from '../../src/client/services/config-manager';

describe('Configuration Management', () => {
  let configManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  test('initializes with default configuration', () => {
    const config = configManager.getDefaultConfig();
    expect(config).toHaveProperty('theme');
    expect(config).toHaveProperty('plugins');
    expect(config.plugins).toBeInstanceOf(Array);
  });

  test('saves and loads configuration', () => {
    const testConfig = {
      theme: 'dark',
      plugins: ['obs', 'midi']
    };

    configManager.saveConfig(testConfig);
    const loadedConfig = configManager.loadConfig();

    expect(loadedConfig).toEqual(testConfig);
  });

  test('validates configuration schema', () => {
    const invalidConfig = { 
      theme: 123, 
      plugins: 'not-an-array' 
    };

    expect(() => configManager.validateConfig(invalidConfig)).toThrow();
  });
});