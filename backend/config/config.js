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
  }
};
