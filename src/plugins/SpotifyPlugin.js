class SpotifyPlugin {
    constructor() {
        this.connected = false;
    }

    async initialize(server) {
        try {
            // Logique d'initialisation Spotify
            this.connected = true;
            console.log('Plugin Spotify initialisé');
        } catch (error) {
            console.error('Erreur d\'initialisation Spotify:', error);
            this.connected = false;
        }
    }

    registerActions(actionRegistry) {
        if (!this.connected) {
            console.warn('Plugin Spotify non connecté. Impossible d\'enregistrer les actions.');
            return;
        }

        actionRegistry.register('spotify.playPause', () => {
            console.log('Action Play/Pause Spotify');
            // Implémentation réelle à ajouter
        });
    }
}

module.exports = SpotifyPlugin;