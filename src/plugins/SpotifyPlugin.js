const SpotifyWebApi = require('spotify-web-api-node');

class SpotifyPlugin {
    constructor() {
        this.spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT_URI
        });
        this.authenticated = false;
    }

    async initialize(server) {
        try {
            // This would typically involve setting up authentication
            // You might want to implement OAuth flow or use refresh tokens
            console.log('Spotify Plugin Initialized');
        } catch (error) {
            console.error('Spotify Plugin Initialization Error:', error);
        }
    }

    registerActions(actionRegistry) {
        actionRegistry.register('spotify.playPause', async () => {
            try {
                const playbackState = await this.spotifyApi.getMyCurrentPlaybackState();
                if (playbackState.body.is_playing) {
                    await this.spotifyApi.pause();
                } else {
                    await this.spotifyApi.play();
                }
            } catch (error) {
                console.error('Spotify Play/Pause Error:', error);
            }
        });

        actionRegistry.register('spotify.nextTrack', async () => {
            try {
                await this.spotifyApi.skipToNext();
            } catch (error) {
                console.error('Spotify Next Track Error:', error);
            }
        });

        actionRegistry.register('spotify.previousTrack', async () => {
            try {
                await this.spotifyApi.skipToPrevious();
            } catch (error) {
                console.error('Spotify Previous Track Error:', error);
            }
        });
    }
}

module.exports = SpotifyPlugin;