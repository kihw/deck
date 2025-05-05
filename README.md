# Deck - Stream Deck Virtuel

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-14%2B-brightgreen.svg)

**Deck** est une application qui transforme n'importe quel appareil en Stream Deck virtuel, accessible à distance via une interface web.

---

## 📋 Prérequis

- Node.js 14+ (https://nodejs.org/)
- Navigation web moderne
- Connexion réseau locale

---

## 🚀 Quick Start

### Sur Windows

```bash
# Téléchargez le projet
git clone https://github.com/kihw/deck.git
cd deck

# Double-cliquez sur install.bat ou exécutez dans PowerShell
.\install.bat

# Démarrage
deck start
```

### Sur Linux/macOS

```bash
# Installation
git clone https://github.com/kihw/deck.git
cd deck
chmod +x install.sh
./install.sh

# Démarrage
deck start
```

L'application sera accessible à l'adresse affichée dans le terminal (ex: http://192.168.1.100:3000)

---

## 📱 Utilisation

1. **Sur l'ordinateur principal :** Lancez `deck start`
2. **Sur les autres appareils :** Connectez-vous à l'URL affichée
3. **Authentification :** Entrez le code PIN affiché dans le terminal
4. **Partagez facilement :** Utilisez le QR code pour une connexion rapide

---

## 🌟 Fonctionnalités

### Principales

- ✨ **Interface Stream Deck virtuelle** accessible via web
- 📱 **Support multi-appareils** (PC, smartphone, tablette)
- 🔒 **Accès sécurisé** avec authentification PIN
- 🎨 **Interface responsive** adaptée à tous les écrans
- 🔄 **Communication temps réel** via WebSocket
- 📷 **QR Code** pour connexion rapide

### Avancées

- 🎯 **Macros** : Chaînez plusieurs actions dans un seul bouton
- 🎹 **Intégration d'APIs tierces** : OBS WebSocket, MIDI, Spotify, etc.
- 🔁 **Actions conditionnelles** : Changez dynamiquement le comportement des boutons
- 💡 **Retour visuel dynamique** : Boutons adaptatifs selon le contexte
- 🧠 **Intelligence contextuelle** : Boutons adaptatifs selon l'heure ou l'état du système
- 🔌 **Plugins personnalisables** : Étendez les fonctionnalités avec des scripts
- 📄 **Pages** : Organisez vos boutons en plusieurs pages pour une navigation simplifiée

### Actions Disponibles

- 🔊 Contrôle du volume (augmenter/diminuer)
- 📸 Capture d'écran
- 🌐 Ouverture du navigateur web/ Url
- ➕ Facile à étendre avec de nouvelles actions

---

## 🛠️ Technologies

- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Communication**: WebSocket pour temps réel

---

## 📁 Structure du Projet

```
deck/
├── src/
│   ├── index.js           # Point d'entrée
│   ├── server/            # Code serveur
│   │   ├── app.js         # Application principale
│   │   ├── config.js      # Configuration
│   │   ├── routes/        # API Routes
│   │   ├── services/      # Services (auth, actions)
│   │   └── websocket/     # Gestion WebSocket
│   └── client/
│       └── dist/          # Interface web
│           ├── index.html
│           ├── scripts/   # JavaScript client
│           └── styles/    # CSS
├── docs/                  # Documentation
├── install.sh             # Script d'installation (Linux/macOS)
├── install.bat            # Script d'installation (Windows)
└── package.json
```

---

## ⚙️ Configuration

Créez un fichier `.env` pour personnaliser :

```env
PORT=3000
HOST=0.0.0.0
PIN_LENGTH=4
MAX_CONNECTIONS=10
```

---

## 🔧 Développement

```bash
# Mode développement (avec auto-reload)
npm run dev

# Tests
npm test

# Build
npm run build
```

---

## 🐳 Docker

Pour utiliser Deck avec Docker :

```bash
# Construire et lancer
docker-compose up -d

# Accéder à l'application
http://localhost:3000
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les directives.

### Comment Contribuer

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 🐛 Signaler un Bug

Utilisez les [Issues](https://github.com/kihw/deck/issues) pour signaler des bugs ou proposer des améliorations.

---

## 📄 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Support

- 📮 Issues GitHub : [Issues](https://github.com/kihw/deck/issues)
- 📧 Email : contact@deck-project.com
- 💬 Discord : [Rejoindre le serveur](https://discord.gg/deck)

---

## 🙏 Remerciements

Merci à tous les contributeurs qui ont participé à ce projet !

---

Développé avec ❤️ pour la communauté streaming
