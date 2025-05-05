const BasePlugin = require('./BasePlugin');

class SpotifyPlugin extends BasePlugin {
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
        super.registerActions(actionRegistry);
        
        if (!this.connected) return;

        actionRegistry.register('spotify.playPause', () => {
            console.log('Action Play/Pause Spotify');
            // Implémentation réelle à ajouter
        });
    }
}

module.exports = SpotifyPlugin;