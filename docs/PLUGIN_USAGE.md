# Guide d'Utilisation des Plugins Deck

## Introduction

Deck dispose d'un système de plugins puissant qui permet d'étendre les fonctionnalités de base. Ce guide explique comment utiliser, configurer et développer des plugins pour Deck.

## Plugins Intégrés

### 1. OBS Studio (OBS Advanced Plugin)

Ce plugin permet de contrôler OBS Studio via l'interface WebSocket.

#### Configuration

Dans votre fichier `.env` :

```
# OBS WebSocket
OBS_ADDRESS=localhost:4444
OBS_PASSWORD=votre_mot_de_passe
```

#### Actions Disponibles

- `Toggle Stream` : Démarre ou arrête le streaming en fonction de l'état actuel
- `Switch Scene` : Change la scène active dans OBS
- `Get Stream Stats` : Récupère les statistiques de streaming (FPS, dropped frames, etc.)
- `Auto Detect Scenes` : Détecte automatiquement les scènes disponibles

#### Exemple d'Utilisation

```javascript
// Dans le UI, associer un bouton à l'action 'Toggle Stream'
{
  buttonId: 'toggle-stream',
  label: '🎥',
  action: 'obs-advanced.toggleStream'
}
```

### 2. Spotify Control

Permet de contrôler Spotify via l'API officielle.

#### Configuration

Dans votre fichier `.env` :

```
# Spotify API
SPOTIFY_CLIENT_ID=votre_client_id
SPOTIFY_CLIENT_SECRET=votre_client_secret
```

#### Actions Disponibles

- `Play/Pause` : Lecture ou pause de la piste actuelle
- `Next Track` : Passe à la piste suivante
- `Previous Track` : Revient à la piste précédente
- `Create Playlist` : Crée une nouvelle playlist

### 3. Discord Integration

Intègre Discord pour envoyer des notifications et gérer un bot Discord.

#### Configuration

Dans votre fichier `.env` :

```
# Discord Bot
DISCORD_BOT_TOKEN=votre_token_bot
DISCORD_ALERT_CHANNEL_ID=id_canal_alertes
```

#### Actions Disponibles

- `Connect` : Connecte le bot Discord
- `Send Message` : Envoie un message à un canal spécifique
- `Set Status` : Modifie le statut du bot

### 4. Custom Notifications

Système de notification multi-canaux (Email, Slack, Discord).

#### Configuration

Dans votre fichier `.env` :

```
# Notification Preferences
NOTIFICATION_EMAIL=admin@example.com
NOTIFICATION_EMAIL_PASSWORD=mot_de_passe_email
NOTIFICATION_SLACK_WEBHOOK=https://hooks.slack.com/services/...
NOTIFICATION_DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
```

#### Actions Disponibles

- `Configure Notifications` : Configure les canaux de notification
- `Send Notification` : Envoie une notification via les canaux configurés

## Configuration des Plugins

### Via le fichier `plugins.default.json`

Tous les plugins sont configurables via le fichier `src/config/plugins.default.json` :

```json
{
  "plugin-id": {
    "enabled": true,
    "settings": {
      "option1": "valeur",
      "option2": 42
    }
  }
}
```

### Activation/Désactivation

Pour activer ou désactiver un plugin, modifiez la propriété `enabled` :

```json
{
  "obs-advanced": {
    "enabled": true
  },
  "spotify-control": {
    "enabled": false
  }
}
```

## Création de Boutons pour les Actions des Plugins

Dans l'interface utilisateur, vous pouvez associer des boutons aux actions des plugins :

1. Entrez en mode édition en cliquant sur "✎ Modifier"
2. Cliquez sur "+ Ajouter" pour créer un nouveau bouton
3. Donnez un nom et une icône au bouton
4. Dans le champ "Action", sélectionnez l'action du plugin (format : `plugin-id.actionName`)
5. Enregistrez le bouton

## Dépannage des Plugins

### Problèmes courants

1. **Plugin non chargé**
   - Vérifiez que le plugin est activé dans la configuration
   - Assurez-vous que toutes les dépendances sont installées

2. **Action non disponible**
   - Vérifiez que le plugin est correctement initialisé
   - Consultez les logs pour d'éventuelles erreurs

3. **Problèmes de connexion (OBS, Spotify, Discord)**
   - Vérifiez les informations de connexion dans le fichier `.env`
   - Assurez-vous que les services sont en cours d'exécution

### Logs des Plugins

Les logs des plugins sont disponibles dans le dossier `logs/` :
- `logs/combined.log` : Tous les logs
- `logs/error.log` : Uniquement les erreurs

## Développement de Plugins Personnalisés

Consultez le guide [PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md) pour apprendre à créer vos propres plugins.
