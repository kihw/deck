/**
 * Composant de sélection d'icônes pour l'interface utilisateur de Deck
 * Permet de parcourir, rechercher et sélectionner des icônes pour les boutons
 */

class IconSelector {
  constructor(socket, containerId, options = {}) {
    this.socket = socket;
    this.container = document.getElementById(containerId);
    this.options = {
      onSelect: () => {},
      maxHeight: '300px',
      showUpload: true,
      showCategories: true,
      ...options
    };
    
    this.selectedCategory = 'all';
    this.icons = [];
    this.categories = [];
    
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
    this.loadCategories();
  }
  
  /**
   * Rendu du composant
   */
  render() {
    this.container.innerHTML = `
      <div class="icon-selector">
        ${this.options.showCategories ? `
          <div class="icon-selector__categories">
            <ul id="icon-category-list"></ul>
          </div>
        ` : ''}
        
        <div class="icon-selector__search">
          <input type="text" id="icon-search" placeholder="Rechercher une icône..." />
        </div>
        
        <div class="icon-selector__grid" style="max-height: ${this.options.maxHeight}">
          <div id="icon-grid" class="icon-grid"></div>
          <div id="icon-loading" class="icon-loading">
            <div class="spinner"></div>
          </div>
          <div id="icon-empty" class="icon-empty" style="display: none;">
            <p>Aucune icône trouvée</p>
          </div>
        </div>
        
        ${this.options.showUpload ? `
          <div class="icon-selector__upload">
            <label for="icon-upload" class="btn btn-sm">
              <span class="icon">+</span> Télécharger une icône
            </label>
            <input type="file" id="icon-upload" accept="image/*" style="display: none;" />
          </div>
        ` : ''}
      </div>
    `;
    
    // Injecter le CSS si nécessaire
    if (!document.getElementById('icon-selector-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'icon-selector-styles';
      styleEl.textContent = this.getStyles();
      document.head.appendChild(styleEl);
    }
  }
  
  /**
   * Styles CSS pour le composant
   */
  getStyles() {
    return `
      .icon-selector {
        background: var(--bg-card, #fff);
        border-radius: 8px;
        box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1));
        padding: 1rem;
        width: 100%;
      }
      
      .icon-selector__categories {
        margin-bottom: 1rem;
        border-bottom: 1px solid var(--border-color, #eaeaea);
        padding-bottom: 0.5rem;
      }
      
      .icon-selector__categories ul {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
        overflow-x: auto;
        gap: 0.5rem;
      }
      
      .icon-selector__categories li {
        padding: 0.25rem 0.75rem;
        font-size: 0.875rem;
        border-radius: 16px;
        cursor: pointer;
        white-space: nowrap;
      }
      
      .icon-selector__categories li:hover {
        background: var(--bg-secondary, #f5f5f5);
      }
      
      .icon-selector__categories li.active {
        background: var(--primary, #3b82f6);
        color: white;
      }
      
      .icon-selector__search {
        margin-bottom: 1rem;
      }
      
      .icon-selector__search input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color, #eaeaea);
        border-radius: 4px;
        font-size: 0.875rem;
      }
      
      .icon-selector__grid {
        overflow-y: auto;
        margin-bottom: 1rem;
      }
      
      .icon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        gap: 0.5rem;
      }
      
      .icon-item {
        aspect-ratio: 1;
        background: var(--bg-secondary, #f5f5f5);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 0.2s;
        padding: 0.5rem;
      }
      
      .icon-item:hover {
        background: var(--primary-light, #ebf5ff);
        transform: translateY(-2px);
      }
      
      .icon-item.selected {
        border: 2px solid var(--primary, #3b82f6);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }
      
      .icon-item img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      
      .icon-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
      }
      
      .icon-loading .spinner {
        width: 30px;
        height: 30px;
        border: 3px solid var(--border-color, #eaeaea);
        border-top-color: var(--primary, #3b82f6);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .icon-empty {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary, #666);
      }
      
      .icon-selector__upload {
        margin-top: 1rem;
        text-align: center;
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
    // Recherche d'icône
    const searchInput = document.getElementById('icon-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterIcons(searchInput.value));
    }
    
    // Téléchargement d'icône
    const uploadInput = document.getElementById('icon-upload');
    if (uploadInput) {
      uploadInput.addEventListener('change', (e) => this.handleIconUpload(e));
    }
  }
  
  /**
   * Chargement des catégories d'icônes
   */
  loadCategories() {
    this.socket.emit('plugin_action', {
      plugin: 'icon-manager',
      action: 'getCategories'
    }, (response) => {
      if (response.success) {
        this.categories = ['all', ...response.data.categories];
        this.renderCategories();
        this.loadIcons();
      } else {
        console.error('Failed to load categories:', response.error);
      }
    });
  }
  
  /**
   * Rendu des catégories d'icônes
   */
  renderCategories() {
    const categoryList = document.getElementById('icon-category-list');
    if (!categoryList) return;
    
    categoryList.innerHTML = '';
    
    this.categories.forEach(category => {
      const li = document.createElement('li');
      li.textContent = this.formatCategoryName(category);
      li.classList.toggle('active', category === this.selectedCategory);
      li.addEventListener('click', () => this.selectCategory(category));
      categoryList.appendChild(li);
    });
  }
  
  /**
   * Sélection d'une catégorie
   */
  selectCategory(category) {
    this.selectedCategory = category;
    
    // Mettre à jour l'UI
    const categories = document.querySelectorAll('#icon-category-list li');
    categories.forEach(item => {
      item.classList.toggle('active', item.textContent === this.formatCategoryName(category));
    });
    
    this.loadIcons();
  }
  
  /**
   * Chargement des icônes
   */
  loadIcons() {
    const loadingEl = document.getElementById('icon-loading');
    const emptyEl = document.getElementById('icon-empty');
    const gridEl = document.getElementById('icon-grid');
    
    if (loadingEl) loadingEl.style.display = 'flex';
    if (emptyEl) emptyEl.style.display = 'none';
    if (gridEl) gridEl.innerHTML = '';
    
    // Construire la requête en fonction de la catégorie sélectionnée
    const request = {
      plugin: 'icon-manager',
      action: 'listIcons'
    };
    
    if (this.selectedCategory !== 'all') {
      request.params = { category: this.selectedCategory };
    }
    
    this.socket.emit('plugin_action', request, (response) => {
      if (loadingEl) loadingEl.style.display = 'none';
      
      if (response.success) {
        this.icons = response.data.icons || [];
        
        if (this.icons.length === 0) {
          if (emptyEl) emptyEl.style.display = 'block';
        } else {
          this.renderIcons();
        }
      } else {
        console.error('Failed to load icons:', response.error);
        if (emptyEl) {
          emptyEl.style.display = 'block';
          emptyEl.innerHTML = `<p>Erreur: ${response.error}</p>`;
        }
      }
    });
  }
  
  /**
   * Rendu des icônes
   */
  renderIcons() {
    const grid = document.getElementById('icon-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    this.icons.forEach(icon => {
      const iconItem = document.createElement('div');
      iconItem.className = 'icon-item';
      iconItem.dataset.iconId = icon.id;
      
      // Charger l'aperçu de l'icône
      this.loadIconPreview(iconItem, icon.id);
      
      // Événement de sélection
      iconItem.addEventListener('click', () => this.selectIcon(icon.id));
      
      grid.appendChild(iconItem);
    });
  }
  
  /**
   * Chargement de l'aperçu d'une icône
   */
  loadIconPreview(element, iconId) {
    this.socket.emit('plugin_action', {
      plugin: 'icon-manager',
      action: 'getIcon',
      params: {
        iconId,
        includeData: true
      }
    }, (response) => {
      if (response.success) {
        const icon = response.data;
        
        const img = document.createElement('img');
        img.src = icon.base64;
        img.alt = icon.name;
        img.title = icon.name;
        
        element.appendChild(img);
      } else {
        console.error(`Failed to load icon preview for ${iconId}:`, response.error);
        element.innerHTML = '?';
        element.title = 'Failed to load icon';
      }
    });
  }
  
  /**
   * Sélection d'une icône
   */
  selectIcon(iconId) {
    // Mettre à jour l'UI
    const icons = document.querySelectorAll('.icon-item');
    icons.forEach(item => {
      item.classList.toggle('selected', item.dataset.iconId === iconId);
    });
    
    // Récupérer les détails de l'icône
    this.socket.emit('plugin_action', {
      plugin: 'icon-manager',
      action: 'getIcon',
      params: {
        iconId,
        includeData: true
      }
    }, (response) => {
      if (response.success) {
        const icon = response.data;
        this.options.onSelect(icon);
      } else {
        console.error(`Failed to get icon ${iconId}:`, response.error);
      }
    });
  }
  
  /**
   * Filtrage des icônes par recherche
   */
  filterIcons(searchTerm) {
    if (!searchTerm) {
      // Si la recherche est vide, afficher toutes les icônes
      document.querySelectorAll('.icon-item').forEach(item => {
        item.style.display = 'flex';
      });
      return;
    }
    
    searchTerm = searchTerm.toLowerCase();
    
    // Filtrer les icônes basées sur le terme de recherche
    this.icons.forEach(icon => {
      const matches = icon.name.toLowerCase().includes(searchTerm);
      const element = document.querySelector(`.icon-item[data-icon-id="${icon.id}"]`);
      
      if (element) {
        element.style.display = matches ? 'flex' : 'none';
      }
    });
    
    // Afficher un message si aucune icône ne correspond
    const grid = document.getElementById('icon-grid');
    const emptyEl = document.getElementById('icon-empty');
    
    if (grid && emptyEl) {
      const visibleIcons = grid.querySelectorAll('.icon-item[style="display: flex"]').length;
      emptyEl.style.display = visibleIcons === 0 ? 'block' : 'none';
    }
  }
  
  /**
   * Gestion du téléchargement d'icône
   */
  handleIconUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Vérifier que le fichier est une image
    if (!file.type.startsWith('image/')) {
      alert('Le fichier doit être une image');
      return;
    }
    
    // Convertir l'image en Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      
      // Extraire le nom du fichier sans extension
      const filename = file.name.split('.')[0];
      
      this.socket.emit('plugin_action', {
        plugin: 'icon-manager',
        action: 'uploadIcon',
        params: {
          name: filename,
          category: this.selectedCategory === 'all' ? 'custom' : this.selectedCategory,
          data: base64Data,
          mimeType: file.type
        }
      }, (response) => {
        if (response.success) {
          // Recharger les icônes après le téléchargement
          this.loadIcons();
        } else {
          console.error('Failed to upload icon:', response.error);
          alert(`Échec du téléchargement: ${response.error}`);
        }
      });
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      alert('Erreur lors de la lecture du fichier');
    };
    
    reader.readAsDataURL(file);
    
    // Réinitialiser l'input file
    event.target.value = '';
  }
  
  /**
   * Formatage du nom de catégorie pour l'affichage
   */
  formatCategoryName(category) {
    if (category === 'all') return 'Toutes';
    
    return category
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}

export default IconSelector;
