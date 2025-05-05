# Guide d'Utilisation - Deck

## Installation et Premier Démarrage

### 1. Installation
```bash
git clone https://github.com/kihw/deck.git
cd deck
chmod +x install.sh
./install.sh
```

### 2. Lancement
```bash
deck start
```

Au démarrage, vous verrez :
```
🚀 Deck Server running on port 3000
📱 Access URL: http://192.168.1.100:3000
🔒 AUTH PIN: 1234
```

## Utilisation Basique

### 1. Connexion depuis un appareil distant

**a. Via navigateur** : Entrez l'URL affichée  
**b. Via QR Code** : Scannez le QR code affiché dans l'interface web

### 2. Authentification

Entrez le code PIN affiché dans le terminal sur l'ordinateur principal.

### 3. Utilisation des boutons

L'interface affiche par défaut :
- 🔊 **Volume +** : Augmente le volume du système
- 🔉 **Volume -** : Diminue le volume du système
- 📸 **Screenshot** : Prend une capture d'écran
- 🌐 **Browser** : Ouvre le navigateur web

Cliquez simplement sur un bouton pour exécuter l'action.

## Scénarios d'Utilisation

### 1. Streaming Multi-postes

**Situation** : Vous streamez depuis votre PC et voulez contrôler OBS depuis votre téléphone.

1. Lancez Deck sur votre PC principal
2. Connectez votre smartphone à l'URL affichée
3. Utilisez les boutons pour contrôler le volume pendant le live

### 2. Présentation Professionnelle

**Situation** : Vous faites une présentation et voulez changer les slides depuis votre tablette.

1. Démarrez Deck sur votre ordinateur
2. Connectez votre tablette
3. Utilisez les raccourcis clavier configurés pour naviguer dans les slides

### 3. Contrôle à Distance

**Situation** : Vous voulez contrôler votre ordinateur depuis votre canapé.

1. Lancez Deck sur votre PC
2. Utilisez votre smartphone ou tablette comme télécommande
3. Contrôlez le volume, ouvrez des applications, etc.

## Configuration Avancée

### Personnalisation du PIN

Par défaut, le PIN est généré aléatoirement. Pour un PIN fixe :

```env
# Dans votre fichier .env
PIN_CUSTOM=1234
```

### Modification des Actions

Créez un fichier `config/custom-actions.json` :

```json
{
  "buttons": [
    {
      "id": "obs-start",
      "label": "▶️ Start OBS",
      "type": "app",
      "action": "openApp",
      "params": {
        "app": "obs"
      }
    },
    {
      "id": "mute",
      "label": "🔇 Mute",
      "type": "system",
      "action": "mute"
    }
  ]
}
```

### Accès Hors Réseau Local

Pour un accès via internet (avec précaution) :

1. Configurez le port forwarding sur votre routeur (port 3000)
2. Utilisez un service de tunnel (ngrok, localtunnel)
3. Partagez l'URL générée avec prudence

## Dépannage

### Connexion Impossible

1. Vérifiez que les appareils sont sur le même réseau
2. Confirmez que le PORT 3000 est ouvert
3. Désactivez temporairement le pare-feu pour tester

### PIN Incorrect

Le PIN est affiché uniquement dans le terminal. Redémarrez Deck si besoin.

### Actions Non Exécutées

Certaines actions système peuvent nécessiter des privilèges administrateur.

## Bonnes Pratiques

1. **Sécurité** : Ne partagez l'URL que sur votre réseau local
2. **Performance** : Fermez les connexions inutilisées
3. **Compatibilité** : Utilisez des navigateurs modernes
4. **Latence** : Pour de meilleures performances, utilisez le WiFi 5GHz

## Support et Communauté

- GitHub Issues : [Signaler un problème](https://github.com/kihw/deck/issues)
- Discord : [Rejoindre la communauté](https://discord.gg/deck)
- Email : contact@deck-project.com

---

*Guide mis à jour pour Deck v1.0.0*