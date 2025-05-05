const DeckServer = require('./server/app');

// Créer et démarrer le serveur
const server = new DeckServer();
server.start();

// Gestion des signaux pour l'arrêt propre
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
  console.log('\n🛑 Arrêt du serveur en cours...');
  process.exit(0);
}