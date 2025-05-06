#!/usr/bin/env node

/**
 * Deck - Quick Start Script
 * 
 * This script provides a streamlined way to start the Deck application
 * with proper initialization of all required components.
 */

const DeckApplication = require('./main');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');

// Display welcome message
console.log(chalk.blue('\n🚀 Deck - Virtual Stream Deck'));
console.log(chalk.blue('========================\n'));

// Check for dependencies
try {
  // Ensure the .env file exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log(chalk.yellow('ℹ️ .env file not found, creating from example...'));
    
    const envExamplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log(chalk.green('✅ Created .env file from example'));
    } else {
      console.log(chalk.yellow('ℹ️ .env.example not found, creating default .env file...'));
      
      // Create minimal .env file
      const defaultEnv = `# Server Configuration
PORT=3000
HOST=0.0.0.0

# Authentication
PIN_LENGTH=4
PIN_CUSTOM=

# Connection Limits
MAX_CONNECTIONS=10
SESSION_TIMEOUT=3600000

# Logging
LOG_LEVEL=info`;
      
      fs.writeFileSync(envPath, defaultEnv);
      console.log(chalk.green('✅ Created default .env file'));
    }
  }
  
  // Check for required directories
  const requiredDirs = [
    'logs',
    'assets/icons',
    'src/client/dist'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(chalk.yellow(`ℹ️ Creating required directory: ${dir}`));
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
  
  // Run setup scripts if they haven't been run yet
  const iconDirs = [
    'assets/icons/system',
    'assets/icons/streaming',
    'assets/icons/media', 
    'assets/icons/social',
    'assets/icons/utilities',
    'assets/icons/custom'
  ];
  
  // Check if Icon Manager directories need to be set up
  const needsIconSetup = iconDirs.some(dir => !fs.existsSync(path.join(__dirname, dir)));
  
  if (needsIconSetup) {
    console.log(chalk.yellow('ℹ️ Setting up Icon Manager directories...'));
    require('./scripts/setup-icon-manager');
  }
  
  // Create the application instance
  const app = new DeckApplication();
  
  // Start the application
  console.log(chalk.white('\nStarting Deck application...\n'));
  app.start()
    .then(() => {
      // Success is handled by the application itself with console output
    })
    .catch(error => {
      console.error(chalk.red('\n❌ Failed to start Deck application:'));
      console.error(error);
      process.exit(1);
    });
  
} catch (error) {
  console.error(chalk.red('\n❌ Error during startup:'));
  console.error(error);
  process.exit(1);
}
