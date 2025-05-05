#!/usr/bin/env node

/**
 * Setup Directories Script for Deck
 * 
 * This script ensures that all required directories for the Deck application exist.
 * It creates the necessary folder structure for plugins, assets, logs, and more.
 */

const fs = require('fs');
const path = require('path');

// Get project root directory
const rootDir = path.resolve(__dirname, '..');

// Define directories to create
const directories = [
  // Core application directories
  'logs',
  'assets',
  'src/client/dist/scripts',
  'src/client/dist/styles',
  
  // Icon categories
  'assets/icons',
  'assets/icons/system',
  'assets/icons/streaming',
  'assets/icons/media',
  'assets/icons/social', 
  'assets/icons/utilities',
  'assets/icons/custom',
  
  // Plugin directories
  'src/plugins',
  'src/config',
  
  // Test directories
  'tests/plugins',
  'tests/client',
  'tests/server'
];

console.log('🚀 Setting up directories for Deck application...');

// Create each directory
let createdCount = 0;
let existingCount = 0;

directories.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created: ${dir}`);
    createdCount++;
  } else {
    console.log(`ℹ️  Already exists: ${dir}`);
    existingCount++;
  }
});

console.log(`\n✨ Directory setup complete!`);
console.log(`📁 Created: ${createdCount} directories`);
console.log(`📂 Already existed: ${existingCount} directories`);

// Check for .env file and create from example if needed
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('\n🔧 Creating .env file from .env.example');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Created .env file');
} else if (!fs.existsSync(envPath)) {
  console.log('\n🔧 Creating default .env file');
  
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
LOG_LEVEL=info

# OBS WebSocket
OBS_ADDRESS=localhost:4444
OBS_PASSWORD=

# Spotify API
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log('✅ Created default .env file');
} else {
  console.log('\n✅ .env file already exists');
}

console.log('\n👍 Setup complete. You can now start the Deck application.');
