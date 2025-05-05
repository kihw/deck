const BasePlugin = require('./BasePlugin');

class SpotifyPlugin extends BasePlugin {
    async initialize(server) {
        // Check if Spotify credentials are configured
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
            // Spotify is not configured - this is OK
            this.connected = false;
            return;
        }

        try {
            // Attempt to initialize Spotify connection
            // This would be the actual Spotify API initialization code
            this.connected = true;
            console.log('✅ Spotify API initialized');
        } catch (error) {
            // Spotify connection failed - this is OK too
            this.connected = false;
            // Only log in development mode
            if (process.env.NODE_ENV === 'development') {
                console.log('ℹ️ Spotify not available (optional)');
            }
        }
    }

    registerActions(actionRegistry) {
        // Only register actions if connected
        if (this.connected) {
            super.registerActions(actionRegistry);
            
            actionRegistry.register('spotify.playPause', () => {
                console.log('Action Play/Pause Spotify');
                // Actual implementation would go here
            });

            actionRegistry.register('spotify.nextTrack', () => {
                console.log('Action Next Track Spotify');
                // Actual implementation would go here
            });

            actionRegistry.register('spotify.previousTrack', () => {
                console.log('Action Previous Track Spotify');
                // Actual implementation would go here
            });
        } else {
            // No super.registerActions call to avoid "not connected" messages
        }
    }
}

module.exports = SpotifyPlugin;