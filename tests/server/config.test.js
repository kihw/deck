const { 
  loadConfiguration, 
  saveConfiguration, 
  validateConfiguration 
} = require('../../src/server/config');

describe('Configuration Management', () => {
  const testConfig = {
    plugins: ['obs', 'midi'],
    actions: {
      streamToggle: { type: 'obs', action: 'toggleStream' }
    }
  };

  test('loadConfiguration returns valid config', () => {
    const config = loadConfiguration();
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  test('saveConfiguration saves config correctly', () => {
    saveConfiguration(testConfig);
    const loadedConfig = loadConfiguration();
    expect(loadedConfig).toEqual(testConfig);
  });

  test('validateConfiguration rejects invalid configs', () => {
    const invalidConfig = {
      plugins: 'not an array',
      actions: null
    };

    expect(() => validateConfiguration(invalidConfig)).toThrow();
  });

  test('validateConfiguration accepts valid configs', () => {
    expect(() => validateConfiguration(testConfig)).not.toThrow();
  });
});