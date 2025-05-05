# Deck - Stream Deck Virtuel Accessible à Distance 🚀

[![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)](https://github.com/kihw/deck)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Présentation

Deck est une application qui transforme n'importe quel appareil en Stream Deck virtuel accessible via une interface web. Contrôlez votre OBS, Spotify, Discord et plus encore, directement depuis votre téléphone ou tablette.

## 🚀 Démarrage Rapide

**Linux/macOS :**
```bash
# Installation
./install.sh

# Démarrage
./start.sh
```

**Windows :**
```
# Installation
install.bat

# Démarrage
start.bat
```

Une fois démarré, ouvrez l'URL affichée dans le terminal depuis n'importe quel appareil sur votre réseau.

## ✨ Fonctionnalités

- Interface web responsive accessible depuis n'importe quel appareil
- Système de plugins extensible
- Prise en charge d'OBS Studio, Spotify, Discord et plus
- Authentification par code PIN
- Personnalisation complète des boutons et actions

## 🔌 Système de Plugins

### Plugins inclus

- **OBS Advanced** : Contrôle complet d'OBS Studio
- **Spotify Control** : Gestion de la lecture et des playlists Spotify
- **Discord Integration** : Envoi de messages et gestion de bot Discord
- **Custom Notifications** : Système de notification multi-canaux
- **System Monitor** : Surveillance des ressources système

### Structure d'un Plugin

```typescript
interface Plugin {
  metadata: {
    id: string;
    name: string;
    version: string;
    description: string;
  };
  
  actions: {
    [actionName: string]: {
      execute(context?: any): Promise<any>;
      validate?(params: any): boolean;
    }
  };

  initialize(config?: any): Promise<void>;
  unload?(): Promise<void>;
}
```

## 🛠️ Configuration

### Variables d'Environnement

Créez un fichier `.env` dans le dossier racine :
```bash
# Server Configuration
PORT=3000
HOST=0.0.0.0

# Authentication
PIN_LENGTH=4   # Longueur du code PIN
PIN_CUSTOM=    # Code PIN personnalisé

# OBS WebSocket
OBS_ADDRESS=localhost:4444
OBS_PASSWORD=

# Spotify API
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

### Configuration des Plugins

Les plugins sont configurables via `src/config/plugins.default.json` :

```json
{
  "system-monitor": {
    "enabled": true,
    "settings": {
      "autoStart": false,
      "interval": 5000
    }
  }
}
```

## 📚 Documentation

- [Guide d'Utilisation des Plugins](docs/PLUGIN_USAGE.md)
- [Architecture du Système de Plugins](docs/PLUGIN_ARCHITECTURE.md)
- [Développement de Plugins](docs/PLUGIN_DEVELOPMENT.md)
- [Déploiement Docker](docs/DOCKER_DEPLOYMENT.md)

## 🔄 Cycle de Vie des Plugins

1. Chargement et enregistrement
2. Configuration et initialisation
3. Exécution des actions
4. Déchargement propre lors de l'arrêt

## 🛡️ Sécurité

- Authentification par code PIN
- Plugins en sandbox avec validation de configuration
- Vérification des permissions à l'exécution
- Mécanisme de chargement sécurisé

## 📋 Feuille de Route

- [ ] Marketplace de plugins
- [ ] Interface d'administration complète
- [ ] Support multi-utilisateurs
- [ ] Applications mobiles natives

## 🤝 Contribuer

1. Suivez l'interface de plugin standard
2. Écrivez des tests complets
3. Documentez votre code et vos fonctionnalités
4. Soumettez une pull request

## 📄 Licence

[MIT License](LICENSE)
