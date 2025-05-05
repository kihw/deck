#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

console.log(`${colors.blue}🚀 Deck Post-Installation Setup${colors.reset}`);
console.log('--------------------------------');

// Create .env file if not exists
const envPath = path.resolve('.env');
const envExamplePath = path.resolve('.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log(`${colors.green}✓${colors.reset} Created .env file from .env.example`);
} else if (fs.existsSync(envPath)) {
  console.log(`${colors.yellow}ℹ${colors.reset} .env file already exists`);
}

// Ensure directories exist
const dirs = [
  'src/client/dist',
  'src/client/dist/scripts',
  'src/client/dist/styles',
  'logs',
  'coverage'
];

dirs.forEach(dir => {
  const dirPath = path.resolve(dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`${colors.green}✓${colors.reset} Created directory: ${dir}`);
  }
});

// Set executable permissions for scripts
const scriptsToChmod = [
  'main.js',
  'install.sh'
];

scriptsToChmod.forEach(script => {
  const scriptPath = path.resolve(script);
  if (fs.existsSync(scriptPath)) {
    fs.chmodSync(scriptPath, '755');
    console.log(`${colors.green}✓${colors.reset} Set executable permissions for ${script}`);
  }
});

console.log('\n' + colors.green + '🎉 Setup complete!' + colors.reset);
console.log('--------------------------------');
console.log(`Run ${colors.blue}deck start${colors.reset} to launch your virtual Stream Deck`);
console.log('For more information, see the documentation in docs/');
