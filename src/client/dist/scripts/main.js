class DeckClient {
  constructor() {
    this.socket = io();
    this.token = null;
    this.buttons = [];
    this.initElements();
    this.initEvents();
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
  }

  initEvents() {
    // Authentification
    this.authBtn.addEventListener('click', () => this.authenticate());
    this.pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.authenticate();
    });

    // Déconnexion
    this.disconnectBtn.addEventListener('click', () => this.disconnect());

    // WebSocket events
    this.socket.on('authenticated', (data) => this.onAuthenticated(data));
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
    
    const label = document.createElement('span');
    label.className = 'button-label';
    label.textContent = config.label;
    
    button.appendChild(label);
    
    button.addEventListener('click', () => this.triggerAction(config.id));
    this.buttonsGrid.appendChild(button);
    this.buttons.push(button);
  }

  triggerAction(buttonId) {
    this.socket.emit('trigger_action', { buttonId, token: this.token });
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