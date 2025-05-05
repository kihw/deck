#!/usr/bin/env node

/**
 * Deck Command Line Interface
 * 
 * A command-line tool for managing the Deck application.
 * 
 * Usage: 
 *   deck <command> [options]
 * 
 * Example:
 *   deck start --port 8080
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments
const [,, command, ...args] = process.argv;

// Define command-line arguments as object
const options = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      options[key] = args[i + 1];
      i++;
    } else {
      options[key] = true;
    }
  }
}

// Main function
async function main() {
  if (!command) {
    printHelp();
    return;
  }
  
  switch (command.toLowerCase()) {
    case 'start':
      await startDeck();
      break;
    case 'setup':
      await setupDeck();
      break;
    case 'plugin':
      await handlePluginCommand();
      break;
    case 'help':
      printHelp();
      break;
    case 'version':
      printVersion();
      break;
    default:
      console.log(`\nUnknown command: ${command}`);
      printHelp();
      break;
  }
}

/**
 * Start the Deck application
 */
async function startDeck() {
  console.log('🚀 Starting Deck...');
  
  // Update port in .env if provided
  if (options.port) {
    updateEnvValue('PORT', options.port);
    console.log(`📝 Updated PORT to ${options.port} in .env`);
  }
  
  // Run the application
  const deckProcess = spawn('node', ['main.js'], { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  // Handle process exit
  deckProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Deck process exited with code ${code}`);
      process.exit(code);
    }
  });
}

/**
 * Setup the Deck application
 */
async function setupDeck() {
  console.log('🔧 Setting up Deck...');
  
  // Ensure directories exist
  const setupProcess = spawn('node', ['scripts/setup-directories.js'], { stdio: 'inherit' });
  
  await new Promise((resolve, reject) => {
    setupProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Setup process exited with code ${code}`));
      }
    });
  });
  
  // Install dependencies if needed
  if (options.install || options.i) {
    console.log('\n📦 Installing dependencies...');
    
    const npmProcess = spawn('npm', ['install'], { stdio: 'inherit' });
    
    await new Promise((resolve, reject) => {
      npmProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Dependencies installed successfully');
          resolve();
        } else {
          console.error(`❌ Failed to install dependencies (code ${code})`);
          reject();
        }
      });
    });
  }
  
  console.log('\n✅ Setup complete. Run `node cli.js start` to start Deck.');
}

/**
 * Handle plugin-related commands
 */
async function handlePluginCommand() {
  const subCommand = args[0];
  
  if (!subCommand) {
    console.log('\nPlugin command requires a subcommand:');
    console.log('  create   Create a new plugin');
    console.log('  list     List all installed plugins');
    console.log('\nExample: deck plugin create my-plugin "My Plugin Name"');
    return;
  }
  
  switch (subCommand.toLowerCase()) {
    case 'create':
    case 'new':
      // Usage: deck plugin create my-plugin "My Plugin Name"
      const pluginId = args[1];
      const pluginName = args[2] || '';
      
      if (!pluginId) {
        console.log('\n❌ Plugin ID is required');
        console.log('\nUsage: deck plugin create plugin-id "Plugin Name"');
        console.log('Example: deck plugin create spotify-control "Spotify Control"');
        return;
      }
      
      // Run the plugin template generator
      const templateProcess = spawn('node', [
        'scripts/generate-plugin-template.js', 
        pluginId, 
        pluginName
      ], { stdio: 'inherit' });
      
      await new Promise((resolve) => {
        templateProcess.on('close', () => resolve());
      });
      break;
      
    case 'list':
      // List all plugins
      console.log('\n📋 Installed plugins:');
      
      const pluginsDir = path.join(__dirname, 'src', 'plugins');
      if (!fs.existsSync(pluginsDir)) {
        console.log('  No plugins directory found');
        return;
      }
      
      const files = fs.readdirSync(pluginsDir);
      const pluginFiles = files.filter(file => 
        (file.endsWith('.js') || file.endsWith('.ts')) && 
        !file.includes('types.') && 
        !file.includes('manager.')
      );
      
      if (pluginFiles.length === 0) {
        console.log('  No plugins found');
      } else {
        pluginFiles.forEach(file => {
          const pluginId = file.replace(/\.(js|ts)$/, '');
          console.log(`  - ${pluginId}`);
        });
        console.log(`\n✅ Found ${pluginFiles.length} plugin(s)`);
      }
      break;
      
    default:
      console.log(`\nUnknown plugin subcommand: ${subCommand}`);
      console.log('\nAvailable plugin subcommands:');
      console.log('  create   Create a new plugin');
      console.log('  list     List all installed plugins');
      break;
  }
}

/**
 * Print the help message
 */
function printHelp() {
  const packageJson = require('./package.json');
  
  console.log(`\nDeck CLI v${packageJson.version}`);
  console.log('\nUsage: deck <command> [options]');
  console.log('\nCommands:');
  console.log('  start             Start the Deck application');
  console.log('  setup             Set up the Deck application');
  console.log('  plugin <command>  Manage plugins');
  console.log('  help              Show this help message');
  console.log('  version           Show version information');
  console.log('\nOptions:');
  console.log('  --port <port>     Specify the port to run on (for start command)');
  console.log('  --install, -i     Install dependencies (for setup command)');
  console.log('\nExamples:');
  console.log('  deck start --port 8080');
  console.log('  deck setup --install');
  console.log('  deck plugin create my-plugin "My Plugin"');
}

/**
 * Print version information
 */
function printVersion() {
  const packageJson = require('./package.json');
  console.log(`Deck v${packageJson.version}`);
}

/**
 * Update a value in the .env file
 */
function updateEnvValue(key, value) {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `${key}=${value}\n`);
    return;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  
  if (regex.test(envContent)) {
    // Update existing key
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    // Add new key
    envContent = envContent.trim() + `\n${key}=${value}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
}

// Run the main function
main().catch(err => {
  console.error(`\n❌ Error: ${err.message}`);
  process.exit(1);
});
