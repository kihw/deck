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
                    console.log('Spotify Play/Pause');
                }
            },
            {
                id: 'next-track',
                name: 'Next Track',
                execute: async () => {
                    console.log('Spotify Next Track');
                }
            }
        ];
    }
}

module.exports = SpotifyPlugin;