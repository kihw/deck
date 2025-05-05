# Configuration du Serveur Deck

## Variables d'Environnement

Créez un fichier `.env` dans le dossier racine avec les variables suivantes :

```env
# Paramètres de base
PORT=3000
HOST=0.0.0.0

# Configuration d'authentification
PIN_LENGTH=4

# Limites de connexion
MAX_CONNECTIONS=10
SESSION_TIMEOUT=3600000

# Niveau de log
LOG_LEVEL=info
```

## Configuration des Actions

Le serveur est préconfiguré avec les actions suivantes :

- Volume Up/Down
- Capture d'écran
- Ouverture du navigateur

Pour ajouter des actions personnalisées, modifiez `src/server/services/actionManager.js`

## Ports Réseau

Le serveur utilise le port 3000 par défaut. Assurez-vous que ce port est ouvert sur votre réseau local.

## Remarques de Sécurité

- Le PIN est régénéré à chaque démarrage du serveur
- Les tokens de session expirent après 1 heure par défaut
- L'accès est limité au réseau local uniquement
