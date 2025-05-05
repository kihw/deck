class WebSocket {
  constructor(io, actionManager, authService, securityManager) {
    this.io = io;
    this.actionManager = actionManager;
    this.authService = authService;
    this.securityManager = securityManager;
    this.setupEvents();
  }

  setupEvents() {
    this.io.on('connection', (socket) => {
      const clientIP = socket.handshake.address || socket.conn.remoteAddress;
      console.log(`New connection: ${socket.id} from ${clientIP}`);
      
      // Authentification
      socket.on('authenticate', async (pin) => {
        const authResult = await this.authService.verifyPin(pin, clientIP);
        
        if (authResult.success) {
          const token = this.authService.generateToken();
          socket.token = token;
          socket.authenticated = true;
          this.authService.addConnection(token, socket.id, clientIP);
          socket.emit('authenticated', { token, success: true });
          this.broadcastButtonConfig(socket);
        } else {
          socket.emit('authentication_failed', { success: false, error: authResult.error });
        }
      });
      
      // Ré-authentification après déconnexion
      socket.on('reauthenticate', (token) => {
        if (this.authService.verifyToken(token)) {
          socket.token = token;
          socket.authenticated = true;
          socket.emit('reauthenticated', { token, success: true });
          this.broadcastButtonConfig(socket);
        } else {
          socket.emit('authentication_failed', { success: false });
        }
      });

      // Vérification du token pour les autres événements
      socket.use((packet, next) => {
        if (packet[0] === 'authenticate' || packet[0] === 'reauthenticate') return next();
        
        const token = packet[1]?.token;
        if (this.authService.verifyToken(token)) {
          next();
        } else {
          next(new Error('Authentication required'));
        }
      });

      // Événements après authentification
      socket.on('trigger_action', async (data) => {
        const { buttonId } = data;
        try {
          await this.actionManager.executeAction(buttonId);
          socket.emit('action_executed', { buttonId, success: true });
        } catch (error) {
          socket.emit('action_error', { buttonId, error: error.message });
        }
      });

      socket.on('get_config', () => {
        this.broadcastButtonConfig(socket);
      });

      socket.on('update_button', (data) => {
        const { buttonId, config } = data;
        // Validate button config for security
        if (!this.securityManager.validateButtonConfig(config)) {
          socket.emit('button_update_error', { error: 'Invalid button configuration' });
          return;
        }
        
        this.actionManager.updateButton(buttonId, config);
        this.io.emit('button_updated', { buttonId, config });
      });

      socket.on('disconnect', () => {
        console.log(`Connection lost: ${socket.id}`);
        if (socket.token) {
          this.authService.removeConnection(socket.token);
        }
      });
      
      // Debug: Log all events
      if (process.env.NODE_ENV === 'development') {
        socket.onAny((event, ...args) => {
          console.log(`[${socket.id}] ${event}:`, args);
        });
      }
    });
  }

  broadcastButtonConfig(socket) {
    const config = this.actionManager.getButtonConfigs();
    socket.emit('button_config', config);
  }
}

module.exports = WebSocket;