# Plugin System Shortcuts

## 🎮 Présentation

Le plugin System Shortcuts permet d'exécuter des raccourcis clavier système sur plusieurs plateformes depuis l'interface Deck. Il fournit un ensemble de raccourcis prédéfinis et permet également de définir des raccourcis personnalisés.

## 🔧 Fonctionnalités

- Exécution de raccourcis clavier prédéfinis
- Ajout de raccourcis personnalisés
- Support multiplateforme (Windows, macOS, Linux)
- Envoi de séquences de touches arbitraires

## 📋 Raccourcis Prédéfinis

Le plugin inclut par défaut les raccourcis suivants :

| ID | Nom | Description | Windows | macOS | Linux |
|----|-----|-------------|---------|-------|-------|
| screenshot | Capture d'écran | Capture l'écran complet | PrintScreen | Cmd+Shift+3 | gnome-screenshot |
| lock-screen | Verrouiller | Verrouille la session | Win+L | Cmd+Ctrl+Q | Super+L |
| app-switcher | App Switcher | Bascule entre applications | Alt+Tab | Cmd+Tab | Alt+Tab |
| sleep | Veille | Mise en veille de l'ordinateur | - | - | - |

## 🛠️ Configuration

### Variables d'Environnement

Aucune variable d'environnement particulière n'est requise pour ce plugin.

### Configuration via `plugins.default.json`

```json
{
  "system-shortcuts": {
    "enabled": true,
    "settings": {
      "customShortcuts": {
        "my-shortcut": {
          "name": "Mon Raccourci",
          "description": "Description personnalisée",
          "windows": "commande Windows",
          "macos": "commande macOS",
          "linux": "commande Linux"
        }
      }
    }
  }
}
```

## 🧩 Actions Disponibles

### 1. Execute Shortcut

Exécute un raccourci prédéfini par son ID.

**Paramètres :**
- `shortcutId` (string) : Identifiant du raccourci à exécuter

**Exemple :**
```javascript
await SystemShortcutsPlugin.actions.executeShortcut.execute({
  shortcutId: 'screenshot'
});
```

### 2. Register Custom Shortcut

Enregistre un nouveau raccourci personnalisé.

**Paramètres :**
- `id` (string) : Identifiant unique du raccourci
- `name` (string) : Nom affichable du raccourci
- `description` (string, optionnel) : Description détaillée
- `windows` (string) : Commande à exécuter sous Windows
- `macos` (string) : Commande à exécuter sous macOS
- `linux` (string) : Commande à exécuter sous Linux

**Exemple :**
```javascript
await SystemShortcutsPlugin.actions.registerShortcut.execute({
  id: 'open-browser',
  name: 'Ouvrir Navigateur',
  description: 'Lance le navigateur par défaut',
  windows: 'start chrome',
  macos: 'open -a "Google Chrome"',
  linux: 'xdg-open https://www.google.com'
});
```

### 3. List Shortcuts

Liste tous les raccourcis disponibles.

**Paramètres :** Aucun

**Exemple :**
```javascript
const shortcuts = await SystemShortcutsPlugin.actions.listShortcuts.execute();
console.log(shortcuts);
```

### 4. Send Keys

Envoie une séquence de touches arbitraire au système.

**Paramètres :**
- `keys` (string) : Séquence de touches à envoyer

**Exemple :**
```javascript
await SystemShortcutsPlugin.actions.sendKeys.execute({
  keys: 'Hello, world!'
});
```

## 💻 Exemple d'Utilisation

### 1. Création d'un Bouton de Verrouillage d'Écran

```javascript
// Dans l'interface utilisateur
const lockButton = {
  id: 'lock-screen-button',
  label: '🔒',
  icon: '🔒',
  color: '#e74c3c',
  action: 'system-shortcuts.executeShortcut',
  params: {
    shortcutId: 'lock-screen'
  }
};
```

### 2. Ajout d'un Raccourci Personnalisé

```javascript
// Ajout d'un raccourci pour ouvrir un fichier
await pluginManager.executePluginAction(
  'system-shortcuts', 
  'registerShortcut', 
  {
    id: 'open-notes',
    name: 'Ouvrir Notes',
    description: 'Ouvre l\'application Notes',
    windows: 'start notepad',
    macos: 'open -a Notes',
    linux: 'gnome-text-editor'
  }
);
```

## 🔄 Compatibilité entre Plateformes

Le plugin détecte automatiquement le système d'exploitation et exécute la commande appropriée pour chaque raccourci. Cela permet une expérience transparente sur tous les systèmes d'exploitation pris en charge.

### Windows

Utilise PowerShell et la classe SendKeys pour émuler les événements clavier. Utilise également rundll32 pour certaines fonctions système.

### macOS

Utilise AppleScript et les outils système comme `screencapture` et `pmset` pour les actions système.

### Linux

Utilise des commandes comme `xdotool`, `gnome-screenshot` et les commandes dbus pour interagir avec le système.

## 📝 Notes de Développement

- Assurez-vous que les outils nécessaires sont installés sur chaque système (xdotool sur Linux, etc.)
- Certaines actions système peuvent nécessiter des droits d'administrateur
- Les commandes exactes peuvent varier selon la distribution Linux ou la version de l'OS

## 🛡️ Sécurité

Le plugin exécute des commandes système, ce qui peut présenter des risques de sécurité. Quelques précautions à prendre :

- Validez soigneusement les entrées utilisateur avant d'exécuter des commandes
- Limitez les commandes exécutables aux actions nécessaires
- Ne permettez pas l'exécution de commandes arbitraires sans validation

## ⚠️ Problèmes Connus

- Certaines combinaisons de touches complexes peuvent ne pas fonctionner correctement sur certaines plateformes
- L'exécution de certaines commandes peut être bloquée par les paramètres de sécurité du système
