#!/usr/bin/env node

/**
 * Deck Plugin Manager
 * 
 * A script to help manage plugins in the Deck application.
 * This allows users to enable, disable, configure, and view plugins
 * without having to edit JSON files or write code.
 * 
 * Usage: node scripts/plugin-manager.js [command] [options]
 */

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration paths
const CONFIG_PATH = path.join(__dirname, '../src/config');
const PLUGINS_CONFIG_FILE = path.join(CONFIG_PATH, 'plugins.default.json');
const PLUGINS_DIR = path.join(__dirname, '../src/plugins');

// Parse command line arguments
const [,, command, ...args] = process.argv;

// Main function
async function main() {
  // Create config directory if it doesn't exist
  await fs.ensureDir(CONFIG_PATH);
  
  // Create default plugins config if it doesn't exist
  if (!await fs.pathExists(PLUGINS_CONFIG_FILE)) {
    await fs.writeJson(PLUGINS_CONFIG_FILE, {}, { spaces: 2 });
  }

  // Handle commands
  if (!command || command === 'help') {
    showHelp();
    rl.close();
    return;
  }

  switch (command) {
    case 'list':
      await listPlugins();
      break;
    case 'enable':
      await enablePlugin(args[0]);
      break;
    case 'disable':
      await disablePlugin(args[0]);
      break;
    case 'configure':
      await configurePlugin(args[0]);
      break;
    case 'info':
      await showPluginInfo(args[0]);
      break;
    case 'interactive':
      await startInteractiveMode();
      break;
    default:
      console.log(`\nUnknown command: ${command}`);
      showHelp();
      break;
  }

  rl.close();
}

/**
 * Show help information
 */
function showHelp() {
  console.log('\nDeck Plugin Manager');
  console.log('===================');
  console.log('\nUsage: node scripts/plugin-manager.js [command] [options]');
  console.log('\nCommands:');
  console.log('  list                   List all available plugins');
  console.log('  enable <plugin-id>     Enable a plugin');
  console.log('  disable <plugin-id>    Disable a plugin');
  console.log('  configure <plugin-id>  Configure a plugin');
  console.log('  info <plugin-id>       Show detailed information about a plugin');
  console.log('  interactive            Start interactive mode');
  console.log('  help                   Show this help message');
  console.log('\nExamples:');
  console.log('  node scripts/plugin-manager.js list');
  console.log('  node scripts/plugin-manager.js enable obs-advanced');
  console.log('  node scripts/plugin-manager.js configure system-monitor');
}

/**
 * List all available plugins
 */
async function listPlugins() {
  console.log('\nAvailable Plugins:');
  console.log('==================');
  
  // Get all plugins
  const plugins = await getPlugins();
  
  // Get configuration
  const config = await getPluginsConfig();
  
  // List plugins
  if (plugins.length === 0) {
    console.log('No plugins found.');
  } else {
    plugins.forEach(plugin => {
      const isEnabled = config[plugin.id]?.enabled !== false; // Default to true if not specified
      const status = isEnabled ? '✅ Enabled' : '❌ Disabled';
      console.log(`${plugin.id} - ${plugin.name} (${plugin.version}) - ${status}`);
    });
  }
}

/**
 * Enable a plugin
 */
async function enablePlugin(pluginId) {
  if (!pluginId) {
    console.log('Error: Plugin ID is required');
    console.log('Usage: node scripts/plugin-manager.js enable <plugin-id>');
    return;
  }
  
  // Check if plugin exists
  const plugin = await getPlugin(pluginId);
  if (!plugin) {
    console.log(`Error: Plugin "${pluginId}" not found`);
    return;
  }
  
  // Enable plugin
  const config = await getPluginsConfig();
  if (!config[pluginId]) {
    config[pluginId] = {};
  }
  config[pluginId].enabled = true;
  
  // Save config
  await savePluginsConfig(config);
  
  console.log(`✅ Plugin "${pluginId}" has been enabled`);
}

/**
 * Disable a plugin
 */
async function disablePlugin(pluginId) {
  if (!pluginId) {
    console.log('Error: Plugin ID is required');
    console.log('Usage: node scripts/plugin-manager.js disable <plugin-id>');
    return;
  }
  
  // Check if plugin exists
  const plugin = await getPlugin(pluginId);
  if (!plugin) {
    console.log(`Error: Plugin "${pluginId}" not found`);
    return;
  }
  
  // Disable plugin
  const config = await getPluginsConfig();
  if (!config[pluginId]) {
    config[pluginId] = {};
  }
  config[pluginId].enabled = false;
  
  // Save config
  await savePluginsConfig(config);
  
  console.log(`❌ Plugin "${pluginId}" has been disabled`);
}

