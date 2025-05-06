import fs from 'fs-extra';
import path from 'path';
import SystemMonitorLoggerPlugin from '../../src/plugins/system-monitor-logger';

describe('SystemMonitorLoggerPlugin', () => {
  const tempTestDir = path.join(__dirname, '../temp', 'system-monitor-logs');

  beforeAll(async () => {
    await fs.ensureDir(tempTestDir);
  });

  afterAll(async () => {
    await fs.remove(path.join(__dirname, '../temp'));
  });

  beforeEach(async () => {
    // Reset plugin configuration
    await SystemMonitorLoggerPlugin.initialize();
  });

  test('should initialize with default configuration', async () => {
    expect(SystemMonitorLoggerPlugin).toBeDefined();
  });

  test('should configure logging parameters', async () => {
    const result = await SystemMonitorLoggerPlugin.actions.configureLogging.execute({
      strategy: 'file',
      logFrequency: 30000,
      logDirectory: tempTestDir
    });

    expect(result.success).toBe(true);
    expect(result.strategy).toBe('file');
    expect(result.frequency).toBe(30000);
    expect(result.logDirectory).toBe(tempTestDir);
  });

  test('should get resource history', async () => {
    // Ensure some logs are generated
    await SystemMonitorLoggerPlugin.initialize({ 
      strategy: 'file', 
      logFrequency: 1000 
    });

    // Wait a bit to generate some logs
    await new Promise(resolve => setTimeout(resolve, 3000));

    const history = await SystemMonitorLoggerPlugin.actions.getResourceHistory.execute();
    
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    
    const log = history[0];
    expect(log).toHaveProperty('timestamp');
    expect(log).toHaveProperty('cpuUsage');
    expect(log).toHaveProperty('memoryUsage');
  });

  test('should export logs to file', async () => {
    // Ensure some logs are generated
    await SystemMonitorLoggerPlugin.initialize({ 
      strategy: 'file', 
      logDirectory: tempTestDir,
      logFrequency: 1000 
    });

    // Wait a bit to generate some logs
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Export JSON logs
    const jsonExport = await SystemMonitorLoggerPlugin.actions.exportLogs.execute({
      format: 'json'
    });

    expect(jsonExport.success).toBe(true);
    expect(jsonExport.filepath).toContain('.json');
    expect(jsonExport.logCount).toBeGreaterThan(0);

    // Verify file exists
    const jsonFileExists = await fs.pathExists(jsonExport.filepath);
    expect(jsonFileExists).toBe(true);

    // Export CSV logs
    const csvExport = await SystemMonitorLoggerPlugin.actions.exportLogs.execute({
      format: 'csv'
    });

    expect(csvExport.success).toBe(true);
    expect(csvExport.filepath).toContain('.csv');
    expect(csvExport.logCount).toBeGreaterThan(0);

    // Verify file exists
    const csvFileExists = await fs.pathExists(csvExport.filepath);
    expect(csvFileExists).toBe(true);
  });

  test('should handle different log time ranges', async () => {
    // Ensure some logs are generated
    await SystemMonitorLoggerPlugin.initialize({ 
      strategy: 'file', 
      logFrequency: 1000 
    });

    // Wait a bit to generate some logs
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get logs for last hour
    const hourLogs = await SystemMonitorLoggerPlugin.actions.getResourceHistory.execute({
      hours: 1
    });

    expect(Array.isArray(hourLogs)).toBe(true);
    expect(hourLogs.length).toBeGreaterThan(0);

    // Ensure export works with different time ranges
    const exportResult = await SystemMonitorLoggerPlugin.actions.exportLogs.execute({
      hours: 1,
      format: 'json'
    });

    expect(exportResult.success).toBe(true);
    expect(exportResult.logCount).toBeGreaterThan(0);
  });

  test('unload method should export final logs', async () => {
    // Ensure some logs are generated
    await SystemMonitorLoggerPlugin.initialize({ 
      strategy: 'file', 
      logDirectory: tempTestDir 
    });

    // Wait a bit to generate some logs
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Call unload method
    await SystemMonitorLoggerPlugin.unload();

    // Check that log files exist in the directory
    const logFiles = await fs.readdir(tempTestDir);
    expect(logFiles.length).toBeGreaterThan(0);
    expect(logFiles.some(file => file.startsWith('system_logs_') && file.endsWith('.json'))).toBe(true);
  });
});