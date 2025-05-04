const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

class DeckServer {
  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server);
    
    this.initMiddlewares();
    this.initRoutes();
    this.initSocketEvents();
  }

  initMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../client')));
  }

  initRoutes() {
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/index.html'));
    });
  }

  initSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log('New client connected');
      
      socket.on('createButton', (buttonConfig) => {
        // Logique de création de bouton
        this.io.emit('buttonCreated', buttonConfig);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Deck server running on port ${this.port}`);
    });
  }
}

const server = new DeckServer();
server.start();

module.exports = DeckServer;