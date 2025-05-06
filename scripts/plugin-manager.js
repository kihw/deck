#!/usr/bin/env node

/**
 * Interactive Plugin Manager for Deck
 * 
 * This script provides a comprehensive management interface for Deck plugins.
 * Features:
 * - List all available plugins
 * - Enable/disable plugins
 * - Configure plugin settings
 * - View plugin details
 * - Install/uninstall plugins
 */

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration paths
const CONFIG_DIR = path.join(__dirname, '../src/config');
const PLUGINS_CONFIG_FILE = path.join(CONFIG_DIR, 'plugins.default.json');
const PLUGINS_DIR = path.join(__dirname, '../src/plugins');

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility: Promise-based question function
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim());
    });
  });
}

// Utility: Load plugin configuration
async function loadPluginConfig() {
  try {
    await fs.ensureDir(CONFIG_DIR);
    
    if (await fs.pathExists(PLUGINS_CONFIG_FILE)) {
      return await fs.readJson(PLUGINS_CONFIG_FILE);
    }
    return {};
  } catch (error) {
    console.error(chalk.red('Error loading plugin configuration:'), error);
    return {};
  }
}

// Utility: Save plugin configuration
async function savePluginConfig(config) {
  try {
    await fs.writeJson(PLUGINS_CONFIG_FILE, config, { spaces: 2 });
    console.log(chalk.green('✅ Configuration saved successfully'));
  } catch (error) {
    console.error(chalk.red('Error saving plugin configuration:'), error);
  }
}

