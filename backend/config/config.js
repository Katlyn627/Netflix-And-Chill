// Configuration file for API keys and settings
module.exports = {
  // TMDB API configuration (The Movie Database)
  // Get your free API key at: https://www.themoviedb.org/settings/api
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || (() => {
      if (process.env.NODE_ENV === 'production') {
        console.warn('WARNING: TMDB_API_KEY not set. Recommendation features will not work.');
      }
      return null;
    })(),
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p'
  },

  // Watchmode API configuration (Streaming availability)
  // Get your free API key at: https://api.watchmode.com/
  watchmode: {
    apiKey: process.env.WATCHMODE_API_KEY || null,
    baseUrl: 'https://api.watchmode.com/v1'
  },

  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // Database configuration
  database: {
    type: process.env.DB_TYPE || 'file', // 'file', 'mongodb', or 'postgresql'
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/netflix-and-chill'
    },
    postgresql: {
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT || 5432,
      database: process.env.PG_DATABASE || 'netflix_and_chill',
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || ''
    }
  },

  // File upload configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxPhotos: 6
  },

  // RapidAPI configuration
  // RapidAPI provides two-way integration:
  // 1. Server mode: Protect your API endpoints with RapidAPI key validation
  // 2. Client mode: Call external RapidAPI marketplace APIs
  rapidapi: {
    // Server mode - when your API is published on RapidAPI marketplace
    enabled: process.env.RAPIDAPI_ENABLED === 'true' || false,
    apiKeys: process.env.RAPIDAPI_API_KEYS 
      ? process.env.RAPIDAPI_API_KEYS.split(',').map(key => key.trim())
      : [],
    validateHost: process.env.RAPIDAPI_VALIDATE_HOST === 'true' || false,
    expectedHost: process.env.RAPIDAPI_EXPECTED_HOST || 'netflix-and-chill.p.rapidapi.com',
    
    // Client mode - when calling external RapidAPI services
    clientKey: process.env.RAPIDAPI_CLIENT_KEY || null,
    clientHost: process.env.RAPIDAPI_CLIENT_HOST || null
  },

  // Auth0 Configuration (User Authentication)
  // Get credentials at: https://auth0.com/
  // See AUTH0_SETUP_GUIDE.md for setup instructions
  auth0: {
    domain: process.env.AUTH0_DOMAIN || null,
    clientId: process.env.AUTH0_CLIENT_ID || null,
    clientSecret: process.env.AUTH0_CLIENT_SECRET || null,
    audience: process.env.AUTH0_AUDIENCE || null,
    callbackUrl: process.env.AUTH0_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/callback.html`,
    logoutUrl: process.env.AUTH0_LOGOUT_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/login.html`
  },

  // Streaming Platform OAuth Configuration
  // OAuth integration for Netflix, Hulu, Disney+, Prime Video, HBO Max, Apple TV+
  // Note: Most streaming platforms have restricted API access
  // Contact each platform's developer program for API access
  streamingOAuth: {
    providers: {
      netflix: {
        enabled: process.env.NETFLIX_OAUTH_ENABLED === 'true' || false,
        clientId: process.env.NETFLIX_CLIENT_ID || null,
        clientSecret: process.env.NETFLIX_CLIENT_SECRET || null,
        redirectUri: process.env.NETFLIX_REDIRECT_URI || `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/netflix/callback`,
        authUrl: 'https://www.netflix.com/oauth/authorize',
        tokenUrl: 'https://www.netflix.com/oauth/token',
        apiUrl: 'https://api.netflix.com/v1',
        revokeUrl: 'https://www.netflix.com/oauth/revoke',
        scope: 'viewing_history profile'
      },
      hulu: {
        enabled: process.env.HULU_OAUTH_ENABLED === 'true' || false,
        clientId: process.env.HULU_CLIENT_ID || null,
        clientSecret: process.env.HULU_CLIENT_SECRET || null,
        redirectUri: process.env.HULU_REDIRECT_URI || `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/hulu/callback`,
        authUrl: 'https://auth.hulu.com/oauth/authorize',
        tokenUrl: 'https://auth.hulu.com/oauth/token',
        apiUrl: 'https://api.hulu.com/v1',
        revokeUrl: 'https://auth.hulu.com/oauth/revoke',
        scope: 'history profile'
      },
      disney: {
        enabled: process.env.DISNEY_OAUTH_ENABLED === 'true' || false,
        clientId: process.env.DISNEY_CLIENT_ID || null,
        clientSecret: process.env.DISNEY_CLIENT_SECRET || null,
        redirectUri: process.env.DISNEY_REDIRECT_URI || `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/disney/callback`,
        authUrl: 'https://www.disneyplus.com/oauth/authorize',
        tokenUrl: 'https://www.disneyplus.com/oauth/token',
        apiUrl: 'https://api.disneyplus.com/v1',
        revokeUrl: 'https://www.disneyplus.com/oauth/revoke',
        scope: 'watchlist viewing_activity profile'
      },
      prime: {
        enabled: process.env.PRIME_OAUTH_ENABLED === 'true' || false,
        clientId: process.env.PRIME_CLIENT_ID || null,
        clientSecret: process.env.PRIME_CLIENT_SECRET || null,
        redirectUri: process.env.PRIME_REDIRECT_URI || `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/prime/callback`,
        authUrl: 'https://www.amazon.com/ap/oa',
        tokenUrl: 'https://api.amazon.com/auth/o2/token',
        apiUrl: 'https://api.primevideo.com/v1',
        revokeUrl: 'https://api.amazon.com/auth/o2/revoke',
        scope: 'profile primevideo:viewing_history'
      },
      hbo: {
        enabled: process.env.HBO_OAUTH_ENABLED === 'true' || false,
        clientId: process.env.HBO_CLIENT_ID || null,
        clientSecret: process.env.HBO_CLIENT_SECRET || null,
        redirectUri: process.env.HBO_REDIRECT_URI || `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/hbo/callback`,
        authUrl: 'https://auth.hbomax.com/oauth/authorize',
        tokenUrl: 'https://auth.hbomax.com/oauth/token',
        apiUrl: 'https://api.hbomax.com/v1',
        revokeUrl: 'https://auth.hbomax.com/oauth/revoke',
        scope: 'viewing_history profile'
      },
      appletv: {
        enabled: process.env.APPLETV_OAUTH_ENABLED === 'true' || false,
        clientId: process.env.APPLETV_CLIENT_ID || null,
        clientSecret: process.env.APPLETV_CLIENT_SECRET || null,
        redirectUri: process.env.APPLETV_REDIRECT_URI || `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/appletv/callback`,
        authUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token',
        apiUrl: 'https://api.tv.apple.com/v1',
        revokeUrl: 'https://appleid.apple.com/auth/revoke',
        scope: 'tv.history tv.profile'
      }
    }
  }
};