/**
 * Configure a plugin
 */
async function configurePlugin(pluginId) {
  if (!pluginId) {
    console.log('Error: Plugin ID is required');
    console.log('Usage: node scripts/plugin-manager.js configure <plugin-id>');
    return;
  }
  
  // Check if plugin exists
  const plugin = await getPlugin(pluginId);
  if (!plugin) {
    console.log(`Error: Plugin "${pluginId}" not found`);
    return;
  }
  
  // Get current config
  const config = await getPluginsConfig();
  if (!config[pluginId]) {
    config[pluginId] = { enabled: true };
  }
  if (!config[pluginId].settings) {
    config[pluginId].settings = {};
  }
  
  console.log(`\nConfiguring plugin: ${plugin.name}`);
  
  // Show current settings
  console.log('\nCurrent settings:');
  console.log(JSON.stringify(config[pluginId].settings, null, 2) || 'No settings configured');
  
  // Interactive configuration
  console.log('\nEnter new settings (press Enter without typing to keep current value):');
  
  let settingKey = await askQuestion('Enter setting key (or empty to finish): ');
  while (settingKey.trim() !== '') {
    const currentValue = config[pluginId].settings[settingKey];
    console.log(`Current value: ${JSON.stringify(currentValue) || 'Not set'}`);
    
    let newValue = await askQuestion('Enter new value: ');
    if (newValue.trim() !== '') {
      // Try to parse as JSON if possible
      try {
        newValue = JSON.parse(newValue);
      } catch (e) {
        // Keep as string if not valid JSON
      }
      
      config[pluginId].settings[settingKey] = newValue;
      console.log(`Setting "${settingKey}" updated to: ${JSON.stringify(newValue)}`);
    }
    
    settingKey = await askQuestion('\nEnter setting key (or empty to finish): ');
  }
  
  // Save config
  await savePluginsConfig(config);
  
  console.log(`\n✅ Plugin "${pluginId}" configuration has been updated`);
}

/**
 * Show detailed information about a plugin
 */
