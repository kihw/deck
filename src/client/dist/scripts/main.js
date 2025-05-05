class DeckClient {
  constructor() {
    this.socket = null;
    this.token = null;
    this.pages = {};
    this.currentPage = 1;
    this.editMode = false;
    this.selectedButton = null;
    this.theme = 'light';
    
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
    this.emptyGrid = document.getElementById('empty-grid');
    this.connectionStatus = document.getElementById('connection-status');
    this.disconnectBtn = document.getElementById('disconnect-btn');
    this.themeToggle = document.getElementById('theme-toggle');
    
    // Navigation elements
    this.pageTabs = document.getElementById('page-tabs');
    this.addPageBtn = document.getElementById('add-page');
    this.editModeBtn = document.getElementById('edit-mode');
    this.addButtonBtn = document.getElementById('add-button');
    
    // Side panel elements
    this.sidePanel = document.getElementById('side-panel');
    this.closePanel = document.getElementById('close-panel');
    this.editPanel = document.getElementById('edit-panel');
    this.addPanel = document.getElementById('add-panel');
    this.buttonEditForm = document.getElementById('button-edit-form');
    this.buttonAddForm = document.getElementById('button-add-form');
    this.deleteButton = document.getElementById('delete-button');
    
    // Share elements
    this.quickShareBtn = document.getElementById('quick-share');
    this.sharePanel = document.getElementById('share-panel');
    this.qrCode = document.getElementById('qr-code');
    this.shareUrlInput = document.getElementById('share-url');
    this.copyUrlBtn = document.getElementById('copy-url');
    this.closeShareBtn = document.getElementById('close-share');
  }

  initEvents() {
    // Loading splash
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

    // Theme toggle
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Disconnect event
    if (this.disconnectBtn) {
      this.disconnectBtn.addEventListener('click', () => this.disconnect());
    }

    // Navigation events
    this.addPageBtn.addEventListener('click', () => this.addPage());
    this.editModeBtn.addEventListener('click', () => this.toggleEditMode());
    this.addButtonBtn.addEventListener('click', () => this.showAddPanel());
    
    // Panel events
    this.closePanel.addEventListener('click', () => this.hideSidePanel());
    this.buttonEditForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
    this.buttonAddForm.addEventListener('submit', (e) => this.handleAddSubmit(e));
    this.deleteButton.addEventListener('click', () => this.deleteSelectedButton());
    
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
      
      if (this.token) {
        this.socket.emit('reauthenticate', this.token);
      }
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.updateConnectionStatus('disconnected');
    });

    // Auth events
    this.socket.on('authenticated', (data) => this.onAuthenticated(data));
    this.socket.on('authentication_failed', (data) => this.onAuthFailed(data));
    
    // Page events
    this.socket.on('page_config', (config) => this.loadPages(config));
    this.socket.on('page_added', (page) => this.addPageTab(page));
    this.socket.on('page_removed', (pageId) => this.removePageTab(pageId));
    
    // Button events
    this.socket.on('button_config', (config) => this.loadButtons(config));
    this.socket.on('button_updated', (button) => this.updateButton(button));
    this.socket.on('button_added', (button) => this.addButtonToGrid(button));
    this.socket.on('button_removed', (buttonId) => this.removeButton(buttonId));
    this.socket.on('action_executed', (data) => this.showNotification(`Action exécutée`));
    this.socket.on('action_error', (data) => this.showNotification(`Erreur: ${data.error}`, 'error'));
  }

  // Auth methods
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
  }

  onAuthFailed(data) {
    this.authError.textContent = data?.error || 'PIN incorrect';
    this.authError.classList.remove('hidden');
    this.authBtn.classList.remove('btn-loading');
    
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

  // Page management
  loadPages(pages) {
    this.pages = pages;
    this.renderPageTabs();
    this.switchPage(this.currentPage);
  }

  renderPageTabs() {
    const tabs = this.pageTabs.querySelectorAll('.page-tab:not(.add-tab)');
    tabs.forEach(tab => tab.remove());
    
    Object.keys(this.pages).forEach(pageId => {
      this.addPageTab(this.pages[pageId]);
    });
  }

  addPageTab(page) {
    const tab = document.createElement('button');
    tab.className = `page-tab ${page.id == this.currentPage ? 'active' : ''}`;
    tab.dataset.page = page.id;
    tab.textContent = page.name;
    
    tab.addEventListener('click', () => this.switchPage(page.id));
    
    this.pageTabs.insertBefore(tab, this.addPageBtn);
  }

  removePageTab(pageId) {
    const tab = this.pageTabs.querySelector(`[data-page="${pageId}"]`);
    if (tab) tab.remove();
  }

  switchPage(pageId) {
    this.currentPage = pageId;
    
    // Update tab UI
    const tabs = this.pageTabs.querySelectorAll('.page-tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.page == pageId);
    });
    
    // Load page buttons
    this.loadButtons(this.pages[pageId]?.buttons || []);
  }

  addPage() {
    const newPageId = Object.keys(this.pages).length + 1;
    const newPage = {
      id: newPageId,
      name: `Page ${newPageId}`,
      buttons: []
    };
    
    this.socket.emit('add_page', { page: newPage, token: this.token });
  }

  // Button management
  loadButtons(buttons) {
    this.deckGrid.innerHTML = '';
    
    if (!buttons || buttons.length === 0) {
      this.emptyGrid.classList.remove('hidden');
      this.deckGrid.classList.add('hidden');
    } else {
      this.emptyGrid.classList.add('hidden');
      this.deckGrid.classList.remove('hidden');
      
      buttons.forEach((button, index) => {
        const delay = index * 50;
        this.createButton(button, delay);
      });
    }
  }

  createButton(config, delay = 0) {
    const button = document.createElement('button');
    button.className = `deck-button ${this.editMode ? 'edit-mode' : ''}`;
    button.dataset.buttonId = config.id;
    button.style.backgroundColor = config.color || '#3b82f6';
    button.style.animationDelay = `${delay}ms`;
    
    const icon = document.createElement('span');
    icon.className = 'button-icon';
    icon.textContent = config.icon || '⚡';
    
    const label = document.createElement('span');
    label.className = 'button-label';
    label.textContent = config.label || 'Button';
    
    button.appendChild(icon);
    button.appendChild(label);
    
    if (this.editMode) {
      button.addEventListener('click', () => this.selectButton(config));
    } else {
      button.addEventListener('click', () => this.triggerAction(config.id));
    }
    
    this.deckGrid.appendChild(button);
  }

  updateButton(button) {
    const buttonElement = this.deckGrid.querySelector(`[data-button-id="${button.id}"]`);
    if (buttonElement) {
      const icon = buttonElement.querySelector('.button-icon');
      const label = buttonElement.querySelector('.button-label');
      
      buttonElement.style.backgroundColor = button.color;
      icon.textContent = button.icon;
      label.textContent = button.label;
    }
  }

  addButtonToGrid(button) {
    this.createButton(button);
    this.hideSidePanel();
    this.showNotification('Bouton ajouté avec succès');
  }

  removeButton(buttonId) {
    const buttonElement = this.deckGrid.querySelector(`[data-button-id="${buttonId}"]`);
    if (buttonElement) {
      buttonElement.remove();
      this.hideSidePanel();
      this.showNotification('Bouton supprimé');
    }
  }

  selectButton(button) {
    this.selectedButton = button;
    this.showEditPanel();
    
    // Fill form with button data
    document.getElementById('button-label').value = button.label;
    document.getElementById('button-icon').value = button.icon;
    document.getElementById('button-color').value = button.color;
    document.getElementById('button-action').value = button.action;
  }

  deleteSelectedButton() {
    if (this.selectedButton) {
      this.socket.emit('delete_button', { 
        buttonId: this.selectedButton.id, 
        pageId: this.currentPage,
        token: this.token 
      });
    }
  }

  triggerAction(buttonId) {
    if (this.socket.connected) {
      this.socket.emit('trigger_action', { buttonId, token: this.token });
      this.animateButtonPress(buttonId);
    }
  }

  animateButtonPress(buttonId) {
    const button = this.deckGrid.querySelector(`[data-button-id="${buttonId}"]`);
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 100);
    }
  }

  // Edit mode
  toggleEditMode() {
    this.editMode = !this.editMode;
    this.editModeBtn.classList.toggle('active');
    this.editModeBtn.textContent = this.editMode ? '✓ Modifier' : '✎ Modifier';
    
    // Toggle edit mode on all buttons
    const buttons = this.deckGrid.querySelectorAll('.deck-button');
    buttons.forEach(button => {
      button.classList.toggle('edit-mode');
      if (this.editMode) {
        button.removeEventListener('click', this.triggerAction);
        button.addEventListener('click', () => {
          const buttonId = button.dataset.buttonId;
          const buttonConfig = this.pages[this.currentPage]?.buttons.find(b => b.id === buttonId);
          if (buttonConfig) this.selectButton(buttonConfig);
        });
      }
    });
  }

  // Panels
  showEditPanel() {
    this.editPanel.classList.remove('hidden');
    this.addPanel.classList.add('hidden');
    this.sidePanel.style.display = 'flex';
  }

  showAddPanel() {
    this.addPanel.classList.remove('hidden');
    this.editPanel.classList.add('hidden');
    this.sidePanel.style.display = 'flex';
  }

  hideSidePanel() {
    this.sidePanel.style.display = 'none';
    this.selectedButton = null;
  }

  // Form handling
  handleEditSubmit(e) {
    e.preventDefault();
    if (!this.selectedButton) return;
    
    const updatedButton = {
      ...this.selectedButton,
      label: document.getElementById('button-label').value,
      icon: document.getElementById('button-icon').value,
      color: document.getElementById('button-color').value,
      action: document.getElementById('button-action').value
    };
    
    this.socket.emit('update_button', { 
      button: updatedButton, 
      pageId: this.currentPage,
      token: this.token 
    });
  }

  handleAddSubmit(e) {
    e.preventDefault();
    
    const newButton = {
      id: Date.now().toString(),
      label: document.getElementById('add-button-label').value,
      icon: document.getElementById('add-button-icon').value,
      color: document.getElementById('add-button-color').value,
      action: document.getElementById('add-button-action').value
    };
    
    this.socket.emit('add_button', { 
      button: newButton, 
      pageId: this.currentPage,
      token: this.token 
    });
  }

  // Theme management
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.themeToggle.querySelector('.theme-icon').textContent = this.theme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('deck-theme', this.theme);
  }

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

  generateQRCode() {
    const url = window.location.origin;
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(url)}`;
    this.qrCode.innerHTML = `<img src="${qrUrl}" alt="QR Code">`;
    this.shareUrlInput.value = url;
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
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.deckClient = new DeckClient();
});