// Utility: Scan plugins directory
async function scanPlugins() {
  try {
    await fs.ensureDir(PLUGINS_DIR);
    
    const files = await fs.readdir(PLUGINS_DIR);
    const pluginFiles = files.filter(file => 
      (file.endsWith('.js') || file.endsWith('.ts')) && 
      !file.includes('types.') && 
      !file.includes('manager.')
    );
    
    const plugins = [];
    
    for (const file of pluginFiles) {
      try {
        const filePath = path.join(PLUGINS_DIR, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract plugin metadata using regex
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
        console.error(chalk.red(`Error reading plugin file ${file}:`), error);
      }
    }
    
    return plugins;
    
  } catch (error) {
    console.error(chalk.red('Error scanning plugins directory:'), error);
    return [];
  }
}

// --- Main Actions ---

// List all plugins
async function listPlugins() {
  console.log(chalk.blue('\n📋 Available Plugins:'));
  console.log(chalk.blue('==================='));
  
  const plugins = await scanPlugins();
  const config = await loadPluginConfig();
  
  if (plugins.length === 0) {
    console.log(chalk.yellow('No plugins found.'));
    return;
  }
  
  // Determine max length for formatting
  const maxIdLength = Math.max(...plugins.map(p => p.id.length));
  const maxNameLength = Math.max(...plugins.map(p => p.name.length));
  
  // Print header
  console.log(`${chalk.underline('ID'.padEnd(maxIdLength + 2))}${chalk.underline('Name'.padEnd(maxNameLength + 2))}${chalk.underline('Version'.padEnd(10))}${chalk.underline('Status')}`);
  
  // Print plugins
  plugins.forEach(plugin => {
    const isEnabled = config[plugin.id]?.enabled !== false; // Default to true if not specified
    const status = isEnabled 
      ? chalk.green('✓ Enabled') 
      : chalk.red('✗ Disabled');
    
    console.log(
      `${plugin.id.padEnd(maxIdLength + 2)}${plugin.name.padEnd(maxNameLength + 2)}${plugin.version.padEnd(10)}${status}`
    );
  });
  
  console.log(chalk.blue(`\nTotal: ${plugins.length} plugin(s)`));
}

// Enable a plugin
async function enablePlugin(pluginId) {
  if (!pluginId) {
    pluginId = await askQuestion(chalk.yellow('Enter plugin ID to enable: '));
  }
  
  const plugins = await scanPlugins();
  const plugin = plugins.find(p => p.id === pluginId);
  
  if (!plugin) {
    console.log(chalk.red(`Plugin "${pluginId}" not found.`));
    return;
  }
  
  const config = await loadPluginConfig();
  if (!config[pluginId]) {
    config[pluginId] = {};
  }
  
  config[pluginId].enabled = true;
  
  await savePluginConfig(config);
  console.log(chalk.green(`Plugin "${plugin.name}" has been enabled.`));
}

// Disable a plugin
async function disablePlugin(pluginId) {
  if (!pluginId) {
    pluginId = await askQuestion(chalk.yellow('Enter plugin ID to disable: '));
  }
  
  const plugins = await scanPlugins();
  const plugin = plugins.find(p => p.id === pluginId);
  
  if (!plugin) {
    console.log(chalk.red(`Plugin "${pluginId}" not found.`));
    return;
  }
  
  const config = await loadPluginConfig();
  if (!config[pluginId]) {
    config[pluginId] = {};
  }
  
  config[pluginId].enabled = false;
  
  await savePluginConfig(config);
  console.log(chalk.green(`Plugin "${plugin.name}" has been disabled.`));
}

// Show plugin details
async function showPluginDetails(pluginId) {
  if (!pluginId) {
    pluginId = await askQuestion(chalk.yellow('Enter plugin ID to view: '));
  }
  
  const plugins = await scanPlugins();
  const plugin = plugins.find(p => p.id === pluginId);
  
  if (!plugin) {
    console.log(chalk.red(`Plugin "${pluginId}" not found.`));
    return;
  }
  
  const config = await loadPluginConfig();
  const isEnabled = config[pluginId]?.enabled !== false;
  
  console.log(chalk.blue(`\n📦 Plugin: ${plugin.name}`));
  console.log(chalk.blue('='.repeat(plugin.name.length + 10)));
  console.log(`${chalk.yellow('ID:')} ${plugin.id}`);
  console.log(`${chalk.yellow('Version:')} ${plugin.version}`);
  console.log(`${chalk.yellow('File:')} ${plugin.file}`);
  console.log(`${chalk.yellow('Status:')} ${isEnabled ? chalk.green('Enabled') : chalk.red('Disabled')}`);
  
  if (plugin.description) {
    console.log(`\n${chalk.yellow('Description:')}\n${plugin.description}`);
  }
  
  // Show settings if any
  if (config[pluginId]?.settings && Object.keys(config[pluginId].settings).length > 0) {
    console.log(`\n${chalk.yellow('Current Settings:')}`);
    console.log(JSON.stringify(config[pluginId].settings, null, 2));
  } else {
    console.log(`\n${chalk.yellow('Current Settings:')} No settings configured.`);
  }
}

// Configure plugin settings
async function configurePlugin(pluginId) {
  if (!pluginId) {
    pluginId = await askQuestion(chalk.yellow('Enter plugin ID to configure: '));
  }
  
  const plugins = await scanPlugins();
  const plugin = plugins.find(p => p.id === pluginId);
  
  if (!plugin) {
    console.log(chalk.red(`Plugin "${pluginId}" not found.`));
    return;
  }
  
  console.log(chalk.blue(`\n⚙️ Configuring Plugin: ${plugin.name}`));
  
  const config = await loadPluginConfig();
  if (!config[pluginId]) {
    config[pluginId] = { enabled: true };
  }
  
  if (!config[pluginId].settings) {
    config[pluginId].settings = {};
  }
  
  // Show current settings
  console.log(chalk.yellow('\nCurrent settings:'));
  console.log(
    Object.keys(config[pluginId].settings).length > 0 
      ? JSON.stringify(config[pluginId].settings, null, 2) 
      : 'No settings configured.'
  );
  
  console.log(chalk.yellow('\nEnter new settings (empty to keep current value):'));
  
  let editingSettings = true;
  
  while (editingSettings) {
    const settingKey = await askQuestion('Setting key (or empty to finish): ');
    
    if (!settingKey) {
      editingSettings = false;
      continue;
    }
    
    const currentValue = config[pluginId].settings[settingKey];
    console.log(`Current value: ${JSON.stringify(currentValue) || 'Not set'}`);
    
    const newValueStr = await askQuestion('New value: ');
    
    if (newValueStr) {
      // Try to parse as JSON if possible
      try {
        const newValue = JSON.parse(newValueStr);
        config[pluginId].settings[settingKey] = newValue;
      } catch (e) {
        // Keep as string if not valid JSON
        config[pluginId].settings[settingKey] = newValueStr;
      }
      console.log(chalk.green(`Setting "${settingKey}" updated.`));
    }
  }
  
  await savePluginConfig(config);
  console.log(chalk.green(`\nPlugin "${plugin.name}" configuration has been updated.`));
}

// Create a new plugin
async function createPlugin() {
  const pluginId = await askQuestion(chalk.yellow('Enter new plugin ID (kebab-case): '));
  
  if (!pluginId) {
    console.log(chalk.red('Plugin ID is required.'));
    return;
  }
  
  // Validate plugin ID (kebab-case)
  if (!/^[a-z0-9-]+$/.test(pluginId)) {
    console.log(chalk.red('Plugin ID must be in kebab-case (lowercase, numbers, hyphens).'));
    return;
  }
  
  const pluginName = await askQuestion(chalk.yellow('Enter plugin name: '));
  
  if (!pluginName) {
    console.log(chalk.red('Plugin name is required.'));
    return;
  }
  
  try {
    execSync(`node scripts/generate-plugin-template.js ${pluginId} "${pluginName}"`, { 
      stdio: 'inherit' 
    });
  } catch (error) {
    console.error(chalk.red('Error running plugin template generator:'), error);
  }
}

// --- Interactive mode ---

async function showMainMenu() {
  console.log(chalk.blue('\n🔌 Deck Plugin Manager'));
  console.log(chalk.blue('===================='));
  console.log('1. List all plugins');
  console.log('2. Enable a plugin');
  console.log('3. Disable a plugin');
  console.log('4. Configure a plugin');
  console.log('5. View plugin details');
  console.log('6. Create a new plugin');
  console.log('0. Exit');
  
  const choice = await askQuestion('\nEnter your choice: ');
  
  switch (choice) {
    case '0':
      return false; // Exit
    case '1':
      await listPlugins();
      break;
    case '2':
      await enablePlugin();
      break;
    case '3':
      await disablePlugin();
      break;
    case '4':
      await configurePlugin();
      break;
    case '5':
      await showPluginDetails();
      break;
    case '6':
      await createPlugin();
      break;
    default:
      console.log(chalk.red('Invalid choice. Please try again.'));
  }
  
  return true; // Continue
}

// Main interactive mode
async function interactiveMode() {
  console.log(chalk.green('Welcome to the Deck Plugin Manager!'));
  
  let continueRunning = true;
  while (continueRunning) {
    continueRunning = await showMainMenu();
    
    if (continueRunning) {
      await askQuestion('\nPress Enter to continue...');
    }
  }
  
  console.log(chalk.green('\nThank you for using the Deck Plugin Manager. Goodbye!'));
  rl.close();
}

// --- Command line parsing ---

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'interactive') {
    await interactiveMode();
    return;
  }
  
  switch (command) {
    case 'list':
      await listPlugins();
      break;
    case 'enable':
      await enablePlugin(args[1]);
      break;
    case 'disable':
      await disablePlugin(args[1]);
      break;
    case 'details':
    case 'info':
      await showPluginDetails(args[1]);
      break;
    case 'configure':
      await configurePlugin(args[1]);
      break;
    case 'create':
      await createPlugin();
      break;
    default:
      console.log(chalk.red(`Unknown command: ${command}`));
      console.log('\nAvailable commands:');
      console.log('  list                   List all plugins');
      console.log('  enable <plugin-id>     Enable a plugin');
      console.log('  disable <plugin-id>    Disable a plugin');
      console.log('  details <plugin-id>    Show plugin details');
      console.log('  configure <plugin-id>  Configure a plugin');
      console.log('  create                 Create a new plugin');
      console.log('  interactive            Start interactive mode');
  }
  
  rl.close();
}

// Start the script
main().catch(error => {
  console.error(chalk.red('Error:'), error);
  rl.close();
  process.exit(1);
});
