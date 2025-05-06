import SystemMonitorAlertsPlugin from '../../src/plugins/system-monitor-alerts';
import SystemMonitorLoggerPlugin from '../../src/plugins/system-monitor-logger';
import DiscordIntegrationPlugin from '../../src/plugins/discord-integration';

describe('SystemMonitorAlertsPlugin', () => {
  beforeEach(async () => {
    // Reset plugin configuration before each test
    await SystemMonitorAlertsPlugin.initialize();
  });

  test('should initialize with default configuration', async () => {
    expect(SystemMonitorAlertsPlugin).toBeDefined();
    
    const config = await SystemMonitorAlertsPlugin.actions.configureAlerts.execute({});
    expect(config.success).toBe(true);
    expect(config.config).toHaveProperty('cpuThreshold', 80);
    expect(config.config).toHaveProperty('memoryThreshold', 90);
  });

  test('should configure custom alert thresholds', async () => {
    const customConfig = {
      cpuThreshold: 75,
      memoryThreshold: 85,
      alertInterval: 600000 // 10 minutes
    };

    const result = await SystemMonitorAlertsPlugin.actions.configureAlerts.execute(customConfig);
    
    expect(result.success).toBe(true);
    expect(result.config.cpuThreshold).toBe(75);
    expect(result.config.memoryThreshold).toBe(85);
    expect(result.config.alertInterval).toBe(600000);
  });

  test('should check resource thresholds', async () => {
    // Mock system monitor logger to return predictable values
    jest.spyOn(SystemMonitorLoggerPlugin.actions.getCPUUsage, 'execute')
      .mockResolvedValue({ usage: 85, cores: 8 });
    
    jest.spyOn(SystemMonitorLoggerPlugin.actions.getMemoryUsage, 'execute')
      .mockResolvedValue({ 
        total: '16 GB', 
        used: '12 GB', 
        free: '4 GB', 
        percentUsed: 95 
      });

    // Mock Discord send message to track alerts
    const mockSendMessage = jest.fn().mockResolvedValue({ success: true });
    jest.spyOn(DiscordIntegrationPlugin.actions.sendMessage, 'execute')
      .mockImplementation(mockSendMessage);

    // Configure a lower threshold to trigger alerts
    await SystemMonitorAlertsPlugin.actions.configureAlerts.execute({
      cpuThreshold: 80,
      memoryThreshold: 90,
      alertChannelId: 'test-channel'
    });

    const result = await SystemMonitorAlertsPlugin.actions.checkResourceThresholds.execute();
    
    expect(result.success).toBe(true);
    
    // Verify Discord alerts were sent
    expect(mockSendMessage).toHaveBeenCalledTimes(2); // CPU and Memory alerts
    
    // Check CPU alert
    const cpuAlertCall = mockSendMessage.mock.calls.find(
      call => call[0].message.includes('CPU Usage Exceeded Threshold')
    );
    expect(cpuAlertCall).toBeTruthy();
    
    // Check Memory alert
    const memoryAlertCall = mockSendMessage.mock.calls.find(
      call => call[0].message.includes('Memory Usage Exceeded Threshold')
    );
    expect(memoryAlertCall).toBeTruthy();
  });

  test('should respect alert interval', async () => {
    // Mock system monitor logger to consistently return high usage
    jest.spyOn(SystemMonitorLoggerPlugin.actions.getCPUUsage, 'execute')
      .mockResolvedValue({ usage: 85, cores: 8 });
    
    jest.spyOn(SystemMonitorLoggerPlugin.actions.getMemoryUsage, 'execute')
      .mockResolvedValue({ 
        total: '16 GB', 
        used: '12 GB', 
        free: '4 GB', 
        percentUsed: 95 
      });

    // Mock Discord send message
    const mockSendMessage = jest.fn().mockResolvedValue({ success: true });
    jest.spyOn(DiscordIntegrationPlugin.actions.sendMessage, 'execute')
      .mockImplementation(mockSendMessage);

    // Configure with a long alert interval
    await SystemMonitorAlertsPlugin.actions.configureAlerts.execute({
      cpuThreshold: 80,
      memoryThreshold: 90,
      alertChannelId: 'test-channel',
      alertInterval: 600000 // 10 minutes
    });

    // First check should send alerts
    await SystemMonitorAlertsPlugin.actions.checkResourceThresholds.execute();
    expect(mockSendMessage).toHaveBeenCalledTimes(2);

    // Reset mock
    mockSendMessage.mockClear();

    // Second check should not send alerts due to interval
    const result = await SystemMonitorAlertsPlugin.actions.checkResourceThresholds.execute();
    expect(mockSendMessage).toHaveBeenCalledTimes(0);
  });

  test('should start alert monitoring', async () => {
    // Mock interval methods
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    
    // Start monitoring
    const result = await SystemMonitorAlertsPlugin.actions.startAlertMonitoring.execute();
    
    expect(result.success).toBe(true);
    expect(setIntervalSpy).toHaveBeenCalled();
  });

  test('should format alert messages correctly', async () => {
    // Mock system monitor logger
    jest.spyOn(SystemMonitorLoggerPlugin.actions.getCPUUsage, 'execute')
      .mockResolvedValue({ usage: 85, cores: 8 });

    // Mock Discord send message to track alerts
    const mockSendMessage = jest.fn().mockResolvedValue({ success: true });
    jest.spyOn(DiscordIntegrationPlugin.actions.sendMessage, 'execute')
      .mockImplementation(mockSendMessage);

    // Configure alerts
    await SystemMonitorAlertsPlugin.actions.configureAlerts.execute({
      cpuThreshold: 80,
      alertChannelId: 'test-channel'
    });

    // Trigger alert
    await SystemMonitorAlertsPlugin.actions.checkResourceThresholds.execute();

    // Verify message format
    const sentMessage = mockSendMessage.mock.calls[0][0].message;
    
    expect(sentMessage).toContain('⚠️');
    expect(sentMessage).toContain('💻');
    expect(sentMessage).toContain('CPU Usage Exceeded Threshold');
    expect(sentMessage).toContain('Current Usage: 85.00%');
    expect(sentMessage).toContain('Threshold: 80%');
    expect(sentMessage).toMatch(/Time: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
  });
});
