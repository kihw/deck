class DeckClient {
    constructor() {
        this.socket = io();
        this.buttonsGrid = document.getElementById('buttons-grid');
        this.initializeEvents();
    }

    initializeEvents() {
        this.socket.on('buttonConfigUpdated', (config) => {
            this.updateButtonGrid(config);
        });
    }

    createButton(config) {
        const button = document.createElement('div');
        button.classList.add('deck-button');
        button.dataset.action = config.action;
        button.textContent = config.label;
        
        button.addEventListener('click', () => {
            this.triggerButtonAction(config.action);
        });

        return button;
    }

    updateButtonGrid(configs) {
        this.buttonsGrid.innerHTML = '';
        configs.forEach(config => {
            const button = this.createButton(config);
            this.buttonsGrid.appendChild(button);
        });
    }

    triggerButtonAction(action) {
        this.socket.emit('buttonAction', { action });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DeckClient();
});