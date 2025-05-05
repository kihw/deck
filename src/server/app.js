const express = require('express');
const cors = require('cors');
const path = require('path');
const Router = require('./routes');
const WebSocket = require('./websocket');
const ActionManager = require('./services/actionManager');
const AuthService = require('./services/authService');
const SecurityManager = require('./services/securityManager');
const config = require('./config');

class DeckServer {
  constructor() {
    this.app = express();
    this.httpServer = require('http').createServer(this.app);
    this.io = require('socket.io')(this.httpServer, {
      cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.securityManager = new SecurityManager(config);
    this.actionManager = new ActionManager();
    this.authService = new AuthService(this.securityManager);
    this.websocket = new WebSocket(this.io, this.actionManager, this.authService, this.securityManager);
    
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupSecurityMeasures();
  }

  setupMiddlewares() {
    // Security middleware first
    this.app.use(this.securityManager.securityHeaders);
    
    // Rate limiting
    this.app.use(this.securityManager.createRateLimiter());
    
    // CORS with restrictions
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests from localhost and private network IPs
        const allowedOrigins = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
        if (!origin || allowedOrigins.test(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }));
    
    this.app.use(express.json({ limit: '1mb' }));
    // Corrected path to serve static files
    this.app.use(express.static(path.join(__dirname, '../../src/client/dist')));
  }

  setupRoutes() {
    this.app.use('/api', Router(this.actionManager, this.authService, this.securityManager));
    
    // Security endpoint for admin monitoring
    this.app.get('/api/security/status', (req, res) => {
      res.json(this.securityManager.securityReport());
    });
    
    // Route principale
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../../src/client/dist/index.html'));
    });
    
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  setupSecurityMeasures() {
    // Set up token cleanup interval
    setInterval(() => {
      this.authService.cleanupExpiredTokens();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Set up PIN rotation if enabled
    if (config.ROTATE_PIN) {
      this.authService.scheduleRotation(24);
    }
    
    // Log security events
    this.app.use((req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${clientIP}`);
      next();
    });
  }

  start() {
    const port = config.PORT || 3000;
    this.httpServer.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Deck Server running on port ${port}`);
      console.log(`📱 Access URL: http://0.0.0.0:${port}`);
      console.log(`🔒 AUTH PIN: ${this.authService.getPin()}`);
      console.log('🛡️ Security features enabled');
    });
  }
}

module.exports = DeckServer;