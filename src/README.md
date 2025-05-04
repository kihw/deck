# Structure du Code Source

## Organisation des Dossiers

```
src/
├── server/              # Code serveur
│   ├── index.js         # Point d'entrée serveur
│   ├── routes/          # Routes Express
│   ├── websocket/       # Gestionnaires WebSocket
│   ├── actions/         # Exécuteurs d'actions
│   └── config/          # Configuration serveur
│
├── client/              # Code client
│   ├── index.html       # Page principale
│   ├── js/              # JavaScript client
│   │   ├── main.js      # Point d'entrée client
│   │   ├── websocket.js # Client WebSocket
│   │   └── ui.js        # Gestion interface
│   ├── css/             # Feuilles de style
│   └── assets/          # Images, icônes
│
└── shared/              # Code partagé
    ├── constants.js     # Constantes communes
    └── types.js         # Définitions de types
```

## Points d'Entrée

### Serveur (server/index.js)
```javascript
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Initialisation du serveur
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configuration et démarrage
require('./config/setup')(app, io);
httpServer.listen(3000);
```

### Client (client/js/main.js)
```javascript
// Connexion au serveur
const socket = io();

// Initialisation de l'interface
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  setupWebSocket(socket);
});
```

## Conventions de Code

### Nommage
- Fichiers : `kebab-case.js`
- Variables : `camelCase`
- Constantes : `UPPER_SNAKE_CASE`
- Classes : `PascalCase`

### Structure des Modules
```javascript
// Imports
const module = require('module');

// Constantes
const CONFIG = require('../config');

// Variables
let state = {};

// Fonctions
function initialize() { ... }

// Exports
module.exports = {
  initialize,
  state
};
```

## Développement

### Installation
```bash
npm install
```

### Démarrage en dev
```bash
npm run dev
```

### Build production
```bash
npm run build
```

## Tests

### Structure des tests
```
tests/
├── unit/               # Tests unitaires
├── integration/        # Tests d'intégration
└── e2e/                # Tests end-to-end
```

### Exécution
```bash
npm test
```

## Dépendances Clés

### Production
- `express` : Serveur HTTP
- `socket.io` : WebSocket en temps réel
- `cors` : Gestion CORS

### Développement
- `nodemon` : Auto-reload serveur
- `jest` : Tests
- `eslint` : Linting

## Bonnes Pratiques

1. Toujours valider les entrées utilisateur
2. Logger les erreurs importantes
3. Utiliser des constantes pour les valeurs magiques
4. Commenter le code complexe
5. Maintenir la séparation des préoccupations

## État Initial du Projet

- Structure de base créée
- Configuration initiale ajoutée
- Prêt pour le développement

La prochaine étape est d'implémenter le serveur basique et la communication WebSocket.