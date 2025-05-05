/**
 * Deck - Stream Deck Virtuel Accessible à Distance
 * Point d'entrée principal de l'application
 */

const DeckServer = require('./src/server/app');
const PluginLoader = require('./src/plugins/PluginLoader');
const Logger = require('./src/logging/logger');
const config = require('./src/server/config');
const path = require('path');

class DeckApplication {
  constructor() {
    this.logger = new Logger(path.join(__dirname, 'logs'));
    this.server = new DeckServer();
    this.pluginLoader = new PluginLoader(path.join(__dirname, 'src/plugins'));
    this.isRunning = false;
  }

  async initialize() {
    try {
      this.logger.info('🚀 Initializing Deck application...');
      
      // Chargement des plugins
      this.pluginLoader.loadPlugins();
      
      // Initialisation des plugins
      await this.pluginLoader.initializePlugins(this.server);
      
      // Enregistrement des actions des plugins
      this.pluginLoader.registerPluginActions(this.server.actionRegistry);
      
      this.isRunning = true;
      this.logger.info('✅ Deck application initialized successfully');
      
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize application', error);
      throw error;
    }
  }

  async start() {
    try {
      if (!this.isRunning) {
        await this.initialize();
      }
      
      // Démarrage du serveur
      this.server.start();
      
      // Affichage des informations de connexion
      this.displayConnectionInfo();
      
      // Configuration des gestionnaires de processus
      this.setupProcessHandlers();
      
      return true;
    } catch (error) {
      this.logger.error('Failed to start application', error);
      process.exit(1);
    }
  }

  async stop() {
    try {
      this.logger.info('🛑 Stopping Deck application...');
      
      if (this.pluginLoader) {
        await this.pluginLoader.unloadPlugins();
      }
      
      if (this.server) {
        await this.server.stop();
      }
      
      this.isRunning = false;
      this.logger.info('✅ Deck application stopped gracefully');
      
      return true;
    } catch (error) {
      this.logger.error('Error during application shutdown', error);
      throw error;
    }
  }

  displayConnectionInfo() {
    const port = config.PORT || 3000;
    const pin = this.server.authService.getPin();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎮 DECK - Virtual Stream Deck');
    console.log('='.repeat(50));
    console.log(`📡 Server running at: http://localhost:${port}`);
    console.log(`🔑 Authentication PIN: ${pin}`);
    console.log('=' .repeat(50));
    console.log('\n📱 How to connect:');
    console.log(`   1. Open http://localhost:${port} in your browser`);
    console.log(`   2. Enter PIN: ${pin}`);
    console.log('   3. Start using your virtual Stream Deck!');
    console.log('\n⚡ Press Ctrl+C to stop the server');
    console.log('-'.repeat(50));
  }

  setupProcessHandlers() {
    // Gestion propre de l'arrêt
    const shutdown = async (signal) => {
      this.logger.info(`\n${signal} received. Shutting down gracefully...`);
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        this.logger.error('Error during shutdown', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Gestion des erreurs non capturées
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  }

  async restart() {
    try {
      this.logger.info('🔄 Restarting Deck application...');
      await this.stop();
      await this.start();
      return true;
    } catch (error) {
      this.logger.error('Failed to restart application', error);
      throw error;
    }
  }
}

// Création et démarrage de l'application
if (require.main === module) {
  const app = new DeckApplication();
  
  // Démarrage de l'application
  app.start().catch(error => {
    console.error('Failed to start Deck application:', error);
    process.exit(1);
  });
}

module.exports = DeckApplication;
