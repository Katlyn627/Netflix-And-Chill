const config = require('../config/config');
const { fallbackGenres, fallbackProviders, fallbackMovies, fallbackTVShows } = require('./fallbackData');

/**
 * Service for interacting with TMDB (The Movie Database) API
 * Provides movie and TV show data for recommendations
 */
class StreamingAPIService {
  constructor() {
    this.apiKey = config.tmdb.apiKey;
    this.baseUrl = config.tmdb.baseUrl;
    this.imageBaseUrl = config.tmdb.imageBaseUrl;
  }

  /**
   * Check if TMDB API key is configured
   * @private
   * @returns {boolean}
   */
  isApiKeyConfigured() {
    return this.apiKey && this.apiKey !== 'YOUR_TMDB_API_KEY_HERE';
  }

  /**
   * Filter fallback movies by search query
   * @private
   * @param {string} query - Search query
   * @returns {Array} Filtered movies
   */
  filterFallbackMoviesByQuery(query) {
    const queryLower = query.toLowerCase();
    const filtered = fallbackMovies.filter(movie => 
      movie.title && movie.title.toLowerCase().includes(queryLower)
    );
    return filtered.length > 0 ? filtered : fallbackMovies;
  }

  /**
   * Find a fallback movie by ID
   * @private
   * @param {number} id - Movie ID
   * @returns {Object|null} Movie object or null if not found
   */
  findFallbackMovieById(id) {
    return fallbackMovies.find(m => m.id === parseInt(id)) || null;
  }

