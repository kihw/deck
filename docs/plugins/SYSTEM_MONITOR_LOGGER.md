# System Monitor Logger Plugin

## 🖥️ Overview

Le plugin System Monitor Logger offre une solution avancée de journalisation et de surveillance des ressources système. Il permet de suivre, enregistrer et analyser les performances et l'utilisation des ressources de votre système.

## ✨ Fonctionnalités Principales

- 📊 Surveillance en temps réel des ressources système
- 📁 Stratégies de journalisation flexibles
- 📈 Exportation de logs au format JSON et CSV
- 🔍 Historique configurable des ressources
- 🚨 Notifications potentielles basées sur des seuils

## 🔧 Configuration

### Paramètres Disponibles

```json
{
  "system-monitor-logger": {
    "enabled": true,
    "settings": {
      "strategy": "file",
      "logFrequency": 60000,
      "logDirectory": "./logs/system-monitor",
      "maxHistorySize": 1440,
      "exportFormat": "json"
    }
  }
}
```

### Paramètres Détaillés

- `enabled`: Active/désactive le plugin
- `strategy`: Méthode de journalisation (`file`, `database`, `remote`)
- `logFrequency`: Intervalle de journalisation en millisecondes
- `logDirectory`: Répertoire de stockage des logs
- `maxHistorySize`: Nombre maximum de logs conservés en mémoire
- `exportFormat`: Format d'exportation par défaut

## 🚀 Utilisation

### Initialisation

```typescript
// Configuration par défaut
await SystemMonitorLoggerPlugin.initialize();

// Configuration personnalisée
await SystemMonitorLoggerPlugin.initialize({
  strategy: 'file',
  logFrequency: 30000,
  logDirectory: '/path/to/custom/logs'
});
```

### Actions Disponibles

#### Configuration des Logs

```typescript
await SystemMonitorLoggerPlugin.actions.configureLogging.execute({
  strategy: 'file',
  logFrequency: 30000,
  logDirectory: '/path/to/logs'
});
```

#### Récupération de l'Historique

```typescript
// Obtenir l'historique des ressources
const resourceHistory = await SystemMonitorLoggerPlugin.actions.getResourceHistory.execute({
  hours: 1, // Historique des 1 dernières heures
  format: 'json' // Format de sortie
});
```

#### Exportation des Logs

```typescript
// Exporter les logs
const exportResult = await SystemMonitorLoggerPlugin.actions.exportLogs.execute({
  format: 'csv',  // Format de sortie
  hours: 1        // Logs des 1 dernières heures
});
```

## 🔍 Stratégies de Journalisation

### Fichier
- Enregistre les logs dans des fichiers locaux
- Configuration par défaut
- Facile à déboguer et à archiver

### Base de Données (Futur)
- Stockage structuré des logs
- Requêtes et analyses avancées
- Scalabilité améliorée

### Distant (Futur)
- Envoi des logs à un service distant
- Centralisation des logs
- Monitoring distribué

## 📊 Métriques Capturées

- Utilisation du CPU
- Utilisation de la mémoire
- (Futur) Utilisation du disque
- (Futur) Utilisation réseau

## 🛡️ Sécurité et Performance

- Limitation de la taille de l'historique en mémoire
- Gestion des ressources minimale
- Configuration flexible

## 🔮 Roadmap

- [ ] Support complet des bases de données
- [ ] Intégration de services de logs distants
- [ ] Alertes personnalisables
- [ ] Métriques de disque et réseau
- [ ] Visualisation des données

## 💡 Conseils d'Utilisation

- Ajustez la fréquence de journalisation selon vos besoins
- Surveillez l'espace disque lors de journalisations fréquentes
- Exportez régulièrement les logs pour l'analyse

## 🤝 Contribution

Suggestions et améliorations sont les bienvenues !
