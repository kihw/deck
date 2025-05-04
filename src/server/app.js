const express = require('express');
const cors = require('cors');
const path = require('path');
const Router = require('./routes');
const WebSocket = require('./websocket');
const ActionManager = require('./services/actionManager');
const AuthService = require('./services/authService');
const config = require('./config');

class DeckServer {
  constructor() {
    this.app = express();
    this.httpServer = require('http').createServer(this.app);
    this.io = require('socket.io')(this.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.actionManager = new ActionManager();
    this.authService = new AuthService();
    this.websocket = new WebSocket(this.io, this.actionManager, this.authService);
    
    this.setupMiddlewares();
    this.setupRoutes();
  }

  setupMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../client/dist')));
  }

  setupRoutes() {
    this.app.use('/api', Router(this.actionManager, this.authService));
    
    // Route principale
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  start() {
    const port = config.PORT || 3000;
    this.httpServer.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Deck Server running on port ${port}`);
      console.log(`📱 Access URL: http://0.0.0.0:${port}`);
      console.log(`🔒 AUTH PIN: ${this.authService.getPin()}`);
    });
  }
}

module.exports = DeckServer;