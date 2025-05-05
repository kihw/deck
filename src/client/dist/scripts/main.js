class DeckClient {
  constructor() {
    this.socket = null;
    this.token = null;
    this.buttons = [];
    this.reconnecting = false;
    this.actionQueue = [];
    this.initElements();
    this.initEvents();
    this.connect();
  }

  initElements() {
    // Éléments d'authentification
    this.authContainer = document.getElementById('auth-container');
    this.pinInput = document.getElementById('pin');
    this.authBtn = document.getElementById('auth-btn');
    this.authError = document.getElementById('auth-error');

    // Éléments principaux
    this.deckContainer = document.getElementById('deck-container');
    this.buttonsGrid = document.getElementById('buttons-grid');
    this.disconnectBtn = document.getElementById('disconnect-btn');
    
    // Éléments de partage
    this.qrContainer = document.getElementById('qr-container');
    this.shareUrl = document.getElementById('share-url');
    
    // Élément de statut de connexion
    this.statusIndicator = document.createElement('div');
    this.statusIndicator.className = 'connection-status connected';
    this.statusIndicator.textContent = 'Connecté';
    this.deckContainer.appendChild(this.statusIndicator);
  }

  connect() {
    this.socket = io();
    this.initSocketEvents();
  }

  initEvents() {
    // Authentification
    this.authBtn.addEventListener('click', () => this.authenticate());
    this.pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.authenticate();
    });

    // Déconnexion
    this.disconnectBtn.addEventListener('click', () => this.disconnect());
  }

  initSocketEvents() {
    // États de connexion
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.statusIndicator.className = 'connection-status connected';
      this.statusIndicator.textContent = 'Connecté';
      
      if (this.reconnecting && this.token) {
        // Ré-authentification après reconnexion
        this.socket.emit('reauthenticate', this.token);
      }
      
      this.processActionQueue();
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.statusIndicator.className = 'connection-status disconnected';
      this.statusIndicator.textContent = 'Déconnecté';
      this.reconnecting = true;
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.statusIndicator.className = 'connection-status connected';
      this.statusIndicator.textContent = 'Connecté';
      this.reconnecting = false;
    });
    
    this.socket.on('reconnect_error', (error) => {
      console.log('Reconnection error:', error);
      this.statusIndicator.className = 'connection-status error';
      this.statusIndicator.textContent = 'Erreur de connexion';
    });
    
    this.socket.on('reconnect_failed', () => {
      console.log('Reconnection failed');
      this.statusIndicator.className = 'connection-status error';
      this.statusIndicator.textContent = 'Connexion échouée';
      this.showNotification('Impossible de reconnecter au serveur', 'error');
    });

    // Authentification
    this.socket.on('authenticated', (data) => this.onAuthenticated(data));
    this.socket.on('reauthenticated', (data) => this.onAuthenticated(data));
    this.socket.on('authentication_failed', () => this.onAuthFailed());
    this.socket.on('button_config', (config) => this.loadButtons(config));
    this.socket.on('action_executed', (data) => this.showNotification(`Action ${data.buttonId} exécutée`));
    this.socket.on('action_error', (data) => this.showNotification(`Erreur: ${data.error}`, 'error'));
  }

  authenticate() {
    const pin = this.pinInput.value;
    if (pin.length === 4) {
      this.socket.emit('authenticate', pin);
    }
  }

  onAuthenticated(data) {
    this.token = data.token;
    this.authContainer.classList.add('hidden');
    this.deckContainer.classList.remove('hidden');
    this.generateQRCode();
    this.socket.emit('get_config', { token: this.token });
    this.reconnecting = false;
  }

  onAuthFailed() {
    this.authError.classList.remove('hidden');
    this.pinInput.value = '';
    this.pinInput.focus();
  }

  disconnect() {
    this.socket.emit('disconnect', { token: this.token });
    this.token = null;
    this.authContainer.classList.remove('hidden');
    this.deckContainer.classList.add('hidden');
  }

  loadButtons(config) {
    this.buttonsGrid.innerHTML = '';
    this.buttons = [];

    config.forEach(buttonConfig => {
      this.createButton(buttonConfig);
    });
  }

  createButton(config) {
    const button = document.createElement('button');
    button.className = 'deck-button';
    button.dataset.buttonId = config.id;
    button.dataset.type = config.type; // Add type data attribute for styling
    
    const label = document.createElement('span');
    label.className = 'button-label';
    label.textContent = config.label;
    
    button.appendChild(label);
    
    button.addEventListener('click', () => this.triggerAction(config.id));
    this.buttonsGrid.appendChild(button);
    this.buttons.push(button);
  }

  triggerAction(buttonId) {
    if (this.socket.connected) {
      this.socket.emit('trigger_action', { buttonId, token: this.token });
    } else {
      // Ajouter à la queue si déconnecté
      this.actionQueue.push({ buttonId, token: this.token });
      this.showNotification('Action mise en file d\'attente', 'info');
    }
  }
  
  processActionQueue() {
    while (this.actionQueue.length > 0 && this.socket.connected) {
      const action = this.actionQueue.shift();
      this.socket.emit('trigger_action', action);
    }
  }

  generateQRCode() {
    const url = window.location.origin;
    const qr = document.getElementById('qr-code');
    
    // Using Google QR API for simplicity
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(url)}`;
    qr.innerHTML = `<img src="${qrUrl}" alt="QR Code">`;
    
    this.shareUrl.textContent = url;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DeckClient();
});