class DeckClient {
  constructor() {
    this.socket = null;
    this.token = null;
    this.buttons = [];
    this.reconnecting = false;
    this.actionQueue = [];
    this.theme = 'light';
    this.selectedButton = null;
    
    this.initElements();
    this.initEvents();
    this.connect();
  }

  initElements() {
    // Loading
    this.loadingSplash = document.getElementById('loading-splash');

    // Auth elements
    this.authContainer = document.getElementById('auth-container');
    this.pinInputs = [
      document.getElementById('pin-1'),
      document.getElementById('pin-2'),
      document.getElementById('pin-3'),
      document.getElementById('pin-4')
    ];
    this.authBtn = document.getElementById('auth-btn');
    this.authError = document.getElementById('auth-error');

    // Deck elements
    this.deckContainer = document.getElementById('deck-container');
    this.deckGrid = document.getElementById('deck-grid');
    this.connectionStatus = document.getElementById('connection-status');
    this.disconnectBtn = document.getElementById('disconnect-btn');
    this.themeToggle = document.getElementById('theme-toggle');
    
    // Share elements
    this.quickShareBtn = document.getElementById('quick-share');
    this.sharePanel = document.getElementById('share-panel');
    this.qrCode = document.getElementById('qr-code');
    this.shareUrlInput = document.getElementById('share-url');
    this.copyUrlBtn = document.getElementById('copy-url');
    this.closeShareBtn = document.getElementById('close-share');
  }