  /**
   * Make a request to TMDB API
   * @param {string} endpoint 
   * @param {Object} params 
   * @returns {Promise<Object>}
   */
  async makeRequest(endpoint, params = {}) {
    // Check if API key is not configured or is a placeholder
    if (!this.apiKey || this.apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      console.warn('TMDB API key not configured. Returning empty results.');
      return { results: [] };
    }

    const queryParams = new URLSearchParams({
      api_key: this.apiKey,
      ...params
    });

    const url = `${this.baseUrl}${endpoint}?${queryParams}`;

    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling TMDB API:', error);
      throw error;
    }
  }

  /**
   * Search for movies and TV shows
   * @param {string} query 
   * @param {string} type - 'movie', 'tv', or 'multi'
   * @returns {Promise<Array>}
   */
  async search(query, type = 'multi') {
    // If no API key or placeholder, return filtered fallback movies based on search query
    if (!this.isApiKeyConfigured()) {
      return this.filterFallbackMoviesByQuery(query);
    }
    
    try {
      const endpoint = `/search/${type}`;
      const data = await this.makeRequest(endpoint, { query });
      const results = data.results || [];
      
      // If no results from API, try fallback search
      if (results.length === 0) {
        return this.filterFallbackMoviesByQuery(query);
      }
      
      return results;
    } catch (error) {
      console.error('Error searching content:', error.message);
      // Fallback to filtered search on error
      return this.filterFallbackMoviesByQuery(query);
    }
  }

  /**
   * Get trending movies and TV shows
   * @param {string} mediaType - 'movie', 'tv', or 'all'
   * @param {string} timeWindow - 'day' or 'week'
   * @returns {Promise<Array>}
   */
  async getTrending(mediaType = 'all', timeWindow = 'week') {
    // If no API key or placeholder, return fallback data based on media type
    if (!this.isApiKeyConfigured()) {
      if (mediaType === 'tv') {
        return fallbackTVShows;
      } else if (mediaType === 'all') {
        // For 'all', mix movies and TV shows
        return [...fallbackMovies, ...fallbackTVShows];
      }
      return fallbackMovies;
    }
    
    try {
      const endpoint = `/trending/${mediaType}/${timeWindow}`;
      const data = await this.makeRequest(endpoint);
      const results = data.results || [];
      
      if (results.length > 0) {
        return results;
      }
      
      // Return appropriate fallback based on media type
      if (mediaType === 'tv') {
        return fallbackTVShows;
      } else if (mediaType === 'all') {
        return [...fallbackMovies, ...fallbackTVShows];
      }
      return fallbackMovies;
    } catch (error) {
      console.error('Error fetching trending content:', error.message);
      
      // Return appropriate fallback based on media type on error
      if (mediaType === 'tv') {
        return fallbackTVShows;
      } else if (mediaType === 'all') {
        return [...fallbackMovies, ...fallbackTVShows];
      }
      return fallbackMovies;
    }
  }

  /**
   * Get popular movies
   * @returns {Promise<Array>}
   */
  async getPopularMovies() {
    // If no API key or placeholder, return fallback movies
    if (!this.apiKey || this.apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      return fallbackMovies;
    }
    
    try {
      const data = await this.makeRequest('/movie/popular');
      const results = data.results || [];
      return results.length > 0 ? results : fallbackMovies;
    } catch (error) {
      console.error('Error fetching popular movies:', error.message);
      return fallbackMovies;
    }
  }

  /**
   * Get popular TV shows
   * @returns {Promise<Array>}
   */
  async getPopularTVShows() {
    // If no API key or placeholder, return fallback TV shows
    if (!this.apiKey || this.apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      return fallbackTVShows;
    }
    
    try {
      const data = await this.makeRequest('/tv/popular');
      const results = data.results || [];
      
      if (results.length > 0) {
        return results;
      }
      
      // Return fallback TV shows if no results
      return fallbackTVShows;
    } catch (error) {
      console.error('Error fetching popular TV shows:', error.message);
      return fallbackTVShows;
    }
  }

  /**
   * Get movie or TV show details
   * @param {number} id 
   * @param {string} type - 'movie' or 'tv'
   * @returns {Promise<Object>}
   */
  async getDetails(id, type = 'movie') {
    // If no API key or placeholder, try to find in fallback data
    if (!this.isApiKeyConfigured()) {
      return this.findFallbackMovieById(id) || {};
    }
    
    try {
      const endpoint = `/${type}/${id}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching content details:', error.message);
      // Try to find in fallback data
      return this.findFallbackMovieById(id) || {};
    }
  }

  /**
   * Get recommendations based on a movie or TV show
   * @param {number} id 
   * @param {string} type - 'movie' or 'tv'
   * @returns {Promise<Array>}
   */
  async getRecommendations(id, type = 'movie') {
    // If no API key or placeholder, return fallback movies
    if (!this.isApiKeyConfigured()) {
      return fallbackMovies;
    }
    
    try {
      const endpoint = `/${type}/${id}/recommendations`;
      const data = await this.makeRequest(endpoint);
      const results = data.results || [];
      return results.length > 0 ? results : fallbackMovies;
    } catch (error) {
      console.error('Error fetching recommendations:', error.message);
      return fallbackMovies;
    }
  }

  /**
   * Filter fallback movies by genre IDs
   * @private
   * @param {Array<number>} genreIds - Array of TMDB genre IDs
   * @returns {Array} Filtered movies (returns all fallback movies if no matches found)
   */
  _filterFallbackByGenres(genreIds) {
    const { fallbackMovies } = require('./fallbackData');
    
    // Handle invalid input - return all fallback movies
    if (!genreIds || !Array.isArray(genreIds) || genreIds.length === 0) {
      return fallbackMovies;
    }
    
    const filtered = fallbackMovies.filter(movie => 
      movie.genre_ids && movie.genre_ids.some(gid => genreIds.includes(gid))
    );
    // If no movies match the genres, return all fallback movies instead of empty array
    return filtered.length > 0 ? filtered : fallbackMovies;
  }

  /**
   * Discover movies or TV shows with filters
   * @param {string} type - 'movie' or 'tv'
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async discover(type = 'movie', filters = {}) {
    // If no API key or placeholder, return filtered fallback data
    if (!this.apiKey || this.apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      if (type === 'movie' && filters.with_genres) {
        const genreIds = filters.with_genres.split(',').map(id => parseInt(id));
        return this._filterFallbackByGenres(genreIds);
      }
      
      // Return appropriate fallback based on type
      return type === 'tv' ? fallbackTVShows : fallbackMovies;
    }
    
    try {
      const endpoint = `/discover/${type}`;
      const data = await this.makeRequest(endpoint, filters);
      const results = data.results || [];
      
      // If no results and we have genre filters, return filtered fallback
      if (results.length === 0 && filters.with_genres) {
        const genreIds = filters.with_genres.split(',').map(id => parseInt(id));
        return this._filterFallbackByGenres(genreIds);
      }
      
      // Return appropriate fallback based on type if no results
      if (results.length === 0) {
        return type === 'tv' ? fallbackTVShows : fallbackMovies;
      }
      
      return results;
    } catch (error) {
      console.error('Error in discover method:', error.message);
      // Return filtered fallback on error
      if (type === 'movie' && filters.with_genres) {
        const genreIds = filters.with_genres.split(',').map(id => parseInt(id));
        return this._filterFallbackByGenres(genreIds);
      }
      
      // Return appropriate fallback based on type on error
      return type === 'tv' ? fallbackTVShows : fallbackMovies;
    }
  }

  /**
   * Get genre list
   * @param {string} type - 'movie' or 'tv'
   * @returns {Promise<Array>}
   */
  async getGenres(type = 'movie') {
    // If no API key or placeholder, return fallback genres
    if (!this.apiKey || this.apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      return fallbackGenres;
    }
    
    try {
      const endpoint = `/genre/${type}/list`;
      const data = await this.makeRequest(endpoint);
      const results = data.genres || [];
      return results.length > 0 ? results : fallbackGenres;
    } catch (error) {
      console.error('Error fetching genres:', error.message);
      return fallbackGenres;
    }
  }

  /**
   * Get all genres (combined movie and TV genres)
   * @returns {Promise<Array>}
   */
  async getAllGenres() {
    // If no API key or placeholder, return fallback data
    if (!this.apiKey || this.apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      return fallbackGenres;
    }

    try {
      const [movieGenres, tvGenres] = await Promise.all([
        this.getGenres('movie'),
        this.getGenres('tv')
      ]);

      // If both are empty, use fallback
      if (movieGenres.length === 0 && tvGenres.length === 0) {
        return fallbackGenres;
      }

      // Merge and deduplicate genres by ID
      const genreMap = new Map();
      
      movieGenres.forEach(genre => {
        genreMap.set(genre.id, { ...genre, types: ['movie'] });
      });
      
      tvGenres.forEach(genre => {
        if (genreMap.has(genre.id)) {
          genreMap.get(genre.id).types.push('tv');
        } else {
          genreMap.set(genre.id, { ...genre, types: ['tv'] });
        }
      });

      return Array.from(genreMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching all genres:', error);
      return fallbackGenres;
    }
  }

  /**
   * Get available streaming providers/watch providers
   * Limited to top streaming services (20 services): AMC+, Amazon Prime, Apple TV, BritBox, 
   * Crunchyroll, Discovery+, Disney+, fuboTV, HBO Max, Hulu, MGM+, Netflix, Paramount+, 
   * Peacock, Pluto TV, Roku, Showtime, Sling TV, Starz, YouTube Premium
   * @param {string} region - ISO 3166-1 country code (e.g., 'US')
   * @returns {Promise<Array>}
   */
  async getStreamingProviders(region = 'US') {
    // Allowed provider IDs for the top 20 streaming services
    const allowedProviderIds = [528, 9, 350, 380, 283, 510, 337, 257, 384, 15, 1796, 8, 531, 387, 300, 1853, 37, 1747, 1825, 188];
    
    // If no API key or placeholder, return fallback data (sorted alphabetically)
    if (!this.apiKey || this.apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      return fallbackProviders.sort((a, b) => a.name.localeCompare(b.name));
    }

    try {
      const endpoint = '/watch/providers/movie';
      const data = await this.makeRequest(endpoint, { watch_region: region });
      const results = data.results || [];
      
      // If no results, use fallback
      if (results.length === 0) {
        return fallbackProviders.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      // Filter to only allowed providers, format with logo URLs
      const formattedProviders = results
        .filter(provider => allowedProviderIds.includes(provider.provider_id))
        .map((provider, index) => ({
          id: provider.provider_id,
          name: provider.provider_name,
          logoPath: provider.logo_path,
          logoUrl: provider.logo_path ? this.getLogoUrl(provider.logo_path) : null,
          displayPriority: provider.display_priority || index + 1
        }));
      
      // If filtered results are empty, use fallback
      if (formattedProviders.length === 0) {
        return fallbackProviders.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      // Sort alphabetically by name
      return formattedProviders.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching streaming providers:', error);
      return fallbackProviders.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  /**
   * Get watch providers for a specific movie or TV show
   * @param {number} id 
   * @param {string} type - 'movie' or 'tv'
   * @returns {Promise<Object>}
   */
  async getWatchProviders(id, type = 'movie') {
    // If no API key or placeholder, return empty object
    if (!this.apiKey || this.apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      return {};
    }
    
    try {
      const endpoint = `/${type}/${id}/watch/providers`;
      const data = await this.makeRequest(endpoint);
      return data.results || {};
    } catch (error) {
      console.error('Error fetching watch providers:', error.message);
      return {};
    }
  }

  /**
   * Get image URL for a poster or backdrop
   * @param {string} path 
   * @param {string} size - 'w300', 'w500', 'original', etc.
   * @returns {string}
   */
  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  /**
   * Get logo URL for a streaming provider
   * @param {string} logoPath 
   * @returns {string}
   */
  getLogoUrl(logoPath) {
    if (!logoPath) return null;
    return `${this.imageBaseUrl}/original${logoPath}`;
  }
}

module.exports = new StreamingAPIService();
