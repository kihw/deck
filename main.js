/**
 * Deck - Stream Deck Virtuel Accessible à Distance
 * Point d'entrée principal de l'application
 * Version: 1.1.2
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const PluginLoader = require('./src/plugins/PluginLoader');
const ActionRegistry = require('./src/server/action-registry');
const Logger = require('./src/logging/logger');
const AuthService = require('./src/server/services/authService');
const SecurityManager = require('./src/server/services/securityManager');

class DeckApplication {
  constructor() {
    this.config = this.loadConfig();
    this.logger = new Logger(path.join(__dirname, 'logs'));
    
    // Initialize core components
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIO(this.server, {
      cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    // Initialize service layer
    this.securityManager = new SecurityManager(this.config);
    this.actionRegistry = new ActionRegistry();
    this.authService = new AuthService(this.securityManager);
    
    // Initialize plugin system
    this.pluginLoader = new PluginLoader(path.join(__dirname, 'src', 'plugins'));
    
    this.isRunning = false;
  }

  loadConfig() {
    // Load configuration from environment variables
    return {
      PORT: process.env.PORT || 3000,
      HOST: process.env.HOST || '0.0.0.0',
      PIN_LENGTH: process.env.PIN_LENGTH || 4,
      PIN_CUSTOM: process.env.PIN_CUSTOM || null,
      MAX_CONNECTIONS: process.env.MAX_CONNECTIONS || 10,
      SESSION_TIMEOUT: process.env.SESSION_TIMEOUT || 3600000, // 1 hour by default
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      OBS_ADDRESS: process.env.OBS_ADDRESS || 'localhost:4444',
      OBS_PASSWORD: process.env.OBS_PASSWORD || '',
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || '',
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || ''
    };
  }

  async initialize() {
    try {
      this.logger.info('🚀 Initializing Deck application...');
      
      // Set up middleware
      this.setupMiddlewares();
      
      // Set up routes
      this.setupRoutes();
      
      // Set up WebSocket events
      this.setupWebSocket();
      
      // Load plugins
      this.logger.info('📦 Loading plugins...');
      this.pluginLoader.loadPlugins();
      
      // Initialize plugins
      this.logger.info('🔌 Initializing plugins...');
      await this.pluginLoader.initializePlugins(this);
      
      // Register plugin actions in the action registry
      this.pluginLoader.registerPluginActions(this.actionRegistry);
      
      this.isRunning = true;
      this.logger.info('✅ Deck application initialized successfully');
      
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize application', error);
      throw error;
    }
  }

  setupMiddlewares() {
    // Apply security headers
    this.app.use(this.securityManager.securityHeaders);
    
    // Parse JSON request bodies
    this.app.use(express.json({ limit: '1mb' }));
    
    // Serve static files
    this.app.use(express.static(path.join(__dirname, 'src/client/dist')));
    
    // Log requests in development mode
    if (process.env.NODE_ENV !== 'production') {
      this.app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
      });
    }
  }

  setupRoutes() {
    // Main route
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'src/client/dist/index.html'));
    });
    
    // API routes
    const apiRouter = express.Router();
    
    // Status endpoint
    apiRouter.get('/status', (req, res) => {
      res.json({
        status: 'online',
        version: '1.1.2',
        uptime: process.uptime(),
        pluginsLoaded: this.pluginLoader.getLoadedPluginNames(),
        activeConnections: this.authService.getActiveConnectionsCount()
      });
    });
    
    // Add API router to main app
    this.app.use('/api', apiRouter);
    
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  setupWebSocket() {
    // Setup connection event
    this.io.on('connection', (socket) => {
      const clientIP = socket.handshake.address || socket.conn.remoteAddress;
      this.logger.info(`New connection: ${socket.id} from ${clientIP}`);
      
      // Authenticate with PIN
      socket.on('authenticate', async (pin) => {
        const authResult = await this.authService.verifyPin(pin, clientIP);
        
        if (authResult.success) {
          const token = this.authService.generateToken();
          socket.token = token;
          socket.authenticated = true;
          this.authService.addConnection(token, socket.id, clientIP);
          socket.emit('authenticated', { token, success: true });
          
          // Send initial button configuration
          this.sendButtonConfiguration(socket);
        } else {
          socket.emit('authentication_failed', { 
            success: false, 
            error: authResult.error || 'Invalid PIN'
          });
        }
      });
      
      // Re-authenticate with token after reconnect
      socket.on('reauthenticate', (token) => {
        if (this.authService.verifyToken(token)) {
          socket.token = token;
          socket.authenticated = true;
          socket.emit('reauthenticated', { token, success: true });
          
          // Send initial button configuration
          this.sendButtonConfiguration(socket);
        } else {
          socket.emit('authentication_failed', { success: false });
        }
      });
      
      // Authentication middleware for other events
      socket.use((packet, next) => {
        if (packet[0] === 'authenticate' || packet[0] === 'reauthenticate') {
          return next();
        }
        
        if (!socket.authenticated) {
          return next(new Error('Authentication required'));
        }
        
        // Verify token if present
        const token = packet[1]?.token;
        if (token && !this.authService.verifyToken(token)) {
          return next(new Error('Invalid token'));
        }
        
        next();
      });
      
      // Handle action execution
      socket.on('trigger_action', async (data) => {
        try {
          if (!socket.authenticated) {
            socket.emit('action_error', { error: 'Authentication required' });
            return;
          }
          
          const { buttonId } = data;
          const result = await this.actionRegistry.executeAction(buttonId);
          socket.emit('action_executed', { buttonId, result });
        } catch (error) {
          this.logger.error(`Error executing action: ${error.message}`);
          socket.emit('action_error', { error: error.message });
        }
      });
      
      // Plugin action execution
      socket.on('plugin_action', async (data, callback) => {
        try {
          if (!socket.authenticated) {
            callback({ success: false, error: 'Authentication required' });
            return;
          }
          
          const { plugin, action, params } = data;
          
          if (!plugin || !action) {
            callback({ success: false, error: 'Plugin and action are required' });
            return;
          }
          
          const result = await this.pluginLoader.executePluginAction(plugin, action, params);
          callback({ success: true, data: result });
        } catch (error) {
          this.logger.error(`Error executing plugin action: ${error.message}`);
          callback({ success: false, error: error.message });
        }
      });
      
      // Get configuration
      socket.on('get_config', () => {
        if (socket.authenticated) {
          this.sendButtonConfiguration(socket);
        }
      });
      
      // Update button
      socket.on('update_button', (data) => {
        if (!socket.authenticated) return;
        
        try {
          const { button, pageId } = data;
          
          // Updated button handling logic would go here
          
          // Broadcast button updated to all clients
          this.io.emit('button_updated', { button, pageId });
        } catch (error) {
          this.logger.error(`Error updating button: ${error.message}`);
          socket.emit('button_update_error', { error: error.message });
        }
      });
      
      // Add button
      socket.on('add_button', (data) => {
        if (!socket.authenticated) return;
        
        try {
          const { button, pageId } = data;
          
          // Add button handling logic would go here
          
          // Broadcast button added to all clients
          this.io.emit('button_added', { button, pageId });
        } catch (error) {
          this.logger.error(`Error adding button: ${error.message}`);
          socket.emit('button_add_error', { error: error.message });
        }
      });
      
      // Delete button
      socket.on('delete_button', (data) => {
        if (!socket.authenticated) return;
        
        try {
          const { buttonId, pageId } = data;
          
          // Delete button handling logic would go here
          
          // Broadcast button deleted to all clients
          this.io.emit('button_removed', { buttonId, pageId });
        } catch (error) {
          this.logger.error(`Error deleting button: ${error.message}`);
          socket.emit('button_delete_error', { error: error.message });
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        this.logger.info(`Connection closed: ${socket.id}`);
        
        if (socket.token) {
          this.authService.removeConnection(socket.token);
        }
      });
    });
  }

  sendButtonConfiguration(socket) {
    // In a real implementation, this would fetch the button configuration
    // from a database or configuration file
    const dummyConfig = {
      pages: {
        1: {
          id: 1,
          name: 'Main Page',
          buttons: [
            {
              id: 'volume-up',
              label: 'Volume Up',
              icon: '🔊',
              action: 'volumeUp',
              color: '#3b82f6'
            },
            {
              id: 'volume-down',
              label: 'Volume Down',
              icon: '🔉',
              action: 'volumeDown',
              color: '#3b82f6'
            },
            {
              id: 'obs-toggle',
              label: 'OBS Stream',
              icon: '🎬',
              action: 'obs.toggleStream',
              color: '#ef4444'
            }
          ]
        }
      }
    };
    
    socket.emit('page_config', dummyConfig.pages);
  }

  async start() {
    try {
      if (!this.isRunning) {
        await this.initialize();
      }
      
      const port = this.config.PORT;
      const host = this.config.HOST;
      
      this.server.listen(port, host, () => {
        this.logger.info(`🚀 Deck Server running on port ${port}`);
        
        // Display connection information
        const pin = this.authService.getPin();
        
        console.log('\n' + '='.repeat(50));
        console.log(chalk.blue('🎮 DECK - Virtual Stream Deck'));
        console.log('='.repeat(50));
        console.log(chalk.green(`📡 Server running at: http://${host}:${port}`));
        console.log(chalk.yellow(`🔑 Authentication PIN: ${pin}`));
        console.log('=' .repeat(50));
        console.log('\n📱 How to connect:');
        console.log(chalk.white(`   1. Open http://${host === '0.0.0.0' ? 'localhost' : host}:${port} in your browser`));
        console.log(chalk.white(`   2. Enter PIN: ${pin}`));
        console.log(chalk.white('   3. Start using your virtual Stream Deck!'));
        console.log('\n' + chalk.gray('⚡ Press Ctrl+C to stop the server'));
        console.log('-'.repeat(50));
      });
      
      // Setup process handlers
      this.setupProcessHandlers();
      
      return true;
    } catch (error) {
      this.logger.error('Failed to start application', error);
      throw error;
    }
  }

  async stop() {
    try {
      this.logger.info('🛑 Stopping Deck application...');
      
      // Unload plugins
      if (this.pluginLoader) {
        this.logger.info('Unloading plugins...');
        await this.pluginLoader.unloadPlugins();
      }
      
      // Close the server if it's running
      if (this.server && this.server.listening) {
        await new Promise((resolve) => {
          this.server.close(() => {
            this.logger.info('Server closed');
            resolve();
          });
        });
      }
      
      this.isRunning = false;
      this.logger.info('✅ Deck application stopped gracefully');
      
      return true;
    } catch (error) {
      this.logger.error('Error during application shutdown', error);
      throw error;
    }
  }

  setupProcessHandlers() {
    // Handle graceful shutdown
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

    // Handle termination signals
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
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

// Check if this file is being run directly
if (require.main === module) {
  const app = new DeckApplication();
  
  app.start().catch(error => {
    console.error(chalk.red('Failed to start Deck application:'), error);
    process.exit(1);
  });
}

module.exports = DeckApplication;