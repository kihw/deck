# Icon Manager Plugin - User Guide

## Overview

The Icon Manager plugin provides a comprehensive system for managing icons used in your Deck buttons. This guide will walk you through the setup, configuration, and usage of this plugin.

## Features

- **Upload custom icons** in various formats (PNG, JPEG, GIF, SVG)
- **Organize icons into categories** for easy management
- **Retrieve icons** with optional base64 data for direct use in UI
- **Delete unused icons** to keep your library organized
- **Create custom categories** to fit your specific needs

## Setup

### Prerequisites

The Icon Manager plugin requires the following directory structure:

```
assets/
└── icons/
    ├── system/      # System icons
    ├── streaming/   # Streaming-related icons
    ├── media/       # Media playback icons
    ├── social/      # Social media icons
    ├── utilities/   # Utility icons
    └── custom/      # User-uploaded icons
```

### Automatic Setup

The easiest way to set up the required directory structure is to use the provided setup script:

```bash
# Run the Icon Manager setup script
node scripts/setup-icon-manager.js
```

### Manual Setup

If you prefer to set up the directories manually:

```bash
# Create the main icon directory
mkdir -p assets/icons

# Create category directories
mkdir -p assets/icons/system
mkdir -p assets/icons/streaming
mkdir -p assets/icons/media
mkdir -p assets/icons/social
mkdir -p assets/icons/utilities
mkdir -p assets/icons/custom
```

## Configuration

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

You can use the plugin manager to configure the plugin:

```bash
# Using CLI
node cli.js plugin configure icon-manager

# Or with interactive mode
node cli.js plugins
```

## Usage

### Uploading Icons

To upload a new icon to the icon manager:

```javascript
// In your client-side code
async function uploadIcon(name, category, file) {
  // Convert the file to a base64 data URL
  const reader = new FileReader();
  reader.readAsDataURL(file);
  
  reader.onload = async () => {
    const base64Data = reader.result;
    
    // Call the plugin action via WebSocket
    socket.emit('plugin_action', {
      plugin: 'icon-manager',
      action: 'uploadIcon',
      params: {
        name: name,
        category: category,
        data: base64Data,
        mimeType: file.type
      }
    }, (response) => {
      if (response.success) {
        console.log('Icon uploaded successfully!', response.icon);
      } else {
        console.error('Failed to upload icon:', response.error);
      }
    });
  };
}
```

### Getting an Icon

To retrieve an icon by its ID:

```javascript
socket.emit('plugin_action', {
  plugin: 'icon-manager',
  action: 'getIcon',
  params: {
    iconId: 'abc123def456',
    includeData: true // Set to true to include base64 data
  }
}, (response) => {
  if (response.success) {
    // Use the icon
    const iconElement = document.createElement('img');
    iconElement.src = response.base64;
    iconElement.alt = response.name;
    document.body.appendChild(iconElement);
  }
});
```

### Listing Icons

To list all available icons, optionally filtered by category:

```javascript
// Get all icons
socket.emit('plugin_action', {
  plugin: 'icon-manager',
  action: 'listIcons'
}, (response) => {
  if (response.success) {
    console.log('Available icons:', response.icons);
  }
});

// Get icons from a specific category
socket.emit('plugin_action', {
  plugin: 'icon-manager',
  action: 'listIcons',
  params: {
    category: 'streaming'
  }
}, (response) => {
  if (response.success) {
    console.log('Streaming icons:', response.icons);
  }
});
```

### Getting Categories

To get a list of all available icon categories:

```javascript
socket.emit('plugin_action', {
  plugin: 'icon-manager',
  action: 'getCategories'
}, (response) => {
  if (response.success) {
    console.log('Available categories:', response.categories);
  }
});
```

### Creating a New Category

To create a new icon category:

```javascript
socket.emit('plugin_action', {
  plugin: 'icon-manager',
  action: 'createCategory',
  params: {
    category: 'gaming'
  }
}, (response) => {
  if (response.success) {
    console.log('New category created:', response.category);
  }
});
```

### Deleting an Icon

To delete an icon:

```javascript
socket.emit('plugin_action', {
  plugin: 'icon-manager',
  action: 'deleteIcon',
  params: {
    iconId: 'abc123def456'
  }
}, (response) => {
  if (response.success) {
    console.log('Icon deleted successfully');
  }
});
```

## Integration with Button UI

The Icon Manager is designed to integrate seamlessly with the button configuration UI. Here's a sample implementation:

```javascript
// Function to load icons into a selector
function loadIconSelector(categoryFilter = null) {
  const selectorElement = document.getElementById('icon-selector');
  
  // Clear current icons
  selectorElement.innerHTML = '';
  
  // Get icons from the Icon Manager
  socket.emit('plugin_action', {
    plugin: 'icon-manager',
    action: 'listIcons',
    params: categoryFilter ? { category: categoryFilter } : undefined
  }, (response) => {
    if (response.success && response.icons.length > 0) {
      // Populate the selector
      response.icons.forEach(icon => {
        // Load each icon with its data
        socket.emit('plugin_action', {
          plugin: 'icon-manager',
          action: 'getIcon',
          params: {
            iconId: icon.id,
            includeData: true
          }
        }, (iconResponse) => {
          if (iconResponse.success) {
            const iconElement = document.createElement('div');
            iconElement.className = 'icon-option';
            iconElement.dataset.iconId = icon.id;
            
            const img = document.createElement('img');
            img.src = iconResponse.base64;
            img.alt = icon.name;
            
            iconElement.appendChild(img);
            selectorElement.appendChild(iconElement);
            
            // Add click event to select the icon
            iconElement.addEventListener('click', () => {
              selectIcon(icon.id, iconResponse.base64);
            });
          }
        });
      });
    } else {
      selectorElement.innerHTML = '<p>No icons found</p>';
    }
  });
}
```

## Best Practices

1. **Organize icons into appropriate categories** to make them easier to find
2. **Use meaningful names** for your icons to make them easier to identify
3. **Optimize image files** before uploading to reduce size
4. **Use SVG format** when possible for better scaling
5. **Regularly clean up unused icons** to keep your library manageable

## Troubleshooting

### Icons Not Appearing

- Ensure the directory structure is correct
- Check file permissions on the icon directories
- Verify the icon file exists and is not corrupted

### Upload Errors

- Ensure the image data is properly formatted as a base64 data URL
- Check that the MIME type is correct and supported
- Verify the category exists or use a default category like 'custom'

### Permission Issues

If you encounter permission issues on Linux/macOS, ensure the directories have the correct permissions:

```bash
chmod -R 755 ./assets/icons
```

## Advanced Usage

### Creating a Theme with Consistent Icons

```javascript
// Create a new category for the theme
socket.emit('plugin_action', {
  plugin: 'icon-manager',
  action: 'createCategory',
  params: {
    category: 'dark-theme'
  }
});

// Upload themed icons (in a loop)
for (const iconFile of themeFiles) {
  uploadIcon(iconFile.name, 'dark-theme', iconFile);
}
```

### Building a Custom Icon Selector Component

For a more advanced implementation, you can create a reusable component that integrates with the Icon Manager. See the `src/client/components/IconSelector.js` file for a complete implementation example.

## Contributing

If you have icon sets you'd like to contribute to the default Deck installation, please:

1. Ensure icons are properly licensed (preferably open source)
2. Optimize the images for web use
3. Organize them into appropriate categories
4. Submit a pull request with your icons