async function showPluginInfo(pluginId) {
  if (!pluginId) {
    console.log('Error: Plugin ID is required');
    console.log('Usage: node scripts/plugin-manager.js info <plugin-id>');
    return;
  }
  
  // Check if plugin exists
  const plugin = await getPlugin(pluginId);
  if (!plugin) {
    console.log(`Error: Plugin "${pluginId}" not found`);
    return;
  }
  
  // Get configuration
  const config = await getPluginsConfig();
  const isEnabled = config[pluginId]?.enabled !== false;
  
  console.log(`\nPlugin: ${plugin.name}`);
  console.log('='.repeat(plugin.name.length + 8));
  console.log(`ID: ${plugin.id}`);
  console.log(`Version: ${plugin.version}`);
  console.log(`Status: ${isEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`Description: ${plugin.description}`);
  
  // Actions
  console.log('\nAvailable Actions:');
  if (plugin.actions && Object.keys(plugin.actions).length > 0) {
    Object.entries(plugin.actions).forEach(([actionName, action]) => {
      console.log(`- ${actionName}: ${action.name || actionName}`);
      if (action.description) {
        console.log(`  ${action.description}`);
      }
    });
  } else {
    console.log('No actions available');
  }
  
  // Settings
  console.log('\nCurrent Settings:');
  if (config[pluginId]?.settings && Object.keys(config[pluginId].settings).length > 0) {
    console.log(JSON.stringify(config[pluginId].settings, null, 2));
  } else {
    console.log('No settings configured');
  }
}

/**
 * Start interactive mode
 */
async function startInteractiveMode() {
  console.log('\nDeck Plugin Manager - Interactive Mode');
  console.log('=====================================');
  
  let running = true;
  while (running) {
    console.log('\nAvailable commands:');
    console.log('1. List plugins');
    console.log('2. Enable plugin');
    console.log('3. Disable plugin');
    console.log('4. Configure plugin');
    console.log('5. View plugin details');
    console.log('0. Exit');
    
    const choice = await askQuestion('\nEnter command number: ');
    
    switch (choice) {
      case '0':
        running = false;
        break;
      case '1':
        await listPlugins();
        break;
      case '2': {
        const plugins = await getPlugins();
        console.log('\nAvailable plugins:');
        plugins.forEach((plugin, index) => {
          console.log(`${index + 1}. ${plugin.id} - ${plugin.name}`);
        });
        
        const index = await askQuestion('\nEnter plugin number: ');
        const selectedIndex = parseInt(index) - 1;
        
        if (selectedIndex >= 0 && selectedIndex < plugins.length) {
          await enablePlugin(plugins[selectedIndex].id);
        } else {
          console.log('Invalid selection');
        }
        break;
      }
      case '3': {
        const plugins = await getPlugins();
        console.log('\nAvailable plugins:');
        plugins.forEach((plugin, index) => {
          console.log(`${index + 1}. ${plugin.id} - ${plugin.name}`);
        });
        
        const index = await askQuestion('\nEnter plugin number: ');
        const selectedIndex = parseInt(index) - 1;
        
        if (selectedIndex >= 0 && selectedIndex < plugins.length) {
          await disablePlugin(plugins[selectedIndex].id);
        } else {
          console.log('Invalid selection');
        }
        break;
      }
      case '4': {
        const plugins = await getPlugins();
        console.log('\nAvailable plugins:');
        plugins.forEach((plugin, index) => {
          console.log(`${index + 1}. ${plugin.id} - ${plugin.name}`);
        });
        
        const index = await askQuestion('\nEnter plugin number: ');
        const selectedIndex = parseInt(index) - 1;
        
        if (selectedIndex >= 0 && selectedIndex < plugins.length) {
          await configurePlugin(plugins[selectedIndex].id);
        } else {
          console.log('Invalid selection');
        }
        break;
      }
      case '5': {
        const plugins = await getPlugins();
        console.log('\nAvailable plugins:');
        plugins.forEach((plugin, index) => {
          console.log(`${index + 1}. ${plugin.id} - ${plugin.name}`);
        });
        
        const index = await askQuestion('\nEnter plugin number: ');
        const selectedIndex = parseInt(index) - 1;
        
        if (selectedIndex >= 0 && selectedIndex < plugins.length) {
          await showPluginInfo(plugins[selectedIndex].id);
        } else {
          console.log('Invalid selection');
        }
        break;
      }
      default:
        console.log('Invalid choice');
        break;
    }
  }
  
  console.log('\nThank you for using Deck Plugin Manager. Goodbye!\n');
}

/**
 * Get all plugins
 */
async function getPlugins() {
  try {
    // Ensure the plugins directory exists
    await fs.ensureDir(PLUGINS_DIR);
    
    // Get all plugin files
    const files = await fs.readdir(PLUGINS_DIR);
    
    // Filter plugin files
    const pluginFiles = files.filter(file => 
      (file.endsWith('.js') || file.endsWith('.ts')) && 
      !file.includes('types.') && 
      !file.includes('manager.')
    );
    
    // Extract plugin metadata
    const plugins = [];
    
    for (const file of pluginFiles) {
      try {
        const filePath = path.join(PLUGINS_DIR, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract basic plugin metadata using regex
        const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
        const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
        const versionMatch = content.match(/version:\s*['"]([^'"]+)['"]/);
        const descriptionMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
        
        if (idMatch && nameMatch) {
          plugins.push({
            id: idMatch[1],
            name: nameMatch[1],
            version: versionMatch ? versionMatch[1] : '1.0.0',
            description: descriptionMatch ? descriptionMatch[1] : '',
            file
          });
        }
      } catch (error) {
        console.error(`Error reading plugin file ${file}:`, error);
      }
    }
    
    return plugins;
    
  } catch (error) {
    console.error('Error getting plugins:', error);
    return [];
  }
}

/**
 * Get specific plugin by ID
 */
async function getPlugin(pluginId) {
  const plugins = await getPlugins();
  return plugins.find(plugin => plugin.id === pluginId);
}

/**
 * Get plugins configuration
 */
async function getPluginsConfig() {
  try {
    if (await fs.pathExists(PLUGINS_CONFIG_FILE)) {
      return await fs.readJson(PLUGINS_CONFIG_FILE);
    }
    return {};
  } catch (error) {
    console.error('Error reading plugins configuration:', error);
    return {};
  }
}

/**
 * Save plugins configuration
 */
async function savePluginsConfig(config) {
  try {
    await fs.writeJson(PLUGINS_CONFIG_FILE, config, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error saving plugins configuration:', error);
    return false;
  }
}

/**
 * Ask a question using readline
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  rl.close();
});
