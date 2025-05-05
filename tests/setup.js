// tests/setup.js
const fs = require('fs');
const path = require('path');

// Configuration globale des tests
global.setupTestEnvironment = () => {
  // Créer un répertoire temporaire pour les tests
  const tempTestDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempTestDir)) {
    fs.mkdirSync(tempTestDir);
  }
  return tempTestDir;
};

global.cleanupTestEnvironment = (tempDir) => {
  // Supprimer le répertoire temporaire
  fs.rmSync(tempDir, { recursive: true, force: true });
};