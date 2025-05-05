# Plugin Icon Manager

## 🖼️ Présentation

Le plugin Icon Manager permet de gérer les icônes et images utilisées pour personnaliser les boutons de votre Stream Deck virtuel. Il offre un système complet pour télécharger, organiser et utiliser des icônes personnalisées dans vos boutons.

## 🔧 Fonctionnalités

- Téléchargement d'icônes personnalisées
- Organisation en catégories
- Récupération et utilisation des icônes dans les boutons
- Gestion complète du cycle de vie des icônes

## 📂 Structure des Catégories

Le plugin organise les icônes en catégories pour simplifier leur gestion. Les catégories par défaut sont :

- **system** : Icônes système (volume, alimentation, etc.)
- **streaming** : Icônes liées au streaming (OBS, transitions, etc.)
- **media** : Icônes médias (lecture, pause, etc.)
- **social** : Icônes des réseaux sociaux
- **utilities** : Icônes d'utilitaires divers
- **custom** : Icônes personnalisées ajoutées par l'utilisateur

## 🛠️ Configuration

### Configuration du Dossier d'Assets

Par défaut, les icônes sont stockées dans le dossier `assets/icons` à la racine du projet. Vous pouvez modifier ce chemin via la configuration du plugin.

### Configuration via `plugins.default.json`

```json
{
  "icon-manager": {
    "enabled": true,
    "settings": {
      "assetsDirectory": "./assets/icons"
    }
  }
}
```

## 🧩 Actions Disponibles

### 1. Upload Icon

Télécharge une nouvelle icône.

**Paramètres :**
- `name` (string) : Nom de l'icône
- `category` (string, optionnel) : Catégorie de l'icône (par défaut: "custom")
- `data` (string) : Données de l'image en Base64
- `mimeType` (string) : Type MIME de l'image (ex: "image/png")

**Exemple :**
```javascript
const iconData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA...";

await IconManagerPlugin.actions.uploadIcon.execute({
  name: "Mon Icône",
  category: "custom",
  data: iconData,
  mimeType: "image/png"
});
```

### 2. Get Icon

Récupère les détails d'une icône par son ID.

**Paramètres :**
- `iconId` (string) : ID de l'icône
- `includeData` (boolean, optionnel) : Inclure les données Base64 (par défaut: false)

**Exemple :**
```javascript
const icon = await IconManagerPlugin.actions.getIcon.execute({
  iconId: "123456abcdef",
  includeData: true
});

console.log(icon.name);
console.log(icon.base64); // Si includeData est true
```

### 3. Delete Icon

Supprime une icône par son ID.

**Paramètres :**
- `iconId` (string) : ID de l'icône

**Exemple :**
```javascript
await IconManagerPlugin.actions.deleteIcon.execute({
  iconId: "123456abcdef"
});
```

### 4. List Icons

Liste toutes les icônes disponibles, avec filtrage optionnel par catégorie.

**Paramètres :**
- `category` (string, optionnel) : Filtrer par catégorie

**Exemple :**
```javascript
// Toutes les icônes
const allIcons = await IconManagerPlugin.actions.listIcons.execute();

// Icônes d'une catégorie spécifique
const streamingIcons = await IconManagerPlugin.actions.listIcons.execute({
  category: "streaming"
});
```

### 5. Get Categories

Récupère toutes les catégories d'icônes disponibles.

**Paramètres :** Aucun

**Exemple :**
```javascript
const categories = await IconManagerPlugin.actions.getCategories.execute();
console.log(categories); // ["system", "streaming", "media", ...]
```

### 6. Create Category

Crée une nouvelle catégorie d'icônes.

**Paramètres :**
- `category` (string) : Nom de la nouvelle catégorie

**Exemple :**
```javascript
await IconManagerPlugin.actions.createCategory.execute({
  category: "twitch"
});
```

## 💻 Exemple d'Utilisation

### 1. Téléchargement d'une Icône

```javascript
// Fonction pour convertir une image en Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Téléchargement d'une icône depuis l'interface utilisateur
async function uploadIcon(file) {
  try {
    const base64Data = await fileToBase64(file);
    
    const result = await pluginManager.executePluginAction(
      'icon-manager', 
      'uploadIcon', 
      {
        name: file.name.split('.')[0],
        category: 'custom',
        data: base64Data,
        mimeType: file.type
      }
    );
    
    console.log(`Icône téléchargée avec succès. ID: ${result.icon.id}`);
    return result.icon;
  } catch (error) {
    console.error('Échec du téléchargement de l\'icône:', error);
    throw error;
  }
}
```

