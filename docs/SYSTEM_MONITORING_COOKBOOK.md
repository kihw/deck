# Cookbook de Monitoring Système Avancé

## 🚀 Scénario d'Utilisation : Surveillance Complète et Alertes Intelligentes

### Vue d'Ensemble

Dans ce scénario, nous allons démontrer comment les plugins Deck peuvent travailler ensemble pour créer un système de monitoring système complet et intelligent.

### Plugins Utilisés
- System Monitor
- System Monitor Logger
- System Monitor Alerts
- Discord Integration

### Configuration Globale

```typescript
const systemMonitorConfig = {
  systemMonitor: {
    enabled: true,
    interval: 5000, // Vérification toutes les 5 secondes
    logToFile: true
  },
  systemMonitorLogger: {
    strategy: 'file',
    logFrequency: 60000, // Logs toutes les minutes
    logDirectory: './logs/system-monitor'
  },
  systemMonitorAlerts: {
    cpuThreshold: 80,
    memoryThreshold: 90,
    alertChannelId: 'mon-canal-discord',
    alertInterval: 300000 // Attendre 5 minutes entre deux alertes
  },
  discordIntegration: {
    autoConnect: true,
    notificationPreferences: {
      systemAlerts: true
    }
  }
};
```

### Exemple de Script de Monitoring Intelligent

```typescript
import SystemMonitorPlugin from './plugins/system-monitor';
import SystemMonitorLoggerPlugin from './plugins/system-monitor-logger';
import SystemMonitorAlertsPlugin from './plugins/system-monitor-alerts';
import DiscordIntegrationPlugin from './plugins/discord-integration';

class SystemMonitoringOrchestrator {
  private systemMonitor: typeof SystemMonitorPlugin;
  private monitorLogger: typeof SystemMonitorLoggerPlugin;
  private monitorAlerts: typeof SystemMonitorAlertsPlugin;
  private discordIntegration: typeof DiscordIntegrationPlugin;

  constructor(config) {
    // Initialisation des plugins
    this.systemMonitor = SystemMonitorPlugin;
    this.monitorLogger = SystemMonitorLoggerPlugin;
    this.monitorAlerts = SystemMonitorAlertsPlugin;
    this.discordIntegration = DiscordIntegrationPlugin;

    // Configuration initiale
    this.initialize(config);
  }

  async initialize(config) {
    // Initialiser chaque plugin avec sa configuration
    await this.systemMonitor.initialize(config.systemMonitor);
    await this.monitorLogger.initialize(config.systemMonitorLogger);
    await this.monitorAlerts.initialize(config.systemMonitorAlerts);
    await this.discordIntegration.initialize(config.discordIntegration);

    // Démarrer la surveillance continue
    this.startContinuousMonitoring();
  }

  async startContinuousMonitoring() {
    // Démarrer les actions de surveillance
    await this.monitorAlerts.actions.startAlertMonitoring.execute();

    // Configuration d'un intervalle de vérification plus personnalisé
    setInterval(async () => {
      try {
        // Récupérer les métriques actuelles
        const cpuMetrics = await this.systemMonitor.actions.getCPUUsage.execute();
        const memoryMetrics = await this.systemMonitor.actions.getMemoryUsage.execute();

        // Journaliser les métriques
        await this.monitorLogger.actions.logSystemMetrics.execute({
          cpu: cpuMetrics,
          memory: memoryMetrics
        });

        // Vérifier les seuils et potentiellement déclencher des alertes
        const alertResult = await this.monitorAlerts.actions.checkResourceThresholds.execute();

        // Gestion des actions automatiques en cas de dépassement de seuils
        if (alertResult.alerts.cpu || alertResult.alerts.memory) {
          // Exemple d'action automatique : fermer des applications gourmandes
          await this.systemMonitor.actions.closeResourceHeavyApplications.execute();

          // Notification personnalisée
          const message = this.formatAdvancedNotification(
            alertResult.alerts.cpu, 
            alertResult.alerts.memory
          );

          await this.discordIntegration.actions.sendMessage.execute({
            channelId: config.systemMonitorAlerts.alertChannelId,
            message: message
          });
        }
      } catch (error) {
        console.error('Erreur durant le monitoring:', error);
      }
    }, config.systemMonitor.interval);
  }

  private formatAdvancedNotification(cpuAlert, memoryAlert) {
    let message = '🚨 **Alerte Système Avancée** 🚨\n\n';
    
    if (cpuAlert) {
      message += `⚠️ **Utilisation CPU Critique**\n`;
      message += `Utilisation actuelle: ${cpuAlert.usage}%\n`;
      message += `Action: Applications gourmandes fermées\n\n`;
    }

    if (memoryAlert) {
      message += `🧠 **Utilisation Mémoire Critique**\n`;
      message += `Utilisation actuelle: ${memoryAlert.usage}%\n`;
      message += `Action: Libération de mémoire en cours\n`;
    }

    return message;
  }
}

// Instanciation avec la configuration
const orchestrator = new SystemMonitoringOrchestrator(systemMonitorConfig);
```

## 🎯 Cas d'Utilisation Détaillés

### Scénario 1: Streaming Gaming
- Monitoring des ressources pendant le streaming
- Alertes Discord si le CPU/GPU approche des limites
- Fermeture automatique d'applications gourmandes
- Préservation des performances de streaming

### Scénario 2: Développement et Compilation
- Surveillance des ressources pendant des builds complexes
- Alertes en cas de consommation excessive
- Logs détaillés pour analyse post-build

### Scénario 3: Serveur Multi-Services
- Monitoring en temps réel des services critiques
- Alertes proactives avant saturation
- Journalisation complète pour analyse de performance

## 🔮 Améliorations Futures
- Machine Learning pour prédiction de charge
- Intégration avec plus de services de notification
- Recommandations automatiques d'optimisation

## 💡 Conseils de Configuration
- Ajustez les seuils selon votre configuration matérielle
- Personnalisez les actions automatiques
- Utilisez les logs pour amélioration continue
