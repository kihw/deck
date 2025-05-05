import SpotifyWebApi from 'spotify-web-api-node';
import { Plugin, PluginAction } from './types';

class SpotifyControlPlugin implements Plugin {
  metadata = {
    id: 'spotify-control',
    name: 'Spotify Control',
    version: '1.1.0',
    description: 'Advanced Spotify playback and playlist management',
    author: 'Deck Team'
  };

  private spotifyApi: SpotifyWebApi;
  private accessToken: string | null = null;

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI
    });
  }

  actions: Record<string, PluginAction> = {
    authenticate: {
      id: 'spotify-auth',
      name: 'Authenticate Spotify',
      description: 'Authenticate with Spotify API',
      async execute(context: { code?: string }) {
        if (!context.code) {
          // Generate authorization URL
          const scopes = [
            'user-read-playback-state', 
            'user-modify-playback-state', 
            'user-read-currently-playing'
          ];
          return {
            authUrl: this.spotifyApi.createAuthorizeURL(scopes, 'some-state-of-my-app')
          };
        }

        try {
          const data = await this.spotifyApi.authorizationCodeGrant(context.code);
          
          this.accessToken = data.body['access_token'];
          const refreshToken = data.body['refresh_token'];

          this.spotifyApi.setAccessToken(this.accessToken);
          this.spotifyApi.setRefreshToken(refreshToken);

          return { 
            status: 'Authenticated', 
            expiresIn: data.body['expires_in'] 
          };
        } catch (error) {
          throw new Error(`Spotify authentication failed: ${error.message}`);
        }
      }
    },

    getCurrentTrack: {
      id: 'current-track',
      name: 'Get Current Track',
      description: 'Retrieve information about the currently playing track',
      async execute() {
        try {
          const response = await this.spotifyApi.getMyCurrentPlayingTrack();
          
          if (!response.body.item) {
            return { status: 'No track playing' };
          }

          const track = response.body.item;
          return {
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            imageUrl: track.album.images[0]?.url,
            isPlaying: response.body.is_playing
          };
        } catch (error) {
          throw new Error(`Failed to get current track: ${error.message}`);
        }
      }
    },

    controlPlayback: {
      id: 'playback-control',
      name: 'Playback Control',
      description: 'Control Spotify playback',
      async execute(context: { 
        action: 'play' | 'pause' | 'next' | 'previous' | 'shuffle'
      }) {
        try {
          switch (context.action) {
            case 'play':
              await this.spotifyApi.play();
              break;
            case 'pause':
              await this.spotifyApi.pause();
              break;
            case 'next':
              await this.spotifyApi.skipToNext();
              break;
            case 'previous':
              await this.spotifyApi.skipToPrevious();
              break;
            case 'shuffle':
              const currentState = await this.spotifyApi.getMyCurrentPlaybackState();
              await this.spotifyApi.setShuffle(!currentState.body.shuffle_state);
              break;
          }

          return { 
            status: 'Success', 
            action: context.action 
          };
        } catch (error) {
          throw new Error(`Playback control failed: ${error.message}`);
        }
      }
    },

    createPlaylist: {
      id: 'create-playlist',
      name: 'Create Playlist',
      description: 'Create a new Spotify playlist',
      async execute(context: { 
        name: string, 
        description?: string, 
        isPublic?: boolean 
      }) {
        try {
          const user = await this.spotifyApi.getMe();
          const playlist = await this.spotifyApi.createPlaylist(
            user.body.id, 
            context.name, 
            {
              description: context.description || '',
              public: context.isPublic || false
            }
          );

          return {
            id: playlist.body.id,
            name: playlist.body.name,
            url: playlist.body.external_urls.spotify
          };
        } catch (error) {
          throw new Error(`Playlist creation failed: ${error.message}`);
        }
      }
    }
  };

  helpers = {
    // Optional helper methods
    isAuthenticated: () => !!this.accessToken,
    
    getAuthorizationUrl: (scopes?: string[]) => {
      const defaultScopes = [
        'user-read-playback-state', 
        'user-modify-playback-state', 
        'user-read-currently-playing'
      ];
      
      return this.spotifyApi.createAuthorizeURL(
        scopes || defaultScopes, 
        'deck-spotify-plugin'
      );
    }
  };

  async initialize(config?: Record<string, any>): Promise<void> {
    // Optional auto-authentication if refresh token is stored
    if (config?.autoAuthenticate && config.refreshToken) {
      try {
        this.spotifyApi.setRefreshToken(config.refreshToken);
        const data = await this.spotifyApi.refreshAccessToken();
        this.accessToken = data.body['access_token'];
        this.spotifyApi.setAccessToken(this.accessToken);
      } catch (error) {
        console.error('Auto-authentication failed:', error);
      }
    }
  }

  async unload(): Promise<void> {
    // Cleanup: clear tokens and reset API
    this.accessToken = null;
    this.spotifyApi.resetAccessToken();
    this.spotifyApi.resetRefreshToken();
  }
}

export default new SpotifyControlPlugin();
