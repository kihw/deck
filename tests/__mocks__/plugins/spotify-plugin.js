class SpotifyPlugin {
    constructor() {
        this.id = 'spotify';
        this.name = 'Spotify Plugin';
    }

    getActions() {
        return [
            {
                id: 'play-pause',
                name: 'Play/Pause',
                execute: async () => {
                    // Mock implementation
                    return { status: 'playing' };
                }
            },
            {
                id: 'next-track',
                name: 'Next Track',
                execute: async () => {
                    // Mock implementation
                    return { track: 'Next Song' };
                }
            }
        ];
    }
}

module.exports = SpotifyPlugin;