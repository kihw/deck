# System Monitor Alerts Plugin

## 🚨 Overview

Le plugin System Monitor Alerts offre une solution robuste de surveillance et de notification pour les ressources système critiques. Il permet de configurer des seuils personnalisés et d'envoyer des alertes via différents canaux.

## ✨ Fonctionnalités Principales

- 📊 Surveillance des ressources système en temps réel
- 🔔 Alertes personnalisables pour CPU, Mémoire, Disque, Réseau
- 🔗 Intégration multicanaux (Discord, etc.)
- ⏱️ Gestion intelligente de la fréquence des alertes

## 🔧 Configuration

### Paramètres Disponibles

```typescript
{
  "system-monitor-alerts": {
    "enabled": true,
    "settings": {
      "cpuThreshold": 80,
      "memoryThreshold": 90,
      "diskThreshold": 85,
      "networkThreshold": 70,
      "alertChannelId": "your-discord-channel-id",
      "alertInterval": 300000, // 5 minutes
      "autoStart": false
    }
  }
}
```

### Paramètres Détaillés

- `cpuThreshold`: Seuil de pourcentage d'utilisation du CPU
- `memoryThreshold`: Seuil de pourcentage d'utilisation de la mémoire
- `diskThreshold`: Seuil de pourcentage d'utilisation du disque
- `networkThreshold`: Seuil de pourcentage d'utilisation réseau
- `alertChannelId`: Canal de notification (ex: Discord)
- `alertInterval`: Délai minimal entre deux alertes du même type
- `autoStart`: Démarrage automatique de la surveillance

## 🚀 Utilisation

### Initialisation

```typescript
// Configuration par défaut
await SystemMonitorAlertsPlugin.initialize();

// Configuration personnalisée
await SystemMonitorAlertsPlugin.initialize({
  cpuThreshold: 75,
  memoryThreshold: 85,
  alertChannelId: 'discord-channel-id',
  autoStart: true
});
```

### Actions Disponibles

#### Configuration des Alertes

```typescript
// Configurer les seuils d'alerte
const result = await SystemMonitorAlertsPlugin.actions.configureAlerts.execute({
  cpuThreshold: 85,
  alertInterval: 600000 // 10 minutes
});
```

#### Démarrage de la Surveillance

```typescript
// Démarrer la surveillance des alertes
await SystemMonitorAlertsPlugin.actions.startAlertMonitoring.execute();
```

#### Vérification Manuelle des Seuils

```typescript
// Vérifier manuellement les seuils de ressources
const checkResult = await SystemMonitorAlertsPlugin.actions.checkResourceThresholds.execute();
```

## 🔍 Fonctionnement Détaillé

### Gestion Intelligente des Alertes

- Limitation de la fréquence des alertes
- Messages formatés avec des emojis
- Informations détaillées sur l'utilisation des ressources

### Exemple de Message d'Alerte

```
⚠️ 💻 High Resource Alert!
**CPU Usage Exceeded Threshold**
Current Usage: 85.42%
Threshold: 80%
Time: 2025-05-06 14:30:45
```

## 🔗 Intégrations

### Canaux de Notification

- Discord (intégré)
- (Futur) Slack
- (Futur) Email
- (Futur) Notifications système

## 🛡️ Sécurité et Performance

- Overhead minimal
- Configuration flexible
- Gestion des intervalles d'alerte

## 🔮 Roadmap

- [ ] Support de plus de canaux de notification
- [ ] Alertes personnalisables par type de ressource
- [ ] Historique et rapport des alertes
- [ ] Intégration avec des systèmes de surveillance avancés

## 💡 Conseils d'Utilisation

- Ajustez les seuils en fonction de votre configuration matérielle
- Utilisez l'intervalle d'alerte pour éviter le spam
- Combinez avec d'autres plugins pour des actions automatiques

## 🤝 Contribution

Suggestions et améliorations sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests.