### 2. Utilisation d'une Icône dans un Bouton

```javascript
// Récupération d'une icône et création d'un bouton
async function createButtonWithIcon(iconId, label, action) {
  try {
    // Récupérer l'icône avec ses données
    const icon = await pluginManager.executePluginAction(
      'icon-manager', 
      'getIcon', 
      {
        iconId,
        includeData: true
      }
    );
    
    // Créer un bouton avec cette icône
    const button = {
      id: `button-${Date.now()}`,
      label,
      iconData: icon.base64,
      action
    };
    
    // Ajouter le bouton à l'interface
    addButtonToInterface(button);
    
    return button;
  } catch (error) {
    console.error('Échec de la création du bouton:', error);
    throw error;
  }
}
```

## 🌐 Intégration avec l'Interface Utilisateur

### Affichage d'un Sélecteur d'Icônes

```javascript
// Récupération et affichage des icônes par catégorie
async function displayIconSelector() {
  try {
    // Récupérer les catégories
    const { categories } = await pluginManager.executePluginAction(
      'icon-manager', 
      'getCategories'
    );
    
    // Créer les onglets de catégories
    const tabContainer = document.getElementById('icon-category-tabs');
    tabContainer.innerHTML = '';
    
    categories.forEach(category => {
      const tab = document.createElement('button');
      tab.textContent = category;
      tab.className = 'icon-category-tab';
      tab.onclick = () => loadIconsByCategory(category);
      tabContainer.appendChild(tab);
    });
    
    // Charger les icônes de la première catégorie par défaut
    if (categories.length > 0) {
      loadIconsByCategory(categories[0]);
    }
  } catch (error) {
    console.error('Échec du chargement des catégories d\'icônes:', error);
  }
}

// Chargement des icônes par catégorie
async function loadIconsByCategory(category) {
  try {
    const { icons } = await pluginManager.executePluginAction(
      'icon-manager', 
      'listIcons', 
      { category }
    );
    
    const iconGrid = document.getElementById('icon-grid');
    iconGrid.innerHTML = '';
    
    icons.forEach(icon => {
      const iconElement = document.createElement('div');
      iconElement.className = 'icon-item';
      iconElement.dataset.iconId = icon.id;
      
      // Charger l'icône individuelle pour l'affichage
      loadIconPreview(iconElement, icon.id);
      
      iconElement.onclick = () => selectIcon(icon.id);
      iconGrid.appendChild(iconElement);
    });
  } catch (error) {
    console.error(`Échec du chargement des icônes pour la catégorie ${category}:`, error);
  }
}

// Chargement de l'aperçu d'une icône
async function loadIconPreview(element, iconId) {
  try {
    const icon = await pluginManager.executePluginAction(
      'icon-manager', 
      'getIcon', 
      {
        iconId,
        includeData: true
      }
    );
    
    const img = document.createElement('img');
    img.src = icon.base64;
    img.alt = icon.name;
    img.title = icon.name;
    
    element.appendChild(img);
  } catch (error) {
    console.error(`Échec du chargement de l'aperçu de l'icône ${iconId}:`, error);
  }
}
```

## 📝 Notes de Développement

- Assurez-vous que le dossier d'assets est accessible en écriture par l'application
- Les icônes sont identifiées par un ID unique généré à partir du nom et du timestamp
- Le plugin supporte les formats d'image courants : PNG, JPEG, SVG, GIF et WebP

## 🛡️ Sécurité

- Vérifiez que les fichiers téléchargés sont bien des images pour éviter les risques de sécurité
- Limitez la taille des images téléchargées pour éviter les problèmes de performance
- Validez les noms de fichiers pour éviter les problèmes de chemin

## ⚠️ Limitations Connues

- Le plugin ne gère pas la redimensionnement automatique des images
- Les fichiers SVG animés peuvent ne pas fonctionner correctement sur certains navigateurs
- L'importation en masse d'icônes n'est pas supportée actuellement
