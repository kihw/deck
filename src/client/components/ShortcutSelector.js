/**
 * Composant de sélection de raccourcis système pour l'interface utilisateur de Deck
 * Permet de choisir parmi les raccourcis système disponibles et d'en créer de nouveaux
 */

class ShortcutSelector {
  constructor(socket, containerId, options = {}) {
    this.socket = socket;
    this.container = document.getElementById(containerId);
    this.options = {
      onSelect: () => {},
      maxHeight: '300px',
      showAddNew: true,
      ...options
    };
    
    this.shortcuts = [];
    this.currentPlatform = '';
    this.formExpanded = false;
    
    this.init();
  }
  
  /**
   * Initialisation du composant
   */
  init() {
    if (!this.container) {
      console.error('Container not found');
      return;
    }
    
    this.render();
    this.bindEvents();
    this.loadShortcuts();
  }
  
  /**
   * Rendu du composant
   */
  render() {
    this.container.innerHTML = `
      <div class="shortcut-selector">
        <div class="shortcut-selector__title">
          <h3>Raccourcis Système</h3>
          ${this.options.showAddNew ? `
            <button class="btn btn-sm" id="add-shortcut-btn">
              <span class="icon">+</span> Nouveau
            </button>
          ` : ''}
        </div>
        
        <div class="shortcut-selector__search">
          <input type="text" id="shortcut-search" placeholder="Rechercher un raccourci..." />
        </div>
        
        <div class="shortcut-selector__list" style="max-height: ${this.options.maxHeight}">
          <div id="shortcut-list"></div>
          <div id="shortcut-loading" class="shortcut-loading">
            <div class="spinner"></div>
          </div>
          <div id="shortcut-empty" class="shortcut-empty" style="display: none;">
            <p>Aucun raccourci trouvé</p>
          </div>
        </div>
        
        <div class="shortcut-selector__form" id="shortcut-form" style="display: none;">
          <h4>Nouveau Raccourci</h4>
          <div class="form-group">
            <label for="shortcut-id">Identifiant</label>
            <input type="text" id="shortcut-id" placeholder="ex: my-shortcut" />
          </div>
          <div class="form-group">
            <label for="shortcut-name">Nom</label>
            <input type="text" id="shortcut-name" placeholder="ex: Mon Raccourci" />
          </div>
          <div class="form-group">
            <label for="shortcut-description">Description</label>
            <input type="text" id="shortcut-description" placeholder="ex: Description du raccourci" />
          </div>
          <div class="form-group">
            <label for="shortcut-windows">Windows</label>
            <input type="text" id="shortcut-windows" placeholder="Commande Windows" />
          </div>
          <div class="form-group">
            <label for="shortcut-macos">macOS</label>
            <input type="text" id="shortcut-macos" placeholder="Commande macOS" />
          </div>
          <div class="form-group">
            <label for="shortcut-linux">Linux</label>
            <input type="text" id="shortcut-linux" placeholder="Commande Linux" />
          </div>
          <div class="form-actions">
            <button class="btn btn-sm" id="save-shortcut-btn">Enregistrer</button>
            <button class="btn btn-sm btn-secondary" id="cancel-shortcut-btn">Annuler</button>
          </div>
        </div>
      </div>
    `;
    
    // Injecter le CSS si nécessaire
    if (!document.getElementById('shortcut-selector-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'shortcut-selector-styles';
      styleEl.textContent = this.getStyles();
      document.head.appendChild(styleEl);
    }
  }
  
  /**
   * Styles CSS pour le composant
   */
  getStyles() {
    return `
      .shortcut-selector {
        background: var(--bg-card, #fff);
        border-radius: 8px;
        box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1));
        padding: 1rem;
        width: 100%;
      }
      
      .shortcut-selector__title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .shortcut-selector__title h3 {
        margin: 0;
        font-size: 1.125rem;
      }
      
      .shortcut-selector__search {
        margin-bottom: 1rem;
      }
      
      .shortcut-selector__search input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color, #eaeaea);
        border-radius: 4px;
        font-size: 0.875rem;
      }
      
      .shortcut-selector__list {
        overflow-y: auto;
        margin-bottom: 1rem;
      }
      
      .shortcut-item {
        padding: 0.75rem;
        border-radius: 8px;
        background: var(--bg-secondary, #f5f5f5);
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: 0.2s;
      }
      
      .shortcut-item:hover {
        background: var(--primary-light, #ebf5ff);
        transform: translateX(2px);
      }
      
      .shortcut-item.selected {
        border-left: 3px solid var(--primary, #3b82f6);
        background: var(--primary-light, #ebf5ff);
      }
      
      .shortcut-item h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.9375rem;
      }
      
      .shortcut-item p {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--text-secondary, #666);
      }
      
      .shortcut-item .platform-badge {
        display: inline-block;
        font-size: 0.6875rem;
        padding: 0.125rem 0.375rem;
        border-radius: 8px;
        margin-right: 0.25rem;
        margin-top: 0.5rem;
        background: var(--bg-tertiary, #eee);
      }
      
      .shortcut-item .platform-badge.supported {
        background: var(--success-light, #dcfce7);
        color: var(--success, #16a34a);
      }
      
      .shortcut-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
      }
      
      .shortcut-loading .spinner {
        width: 30px;
        height: 30px;
        border: 3px solid var(--border-color, #eaeaea);
        border-top-color: var(--primary, #3b82f6);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .shortcut-empty {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary, #666);
      }
      
      .shortcut-selector__form {
        background: var(--bg-secondary, #f5f5f5);
        border-radius: 8px;
        padding: 1rem;
        margin-top: 1rem;
      }
      
      .shortcut-selector__form h4 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1rem;
      }
      
      .form-group {
        margin-bottom: 0.75rem;
      }
      
      .form-group label {
        display: block;
        font-size: 0.8125rem;
        margin-bottom: 0.25rem;
        color: var(--text-secondary, #666);
      }
      
      .form-group input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color, #eaeaea);
        border-radius: 4px;
        font-size: 0.875rem;
      }
      
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 1rem;
      }
      
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1rem;
        background: var(--primary, #3b82f6);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: 0.2s;
      }
      
      .btn:hover {
        background: var(--primary-dark, #2563eb);
      }
      
      .btn-sm {
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
      }
      
      .btn-secondary {
        background: var(--bg-tertiary, #e5e7eb);
        color: var(--text-primary, #374151);
      }
      
      .btn-secondary:hover {
        background: var(--border-color, #d1d5db);
      }
      
      .btn .icon {
        margin-right: 0.5rem;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
  }
  
  /**
   * Liaison des événements
   */
  bindEvents() {
    // Recherche de raccourci
    const searchInput = document.getElementById('shortcut-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterShortcuts(searchInput.value));
    }
    
    // Bouton d'ajout de raccourci
    const addBtn = document.getElementById('add-shortcut-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.toggleForm(true));
    }
    
    // Bouton d'enregistrement de raccourci
    const saveBtn = document.getElementById('save-shortcut-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveShortcut());
    }
    
    // Bouton d'annulation
    const cancelBtn = document.getElementById('cancel-shortcut-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.toggleForm(false));
    }
  }
  
  /**
   * Chargement des raccourcis système
   */
  loadShortcuts() {
    const loadingEl = document.getElementById('shortcut-loading');
    const emptyEl = document.getElementById('shortcut-empty');
    const listEl = document.getElementById('shortcut-list');
    
    if (loadingEl) loadingEl.style.display = 'flex';
    if (emptyEl) emptyEl.style.display = 'none';
    if (listEl) listEl.innerHTML = '';
    
    this.socket.emit('plugin_action', {
      plugin: 'system-shortcuts',
      action: 'listShortcuts'
    }, (response) => {
      if (loadingEl) loadingEl.style.display = 'none';
      
      if (response.success) {
        this.shortcuts = response.data.shortcuts || [];
        this.currentPlatform = response.data.currentPlatform || '';
        
        if (this.shortcuts.length === 0) {
          if (emptyEl) emptyEl.style.display = 'block';
        } else {
          this.renderShortcuts();
        }
      } else {
        console.error('Failed to load shortcuts:', response.error);
        if (emptyEl) {
          emptyEl.style.display = 'block';
          emptyEl.innerHTML = `<p>Erreur: ${response.error}</p>`;
        }
      }
    });
  }
  
  /**
   * Rendu des raccourcis
   */
  renderShortcuts() {
    const list = document.getElementById('shortcut-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    this.shortcuts.forEach(shortcut => {
      const shortcutItem = document.createElement('div');
      shortcutItem.className = 'shortcut-item';
      shortcutItem.dataset.shortcutId = shortcut.id;
      
      // Vérifier si le raccourci est supporté sur la plateforme actuelle
      const isSupported = shortcut.supportedPlatforms[this.currentPlatform];
      
      shortcutItem.innerHTML = `
        <h4>${shortcut.name}</h4>
        ${shortcut.description ? `<p>${shortcut.description}</p>` : ''}
        <div>
          <span class="platform-badge ${shortcut.supportedPlatforms.windows ? 'supported' : ''}">Windows</span>
          <span class="platform-badge ${shortcut.supportedPlatforms.macos ? 'supported' : ''}">macOS</span>
          <span class="platform-badge ${shortcut.supportedPlatforms.linux ? 'supported' : ''}">Linux</span>
        </div>
      `;
      
      // Événement de sélection
      shortcutItem.addEventListener('click', () => this.selectShortcut(shortcut.id));
      
      list.appendChild(shortcutItem);
    });
  }
  
  /**
   * Sélection d'un raccourci
   */
  selectShortcut(shortcutId) {
    // Mettre à jour l'UI
    const shortcuts = document.querySelectorAll('.shortcut-item');
    shortcuts.forEach(item => {
      item.classList.toggle('selected', item.dataset.shortcutId === shortcutId);
    });
    
    const shortcut = this.shortcuts.find(s => s.id === shortcutId);
    if (shortcut) {
      this.options.onSelect(shortcut);
    }
  }
  
  /**
   * Filtrage des raccourcis par recherche
   */
  filterShortcuts(searchTerm) {
    if (!searchTerm) {
      // Si la recherche est vide, afficher tous les raccourcis
      document.querySelectorAll('.shortcut-item').forEach(item => {
        item.style.display = 'block';
      });
      
      document.getElementById('shortcut-empty').style.display = 'none';
      return;
    }
    
    searchTerm = searchTerm.toLowerCase();
    let visibleCount = 0;
    
    // Filtrer les raccourcis basés sur le terme de recherche
    this.shortcuts.forEach(shortcut => {
      const matches = 
        shortcut.name.toLowerCase().includes(searchTerm) || 
        (shortcut.description && shortcut.description.toLowerCase().includes(searchTerm));
      
      const element = document.querySelector(`.shortcut-item[data-shortcut-id="${shortcut.id}"]`);
      
      if (element) {
        element.style.display = matches ? 'block' : 'none';
        if (matches) visibleCount++;
      }
    });
    
    // Afficher un message si aucun raccourci ne correspond
    const emptyEl = document.getElementById('shortcut-empty');
    if (emptyEl) {
      emptyEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }
  
  /**
   * Basculer l'affichage du formulaire
   */
  toggleForm(show) {
    const formEl = document.getElementById('shortcut-form');
    if (formEl) {
      formEl.style.display = show ? 'block' : 'none';
      this.formExpanded = show;
      
      if (show) {
        // Vider le formulaire
        document.getElementById('shortcut-id').value = '';
        document.getElementById('shortcut-name').value = '';
        document.getElementById('shortcut-description').value = '';
        document.getElementById('shortcut-windows').value = '';
        document.getElementById('shortcut-macos').value = '';
        document.getElementById('shortcut-linux').value = '';
      }
    }
  }
  
  /**
   * Enregistrement d'un nouveau raccourci
   */
  saveShortcut() {
    const id = document.getElementById('shortcut-id').value.trim();
    const name = document.getElementById('shortcut-name').value.trim();
    const description = document.getElementById('shortcut-description').value.trim();
    const windows = document.getElementById('shortcut-windows').value.trim();
    const macos = document.getElementById('shortcut-macos').value.trim();
    const linux = document.getElementById('shortcut-linux').value.trim();
    
    // Validation de base
    if (!id || !name) {
      alert('L\'identifiant et le nom sont obligatoires');
      return;
    }
    
    if (!windows && !macos && !linux) {
      alert('Au moins une commande de plateforme est requise');
      return;
    }
    
    // Enregistrer le raccourci
    this.socket.emit('plugin_action', {
      plugin: 'system-shortcuts',
      action: 'registerShortcut',
      params: {
        id,
        name,
        description,
        windows,
        macos,
        linux
      }
    }, (response) => {
      if (response.success) {
        // Masquer le formulaire
        this.toggleForm(false);
        
        // Recharger les raccourcis
        this.loadShortcuts();
      } else {
        console.error('Failed to register shortcut:', response.error);
        alert(`Échec de l'enregistrement: ${response.error}`);
      }
    });
  }
}

export default ShortcutSelector;
