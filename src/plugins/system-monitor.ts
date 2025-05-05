import os from 'os';
import { Plugin, PluginAction } from './types';

class SystemMonitorPlugin implements Plugin {
  metadata = {
    id: 'system-monitor',
    name: 'System Monitor',
    version: '1.0.0',
    description: 'Monitor system resources and performance',
    author: 'Deck Team'
  };

  private monitorInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(data: SystemMetrics) => void> = new Set();

  actions: Record<string, PluginAction> = {
    getCPUUsage: {
      id: 'get-cpu-usage',
      name: 'Get CPU Usage',
      description: 'Retrieve current CPU usage percentage',
      async execute() {
        const cpus = os.cpus();
        const totalLoad = cpus.reduce((acc, cpu) => {
          const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
          const idle = cpu.times.idle;
          return acc + ((total - idle) / total * 100);
        }, 0);
        
        return {
          usage: totalLoad / cpus.length,
          cores: cpus.length
        };
      }
    },
    getMemoryUsage: {
      id: 'get-memory-usage',
      name: 'Get Memory Usage',
      description: 'Retrieve current memory usage',
      async execute() {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;

        return {
          total: this.formatBytes(totalMemory),
          used: this.formatBytes(usedMemory),
          free: this.formatBytes(freeMemory),
          percentUsed: (usedMemory / totalMemory) * 100
        };
      }
    },
    startContinuousMonitoring: {
      id: 'start-monitoring',
      name: 'Start Continuous Monitoring',
      description: 'Begin real-time system resource monitoring',
      async execute(context: { interval?: number } = {}) {
        const interval = context.interval || 5000; // Default 5 seconds

        if (this.monitorInterval) {
          clearInterval(this.monitorInterval);
        }

        this.monitorInterval = setInterval(async () => {
          const metrics = await this.collectSystemMetrics();
          this.listeners.forEach(listener => listener(metrics));
        }, interval);

        return { status: 'Monitoring started', interval };
      }
    },
    stopContinuousMonitoring: {
      id: 'stop-monitoring',
      name: 'Stop Continuous Monitoring',
      description: 'Stop real-time system resource monitoring',
      async execute() {
        if (this.monitorInterval) {
          clearInterval(this.monitorInterval);
          this.monitorInterval = null;
        }
        return { status: 'Monitoring stopped' };
      }
    }
  };

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const cpuUsage = await this.actions.getCPUUsage.execute();
    const memoryUsage = await this.actions.getMemoryUsage.execute();

    return {
      timestamp: new Date(),
      cpu: cpuUsage,
      memory: memoryUsage
    };
  }

  helpers = {
    addMetricsListener(callback: (data: SystemMetrics) => void) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }
  };

  async initialize(config?: Record<string, any>): Promise<void> {
    // Optional: Start monitoring based on config
    if (config?.autoStart) {
      await this.actions.startContinuousMonitoring.execute({
        interval: config.interval
      });
    }
  }

  async unload(): Promise<void> {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    this.listeners.clear();
  }
}

interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: string;
    used: string;
    free: string;
    percentUsed: number;
  };
}

export default new SystemMonitorPlugin();
