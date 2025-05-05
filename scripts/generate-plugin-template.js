#!/usr/bin/env node

/**
 * Plugin Template Generator
 * 
 * Usage: node scripts/generate-plugin-template.js my-plugin-name "My Plugin Display Name"
 * 
 * This script generates a new plugin template with the necessary structure and files.
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const pluginId = process.argv[2];
const pluginName = process.argv[3] || toTitleCase(pluginId);

// Validate input
if (!pluginId) {
  console.error('❌ Error: Plugin ID is required');
  console.log('\nUsage: node scripts/generate-plugin-template.js plugin-id "Plugin Name"');
  console.log('\nExample: node scripts/generate-plugin-template.js spotify-control "Spotify Control"');
  process.exit(1);
}

// Convert kebab-case to TitleCase for class name
function toTitleCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Convert kebab-case to PascalCase for class name
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Generate the plugin template
function generatePluginTemplate() {
  const pascalCaseName = toPascalCase(pluginId);
  const pluginsDir = path.resolve(__dirname, '../src/plugins');
  const pluginFilePath = path.join(pluginsDir, `${pluginId}.ts`);
  
  // Check if plugin already exists
  if (fs.existsSync(pluginFilePath)) {
    console.error(`❌ Error: Plugin ${pluginId} already exists at ${pluginFilePath}`);
    process.exit(1);
  }
  
  // Create plugin directory if it doesn't exist
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });
  }
  
  // Generate plugin template
  const pluginTemplate = `import { Plugin, PluginAction } from './types';

/**
 * ${pluginName} Plugin
 * 
 * Description: Add your plugin description here.
 */
class ${pascalCaseName}Plugin implements Plugin {
  metadata = {
    id: '${pluginId}',
    name: '${pluginName}',
    version: '1.0.0',
    description: 'Description of the ${pluginName} plugin',
    author: 'Your Name'
  };

  actions: Record<string, PluginAction> = {
    /**
     * Example action - replace with your own actions
     */
    exampleAction: {
      id: 'example-action',
      name: 'Example Action',
      description: 'An example action for the ${pluginName} plugin',
      async execute(context?: any) {
        try {
          console.log('Example action executed with context:', context);
          return { 
            success: true, 
            message: 'Example action executed successfully' 
          };
        } catch (error) {
          console.error('Error executing example action:', error);
          throw new Error(\`Failed to execute example action: \${error.message}\`);
        }
      }
    }
  };

  /**
   * Helper methods for internal use (optional)
   */
  helpers = {
    exampleHelper: () => {
      return 'This is an example helper method';
    }
  };

  /**
   * Initialize the plugin
   * This method is called when the plugin is loaded
   */
  async initialize(config?: Record<string, any>): Promise<void> {
    try {
      console.log('Initializing ${pluginName} plugin');
      console.log('Configuration:', config);
      
      // Add your initialization code here
      
    } catch (error) {
      console.error('Error initializing ${pluginName} plugin:', error);
      throw error;
    }
  }

  /**
   * Unload the plugin
   * This method is called when the plugin is unloaded or the application is shutting down
   */
  async unload(): Promise<void> {
    try {
      console.log('Unloading ${pluginName} plugin');
      
      // Add your cleanup code here
      
    } catch (error) {
      console.error('Error unloading ${pluginName} plugin:', error);
    }
  }
}

export default new ${pascalCaseName}Plugin();
`;

  // Write the plugin file
  fs.writeFileSync(pluginFilePath, pluginTemplate);
  console.log(`✅ Created plugin file: ${pluginFilePath}`);
  
  // Create test directory if it doesn't exist
  const testDir = path.resolve(__dirname, '../tests/plugins');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Generate test file template
  const testTemplate = `import ${pascalCaseName}Plugin from '../../src/plugins/${pluginId}';

describe('${pluginName} Plugin', () => {
  beforeAll(async () => {
    // Initialize plugin before tests
    await ${pascalCaseName}Plugin.initialize();
  });
  
  afterAll(async () => {
    // Clean up after tests
    await ${pascalCaseName}Plugin.unload();
  });
  
  it('should have correct metadata', () => {
    expect(${pascalCaseName}Plugin.metadata.id).toBe('${pluginId}');
    expect(${pascalCaseName}Plugin.metadata.name).toBe('${pluginName}');
  });
  
  it('should execute example action', async () => {
    const result = await ${pascalCaseName}Plugin.actions.exampleAction.execute();
    expect(result.success).toBe(true);
  });
  
  // Add more tests as needed
});
`;

  // Write the test file
  const testFilePath = path.join(testDir, `${pluginId}.test.ts`);
  fs.writeFileSync(testFilePath, testTemplate);
  console.log(`✅ Created test file: ${testFilePath}`);
  
  // Generate documentation template
  const docsDir = path.resolve(__dirname, '../docs/plugins');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  const docTemplate = `# ${pluginName} Plugin

## Overview

Add a brief description of your plugin here.

## Features

- Feature 1
- Feature 2
- Feature 3

## Configuration

### Environment Variables

\`\`\`
# Add any required environment variables here
EXAMPLE_API_KEY=your_api_key
\`\`\`

### Plugin Configuration

Configure the plugin in \`src/config/plugins.default.json\`:

\`\`\`json
{
  "${pluginId}": {
    "enabled": true,
    "settings": {
      "option1": "value1",
      "option2": "value2"
    }
  }
}
\`\`\`

## Actions

### exampleAction

Description of the example action.

**Parameters:**
- \`param1\` (string): Description of parameter 1
- \`param2\` (number): Description of parameter 2

**Example:**
\`\`\`javascript
await ${pascalCaseName}Plugin.actions.exampleAction.execute({
  param1: "value1",
  param2: 42
});
\`\`\`

## Helpers

The plugin provides the following helper methods:

- \`exampleHelper()\`: Description of the helper method

## Installation

This plugin comes pre-installed with Deck.

## Usage Examples

\`\`\`javascript
// Example of how to use the plugin
const result = await pluginManager.executePluginAction('${pluginId}', 'exampleAction', {
  param1: 'value1',
  param2: 42
});
\`\`\`

## Troubleshooting

Common issues and their solutions:

1. **Issue Description**: Solution details

## Development

To extend or modify this plugin, edit the file at \`src/plugins/${pluginId}.ts\`.
`;

  // Write the documentation file
  const docFilePath = path.join(docsDir, `${pluginId.toUpperCase()}.md`);
  fs.writeFileSync(docFilePath, docTemplate);
  console.log(`✅ Created documentation file: ${docFilePath}`);
  
  console.log('\n🎉 Plugin template generation complete!');
  console.log('\nNext steps:');
  console.log(`1. Edit your plugin file: ${pluginFilePath}`);
  console.log(`2. Add your custom actions and implementation`);
  console.log(`3. Write tests in: ${testFilePath}`);
  console.log(`4. Document your plugin in: ${docFilePath}`);
  console.log('\nOnce ready, restart the application to load your new plugin.');
}

// Run the script
generatePluginTemplate();
