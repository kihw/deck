import { Plugin, PluginAction } from './types';
import SystemMonitorLoggerPlugin from './system-monitor-logger';
import DiscordIntegrationPlugin from './discord-integration';

interface AlertConfig {
  cpuThreshold?: number;
  memoryThreshold?: number;
  diskThreshold?: number;
  networkThreshold?: number;
  alertChannelId?: string;
  alertInterval?: number;
}

class SystemMonitorAlertsPlugin implements Plugin {
  metadata = {
    id: 'system-monitor-alerts',
    name: 'System Monitor Alerts',
    version: '1.0.0',
    description: 'Advanced system resource monitoring with cross-plugin alerting',
    author: 'Deck Team'
  };

  private alertConfig: AlertConfig = {
    cpuThreshold: 80,
    memoryThreshold: 90,
    diskThreshold: 85,
    networkThreshold: 70,
    alertInterval: 300000 // 5 minutes
  };

  private lastAlertTimestamp: { 
    cpu?: number; 
    memory?: number; 
    disk?: number; 
    network?: number; 
  } = {};

  actions: Record<string, PluginAction> = {
    configureAlerts: {
      id: 'configure-alerts',
      name: 'Configure System Alerts',
      description: 'Set up alert thresholds and notification settings',
      async execute(context: AlertConfig) {
        // Merge provided configuration with existing config
        this.alertConfig = { ...this.alertConfig, ...context };
        
        return {
          success: true,
          config: this.alertConfig
        };
      }
    },

    startAlertMonitoring: {
      id: 'start-alert-monitoring',
      name: 'Start Alert Monitoring',
      description: 'Begin monitoring system resources and sending alerts',
      async execute() {
        try {
          // Start periodic monitoring
          setInterval(async () => {
            await this.checkResourceThresholds();
          }, this.alertConfig.alertInterval);

          return {
            success: true,
            message: 'Alert monitoring started'
          };
        } catch (error) {
          console.error('Failed to start alert monitoring:', error);
          return {
            success: false,
            error: error.message
          };
        }
      }
    },

    checkResourceThresholds: {
      id: 'check-resource-thresholds',
      name: 'Check Resource Thresholds',
      description: 'Manually check system resource thresholds and send alerts',
      async execute() {
        return this.checkResourceThresholds();
      }
    }
  };

  private async checkResourceThresholds() {
    const now = Date.now();
    const alertResults: any = {};

    // Fetch system metrics from SystemMonitorLoggerPlugin
    const cpuUsage = await SystemMonitorLoggerPlugin.actions.getCPUUsage.execute();
    const memoryUsage = await SystemMonitorLoggerPlugin.actions.getMemoryUsage.execute();

    // Check CPU threshold
    if (cpuUsage.usage > (this.alertConfig.cpuThreshold || 80)) {
      alertResults.cpu = await this.sendAlert({
        type: 'cpu',
        usage: cpuUsage.usage,
        threshold: this.alertConfig.cpuThreshold || 80
      });
    }

    // Check Memory threshold
    if (memoryUsage.percentUsed > (this.alertConfig.memoryThreshold || 90)) {
      alertResults.memory = await this.sendAlert({
        type: 'memory',
        usage: memoryUsage.percentUsed,
        threshold: this.alertConfig.memoryThreshold || 90
      });
    }

    // Optional: Add more resource checks (disk, network)
    // These would require additional plugin or system method implementations

    return {
      success: true,
      alerts: alertResults
    };
  }

  private async sendAlert(alertDetails: {
    type: 'cpu' | 'memory' | 'disk' | 'network';
    usage: number;
    threshold: number;
  }) {
    // Check if enough time has passed since last alert of this type
    const now = Date.now();
    const lastAlertTime = this.lastAlertTimestamp[alertDetails.type] || 0;
    
    if (now - lastAlertTime < (this.alertConfig.alertInterval || 300000)) {
      return { skipped: true, reason: 'Alert interval not elapsed' };
    }

    try {
      // Send alert via Discord if plugin and channel are configured
      const alertMessage = this.formatAlertMessage(alertDetails);
      
      if (this.alertConfig.alertChannelId) {
        await DiscordIntegrationPlugin.actions.sendMessage.execute({
          channelId: this.alertConfig.alertChannelId,
          message: alertMessage
        });
      }

      // Update last alert timestamp
      this.lastAlertTimestamp[alertDetails.type] = now;

      return {
        sent: true,
        message: alertMessage
      };
    } catch (error) {
      console.error(`Failed to send ${alertDetails.type} alert:`, error);
      return {
        sent: false,
        error: error.message
      };
    }
  }

  private formatAlertMessage(alertDetails: {
    type: 'cpu' | 'memory' | 'disk' | 'network';
    usage: number;
    threshold: number;
  }): string {
    const icons = {
      cpu: '💻',
      memory: '🧠',
      disk: '💾',
      network: '🌐'
    };

    return `⚠️ ${icons[alertDetails.type]} High Resource Alert!
**${alertDetails.type.toUpperCase()} Usage Exceeded Threshold**
Current Usage: ${alertDetails.usage.toFixed(2)}%
Threshold: ${alertDetails.threshold}%
Time: ${new Date().toLocaleString()}`;
  }

  async initialize(config?: Record<string, any>): Promise<void> {
    // Configure alerts from initialization config
    if (config) {
      await this.actions.configureAlerts.execute(config);
    }

    // Start alert monitoring if enabled
    if (config?.autoStart) {
      await this.actions.startAlertMonitoring.execute();
    }
  }

  async unload(): Promise<void> {
    // Clear any ongoing monitoring intervals
    // This would typically be handled by the timer management in the plugin system
  }
}

export default new SystemMonitorAlertsPlugin();