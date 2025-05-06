import fs from 'fs-extra';
import path from 'path';
import { Plugin, PluginAction } from '../plugins/types';

interface ResourceLog {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage?: number;
  networkUsage?: number;
}

class SystemMonitorLoggerPlugin implements Plugin {
  metadata = {
    id: 'system-monitor-logger',
    name: 'System Monitor Logger',
    version: '1.1.0',
    description: 'Advanced logging for system resources with configurable logging strategies',
    author: 'Deck Team'
  };

  private logDirectory: string;
  private logInterval: NodeJS.Timeout | null = null;
  private logStrategy: 'file' | 'database' | 'remote' = 'file';
  private logFrequency: number = 60000; // Default: 1 minute
  private resourceHistory: ResourceLog[] = [];
  private maxHistorySize: number = 1440; // 24 hours of logs at 1-minute intervals

  constructor() {
    // Default log directory
    this.logDirectory = path.join(process.cwd(), 'logs', 'system-monitor');
  }

  actions: Record<string, PluginAction> = {
    configureLogging: {
      id: 'configure-logging',
      name: 'Configure Logging',
      description: 'Set up logging parameters for system monitoring',
      async execute(context: {
        strategy?: 'file' | 'database' | 'remote';
        logFrequency?: number;
        logDirectory?: string;
      }) {
        if (context.strategy) {
          this.logStrategy = context.strategy;
        }

        if (context.logFrequency) {
          this.logFrequency = context.logFrequency;
        }

        if (context.logDirectory) {
          this.logDirectory = context.logDirectory;
        }

        // Recreate logging interval with new frequency
        if (this.logInterval) {
          clearInterval(this.logInterval);
        }
        this.startContinuousLogging();

        return {
          success: true,
          strategy: this.logStrategy,
          frequency: this.logFrequency,
          logDirectory: this.logDirectory
        };
      }
    },

    getResourceHistory: {
      id: 'get-resource-history',
      name: 'Get Resource History',
      description: 'Retrieve historical system resource logs',
      async execute(context?: { 
        hours?: number, 
        format?: 'json' | 'csv' 
      }) {
        const hours = context?.hours || 1;
        const format = context?.format || 'json';
        
        const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
        const filteredHistory = this.resourceHistory
          .filter(log => log.timestamp >= cutoffTime);

        if (format === 'csv') {
          return this.convertToCSV(filteredHistory);
        }

        return filteredHistory;
      }
    },

    exportLogs: {
      id: 'export-logs',
      name: 'Export Logs',
      description: 'Export system resource logs to a file',
      async execute(context?: { 
        format?: 'json' | 'csv', 
        hours?: number 
      }) {
        const format = context?.format || 'json';
        const hours = context?.hours || 1;

        await fs.ensureDir(this.logDirectory);

        const filename = `system_logs_${new Date().toISOString().replace(/:/g, '-')}.${format}`;
        const filepath = path.join(this.logDirectory, filename);

        const logs = await this.actions.getResourceHistory.execute({ 
          hours, 
          format 
        });

        await fs.writeFile(filepath, 
          format === 'json' 
            ? JSON.stringify(logs, null, 2) 
            : logs as string
        );

        return {
          success: true,
          filepath,
          format,
          logCount: Array.isArray(logs) ? logs.length : 0
        };
      }
    }
  };

  private async startContinuousLogging() {
    this.logInterval = setInterval(async () => {
      try {
        const cpuUsage = await this.getCPUUsage();
        const memoryUsage = await this.getMemoryUsage();

        const log: ResourceLog = {
          timestamp: new Date(),
          cpuUsage: cpuUsage.usage,
          memoryUsage: memoryUsage.percentUsed
        };

        // Log based on strategy
        switch (this.logStrategy) {
          case 'file':
            await this.logToFile(log);
            break;
          case 'database':
            await this.logToDatabase(log);
            break;
          case 'remote':
            await this.logToRemoteService(log);
            break;
        }

        // Maintain resource history
        this.resourceHistory.push(log);
        if (this.resourceHistory.length > this.maxHistorySize) {
          this.resourceHistory.shift(); // Remove oldest log
        }
      } catch (error) {
        console.error('System monitoring log error:', error);
      }
    }, this.logFrequency);
  }

  private async logToFile(log: ResourceLog) {
    const logFilePath = path.join(
      this.logDirectory, 
      `system_resources_${new Date().toISOString().split('T')[0]}.log`
    );
    
    await fs.ensureDir(this.logDirectory);
    await fs.appendFile(logFilePath, JSON.stringify(log) + '\n');
  }

  private async logToDatabase(log: ResourceLog) {
    // TODO: Implement database logging (e.g., MongoDB, SQLite)
    console.warn('Database logging not yet implemented');
  }

  private async logToRemoteService(log: ResourceLog) {
    // TODO: Implement remote logging service
    console.warn('Remote logging not yet implemented');
  }

  private async getCPUUsage() {
    const os = require('os');
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

  private async getMemoryUsage() {
    const os = require('os');
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

  private convertToCSV(logs: ResourceLog[]): string {
    const headers = 'Timestamp,CPU Usage,Memory Usage\n';
    const csvRows = logs.map(log => 
      `${log.timestamp.toISOString()},${log.cpuUsage},${log.memoryUsage}`
    );
    return headers + csvRows.join('\n');
  }

  async initialize(config?: Record<string, any>): Promise<void> {
    // Set configuration from initialization
    if (config) {
      await this.actions.configureLogging.execute(config);
    } else {
      // Start with default configuration
      this.startContinuousLogging();
    }
  }

  async unload(): Promise<void> {
    if (this.logInterval) {
      clearInterval(this.logInterval);
    }
    // Optional: Export final logs before unloading
    try {
      await this.actions.exportLogs.execute();
    } catch (error) {
      console.error('Error exporting logs during unload:', error);
    }
  }
}

export default new SystemMonitorLoggerPlugin();