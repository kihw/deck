const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

class DeckServer {
    constructor(port = 3000) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server);
        this.port = port;

        this.initMiddlewares();
        this.initSocketEvents();
    }

    initMiddlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('frontend'));
    }

    initSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log('New client connected');

            socket.on('buttonConfig', (config) => {
                // Gestion de la configuration des boutons
                this.handleButtonConfig(socket, config);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    handleButtonConfig(socket, config) {
        // Logique de configuration des boutons
        socket.broadcast.emit('buttonConfigUpdated', config);
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Deck server running on port ${this.port}`);
        });
    }
}

module.exports = DeckServer;