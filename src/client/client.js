class DeckClient {
    constructor() {
        this.socket = io();
        this.buttonsGrid = document.getElementById('buttons-grid');
        this.buttons = [];

        this.initSocketEvents();
        this.createDefaultButtons();
    }

    initSocketEvents() {
        this.socket.on('buttonCreated', (buttonConfig) => {
            this.addButton(buttonConfig);
        });
    }

    createDefaultButtons() {
        const defaultButtons = [
            { id: 'open-browser', label: 'Browser', action: 'openBrowser' },
            { id: 'volume-up', label: '🔊', action: 'volumeUp' },
            { id: 'volume-down', label: '🔉', action: 'volumeDown' },
            { id: 'screenshot', label: '📸', action: 'takeScreenshot' }
        ];

        defaultButtons.forEach(btn => this.addButton(btn));
    }

    addButton(config) {
        const button = document.createElement('button');
        button.classList.add('deck-button');
        button.id = config.id;
        button.textContent = config.label;
        
        button.addEventListener('click', () => {
            this.socket.emit('buttonPressed', config);
        });

        this.buttonsGrid.appendChild(button);
        this.buttons.push(button);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const deckClient = new DeckClient();
});