  initEvents() {
    // Loading splash - remove after delay
    setTimeout(() => {
      if (this.loadingSplash) {
        this.loadingSplash.classList.add('hidden');
        this.authContainer.classList.remove('hidden');
      }
    }, 1000);

    // PIN input events
    this.pinInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => this.handlePinInput(e, index));
      input.addEventListener('keydown', (e) => this.handlePinKeydown(e, index));
    });

    // Auth events
    this.authBtn.addEventListener('click', () => this.authenticate());

    // Disconnect event
    if (this.disconnectBtn) {
      this.disconnectBtn.addEventListener('click', () => this.disconnect());
    }

    // Theme toggle
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Share events
    if (this.quickShareBtn) {
      this.quickShareBtn.addEventListener('click', () => this.showSharePanel());
    }
    if (this.closeShareBtn) {
      this.closeShareBtn.addEventListener('click', () => this.hideSharePanel());
    }
    if (this.copyUrlBtn) {
      this.copyUrlBtn.addEventListener('click', () => this.copyShareUrl());
    }

    // Initialize theme
    this.initTheme();
  }

  connect() {
    this.socket = io({
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });
    this.initSocketEvents();
  }

  initSocketEvents() {
    // Connection states
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.updateConnectionStatus('connected');
      
      if (this.reconnecting && this.token) {
        this.socket.emit('reauthenticate', this.token);
      }
      
      this.processActionQueue();
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.updateConnectionStatus('disconnected');
      this.reconnecting = true;
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.updateConnectionStatus('connected');
      this.reconnecting = false;
    });
    
    this.socket.on('reconnecting', (attemptNumber) => {
      console.log(`Attempting to reconnect... (${attemptNumber})`);
      this.updateConnectionStatus('connecting');
    });
    
    this.socket.on('reconnect_error', (error) => {
      console.log('Reconnection error:', error);
      this.updateConnectionStatus('error');
    });
    
    this.socket.on('reconnect_failed', () => {
      console.log('Reconnection failed');
      this.updateConnectionStatus('error');
      this.showNotification('Impossible de reconnecter au serveur', 'error');
    });

    // Auth events
    this.socket.on('authenticated', (data) => this.onAuthenticated(data));
    this.socket.on('reauthenticated', (data) => this.onAuthenticated(data));
    this.socket.on('authentication_failed', (data) => this.onAuthFailed(data));
    
    // Button events
    this.socket.on('button_config', (config) => this.loadButtons(config));
    this.socket.on('action_executed', (data) => this.showNotification(`Action ${data.buttonId} exécutée`));
    this.socket.on('action_error', (data) => this.showNotification(`Erreur: ${data.error}`, 'error'));
  }

  handlePinInput(e, index) {
    const value = e.target.value;
    
    if (value && !isNaN(value)) {
      if (index < this.pinInputs.length - 1) {
        this.pinInputs[index + 1].focus();
      }
    }
    
    this.checkPinComplete();
  }

  handlePinKeydown(e, index) {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      this.pinInputs[index - 1].focus();
    }
    
    if (e.key === 'Enter') {
      this.authenticate();
    }
  }

  checkPinComplete() {
    const pin = this.pinInputs.map(input => input.value).join('');
    this.authBtn.disabled = pin.length !== 4;
  }

  authenticate() {
    const pin = this.pinInputs.map(input => input.value).join('');
    if (pin.length === 4) {
      this.authBtn.classList.add('btn-loading');
      this.socket.emit('authenticate', pin);
    }
  }

  onAuthenticated(data) {
    this.token = data.token;
    this.authContainer.classList.add('hidden');
    this.deckContainer.classList.remove('hidden');
    this.generateQRCode();
    this.socket.emit('get_config', { token: this.token });
    this.authBtn.classList.remove('btn-loading');
    this.reconnecting = false;
  }

  onAuthFailed(data) {
    this.authError.textContent = data?.error || 'PIN incorrect';
    this.authError.classList.remove('hidden');
    this.authBtn.classList.remove('btn-loading');
    
    // Reset PIN inputs
    this.pinInputs.forEach(input => {
      input.value = '';
    });
    this.pinInputs[0].focus();
    this.checkPinComplete();
  }

  disconnect() {
    this.socket.emit('disconnect', { token: this.token });
    this.token = null;
    this.authContainer.classList.remove('hidden');
    this.deckContainer.classList.add('hidden');
    this.authError.classList.add('hidden');
    this.pinInputs.forEach(input => {
      input.value = '';
    });
    this.pinInputs[0].focus();
  }

  loadButtons(config) {
    this.deckGrid.innerHTML = '';
    this.buttons = [];

    config.forEach((buttonConfig, index) => {
      const delay = index * 50; // Stagger animation
      this.createButton(buttonConfig, delay);
    });
  }

  createButton(config, delay = 0) {
    const button = document.createElement('button');
    button.className = 'deck-button';
    button.dataset.buttonId = config.id;
    button.dataset.type = config.type;
    button.style.animationDelay = `${delay}ms`;
    
    const label = document.createElement('span');
    label.className = 'button-label';
    label.textContent = config.label;
    
    button.appendChild(label);
    
    button.addEventListener('click', () => this.triggerAction(config.id));
    
    this.deckGrid.appendChild(button);
    this.buttons.push(button);
  }

  triggerAction(buttonId) {
    if (this.socket.connected) {
      this.socket.emit('trigger_action', { buttonId, token: this.token });
      this.animateButtonPress(buttonId);
    } else {
      this.actionQueue.push({ buttonId, token: this.token });
      this.showNotification('Action mise en file d\'attente', 'info');
    }
  }
  
  animateButtonPress(buttonId) {
    const button = document.querySelector(`[data-button-id="${buttonId}"]`);
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 100);
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
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(url)}`;
    this.qrCode.innerHTML = `<img src="${qrUrl}" alt="QR Code">`;
    this.shareUrlInput.value = url;
  }

  // Theme management
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.themeToggle.querySelector('.theme-icon').textContent = this.theme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('deck-theme', this.theme);
  }

  // Connection status
  updateConnectionStatus(status) {
    const statusEl = this.connectionStatus;
    if (!statusEl) return;
    
    const statusText = statusEl.querySelector('.status-text');
    
    statusEl.className = `connection-status ${status}`;
    
    switch (status) {
      case 'connected':
        statusText.textContent = 'Connecté';
        break;
      case 'disconnected':
        statusText.textContent = 'Déconnecté';
        break;
      case 'connecting':
        statusText.textContent = 'Connexion...';
        break;
      case 'error':
        statusText.textContent = 'Erreur de connexion';
        break;
    }
  }

  // Share panel
  showSharePanel() {
    if (this.sharePanel) {
      this.sharePanel.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  hideSharePanel() {
    if (this.sharePanel) {
      this.sharePanel.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  copyShareUrl() {
    if (this.shareUrlInput) {
      this.shareUrlInput.select();
      document.execCommand('copy');
      this.copyUrlBtn.querySelector('.copy-icon').textContent = '✓';
      this.showNotification('URL copiée dans le presse-papier', 'success');
      
      setTimeout(() => {
        this.copyUrlBtn.querySelector('.copy-icon').textContent = '📋';
      }, 2000);
    }
  }

  // Notifications
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Initialize theme from localStorage
  initTheme() {
    const savedTheme = localStorage.getItem('deck-theme');
    if (savedTheme) {
      this.theme = savedTheme;
      document.documentElement.setAttribute('data-theme', this.theme);
      if (this.themeToggle) {
        this.themeToggle.querySelector('.theme-icon').textContent = this.theme === 'light' ? '🌙' : '☀️';
      }
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.deckClient = new DeckClient();
});