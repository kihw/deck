class SpotifyPlugin {
    constructor() {
        this.id = 'spotify';
        this.name = 'Spotify Plugin';
        this.client = null; // Spotify API client
    }

    initialize(config) {
        // Initialisation du client Spotify
        // Utiliser les configurations fournies
    }

    getActions() {
        return [
            {
                id: 'play-pause',
                name: 'Play/Pause',
                description: 'Toggle play/pause on Spotify',
                execute: async () => {
                    if (!this.client) {
                        throw new Error('Spotify client not initialized');
                    }
                    return this.client.playPause();
                }
            },
            {
                id: 'next-track',
                name: 'Next Track',
                description: 'Skip to next track',
                execute: async () => {
                    if (!this.client) {
                        throw new Error('Spotify client not initialized');
                    }
                    return this.client.nextTrack();
                }
            }
        ];
    }

    getTriggers() {
        return [
            {
                id: 'track-change',
                name: 'Track Changed',
                description: 'Triggered when a new track starts playing'
            }
        ];
    }
}

module.exports = SpotifyPlugin;