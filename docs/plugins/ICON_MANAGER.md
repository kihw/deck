# Icon Manager Plugin

## 🖼️ Overview

The Icon Manager plugin provides a comprehensive system for managing icons used in your Deck buttons. It enables you to upload, organize, and retrieve icons to enhance the visual experience of your Stream Deck.

## 🚀 Features

- Upload custom icons in various formats (PNG, JPEG, GIF, SVG)
- Organize icons into categories
- Retrieve icons with optional base64 data
- Delete unused icons
- Create custom categories

## 📂 Directory Structure

Icons are stored in the `assets/icons` directory, organized by category:

```
assets/icons/
├── system/       # System icons
├── streaming/    # Streaming-related icons
├── media/        # Media playback icons
├── social/       # Social media icons
├── utilities/    # Utility icons
└── custom/       # User-uploaded icons
```

## 🔧 Configuration

The Icon Manager plugin can be configured in your `src/config/plugins.default.json` file:

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

## 📋 Available Actions

### uploadIcon

Uploads a new icon to the specified category.

**Parameters:**
- `name` (string): Name of the icon
- `category` (string, optional): Category to store the icon in (defaults to "custom")
- `data` (string): Base64-encoded image data (must start with "data:")
- `mimeType` (string): MIME type of the image (e.g., "image/png")

**Example:**
```javascript
await pluginManager.executePluginAction('icon-manager', 'uploadIcon', {
  name: 'My Custom Icon',
  category: 'streaming',
  data: 'data:image/png;base64,...',
  mimeType: 'image/png'
});
```

### getIcon

Retrieves information about an icon by its ID.

**Parameters:**
- `iconId` (string): ID of the icon
- `includeData` (boolean, optional): Whether to include base64 data (defaults to false)

**Example:**
```javascript
const icon = await pluginManager.executePluginAction('icon-manager', 'getIcon', {
  iconId: 'abc123def456',
  includeData: true
});

console.log(icon.name);      // "My Custom Icon"
console.log(icon.category);  // "streaming"
console.log(icon.base64);    // "data:image/png;base64,..."
```

### deleteIcon

Deletes an icon by its ID.

**Parameters:**
- `iconId` (string): ID of the icon to delete

**Example:**
```javascript
await pluginManager.executePluginAction('icon-manager', 'deleteIcon', {
  iconId: 'abc123def456'
});
```

### listIcons

Lists available icons, optionally filtered by category.

**Parameters:**
- `category` (string, optional): Category to filter by

**Example:**
```javascript
// Get all icons
const allIcons = await pluginManager.executePluginAction('icon-manager', 'listIcons');

// Get icons from a specific category
const streamingIcons = await pluginManager.executePluginAction('icon-manager', 'listIcons', {
  category: 'streaming'
});
```

### getCategories

Gets all available icon categories.

**Parameters:** None

**Example:**
```javascript
const categories = await pluginManager.executePluginAction('icon-manager', 'getCategories');
console.log(categories);  // ["system", "streaming", "media", "social", "utilities", "custom"]
```

### createCategory

Creates a new icon category.

**Parameters:**
- `category` (string): Name of the category to create

**Example:**
```javascript
await pluginManager.executePluginAction('icon-manager', 'createCategory', {
  category: 'gaming'
});
```

## 🖥️ Integration with UI

### Icon Selector Component

The Icon Manager plugin is designed to work with the `IconSelector` component in the client interface. This component provides a user-friendly way to browse and select icons.

```javascript
// Example of using IconSelector in a client-side script
const iconSelector = new IconSelector(socket, 'icon-selector-container', {
  onSelect: (icon) => {
    console.log(`Selected icon: ${icon.id}`);
    updateButtonIcon(icon.id, icon.base64);
  }
});
```

### Upload Flow

1. User clicks "Upload Icon" in the interface
2. Browser opens a file picker
3. User selects an image file
4. Client converts the file to base64
5. Client calls `uploadIcon` action
6. Icon Manager stores the icon in the appropriate category
7. Icon becomes available in the selector

## 🛠️ Example Use Cases

### Creating a Button with a Custom Icon

```javascript
// First, upload an icon
const uploadResult = await pluginManager.executePluginAction('icon-manager', 'uploadIcon', {
  name: 'Start Stream Button',
  category: 'streaming',
  data: imageBase64Data,
  mimeType: 'image/png'
});

// Then create a button using this icon
const button = {
  id: 'start-stream',
  label: 'Start Stream',
  iconId: uploadResult.icon.id,
  action: 'obs-advanced.toggleStream'
};

// Register the button
buttonManager.registerButton(button);
```

### Creating a Theme with Consistent Icons

```javascript
// Create a new category for the theme
await pluginManager.executePluginAction('icon-manager', 'createCategory', {
  category: 'dark-theme'
});

// Upload themed icons
for (const iconData of themeIcons) {
  await pluginManager.executePluginAction('icon-manager', 'uploadIcon', {
    name: iconData.name,
    category: 'dark-theme',
    data: iconData.base64,
    mimeType: iconData.mimeType
  });
}

// Get all icons from the theme
const themeIcons = await pluginManager.executePluginAction('icon-manager', 'listIcons', {
  category: 'dark-theme'
});

// Apply them to buttons
// ...
```

## 🧩 Extending the Icon Manager

The Icon Manager plugin is designed to be extended with additional functionality. Here are some ideas:

- Add support for icon resizing
- Implement icon search functionality
- Add color filters and effects
- Create theme packs with predefined icons
- Add import/export functionality for icon sets

## 🔍 Troubleshooting

### Cannot Upload Icons

- Ensure the `assets/icons` directory exists and is writable
- Check that the base64 data is properly formatted (should start with "data:")
- Verify that the MIME type is supported

### Icons Not Appearing

- Check that the category exists
- Ensure the icon ID is correct
- Verify that the `includeData` parameter is set to `true` when needed

### Permission Issues

- On Linux/macOS, make sure the directory permissions are set correctly:
  ```bash
  chmod -R 755 ./assets/icons
  ```

## 📚 Additional Resources

- [MDN Web Docs: Working with Files](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications)
- [Base64 Image Conversion](https://www.base64-image.de/)
- [Icon Design Guidelines](https://material.io/design/iconography/system-icons.html)
