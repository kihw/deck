const path = require('path');
const DeckServer = require('./server/app');
const PluginLoader = require('./plugins/PluginLoader');

// Create and initialize the plugin loader
const pluginLoader = new PluginLoader(path.join(__dirname, 'plugins'));

// Create the server
const server = new DeckServer();

async function startApplication() {
  try {
    // Load plugins first
    pluginLoader.loadPlugins();

    // Initialize plugins with the server
    await pluginLoader.initializePlugins(server);

    // Register plugin actions
    pluginLoader.registerPluginActions(server.actionRegistry);

    // Start the server
    server.start();

    console.log('Deck application started successfully');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
function gracefulShutdown() {
  console.log('\n🛑 Stopping server...');
  
  // Unload plugins
  pluginLoader.unloadPlugins()
    .then(() => {
      server.stop();
      process.exit(0);
    })
    .catch(error => {
      console.error('Error during shutdown:', error);
      process.exit(1);
    });
}

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start the application
startApplication();