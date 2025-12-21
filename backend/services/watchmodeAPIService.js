const config = require('../config/config');

// Import node-fetch once at module level for better performance
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

/**
 * Service for interacting with Watchmode API
 * Provides streaming platform availability data for movies and TV shows
 */
class WatchmodeAPIService {
  constructor() {
    this.apiKey = config.watchmode.apiKey;
    this.baseUrl = config.watchmode.baseUrl;
  }

  /**
   * Make a request to Watchmode API
   * @param {string} endpoint 
   * @param {Object} params 
   * @returns {Promise<Object>}
   */
  async makeRequest(endpoint, params = {}) {
    // Check if API key is not configured or is a placeholder
    if (!this.apiKey || this.apiKey === 'YOUR_WATCHMODE_API_KEY_HERE') {
      console.warn('Watchmode API key not configured. Streaming availability data will not be available.');
      return null;
    }

    const queryParams = new URLSearchParams({
      apiKey: this.apiKey,
      ...params
    });

    const url = `${this.baseUrl}${endpoint}?${queryParams}`;

    try {
      // Wait for fetch to be loaded if not yet available
      if (!fetch) {
        fetch = (await import('node-fetch')).default;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // Don't throw error, just log warning for optional feature
        console.warn(`Watchmode API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.warn('Error calling Watchmode API:', error.message);
      return null;
    }
  }

  /**
   * Search for a title by name on Watchmode
   * @param {string} title - Movie or TV show title
   * @param {string} type - 'movie' or 'tv'
   * @returns {Promise<Array>}
   */
  async searchTitle(title, type = null) {
    if (!this.apiKey || this.apiKey === 'YOUR_WATCHMODE_API_KEY_HERE') {
      return [];
    }

    const params = { search_value: title };
    if (type) {
      params.types = type === 'movie' ? 'movie' : 'tv_series';
    }

    const data = await this.makeRequest('/autocomplete-search/', params);
    return data?.results || [];
  }

  /**
   * Get streaming sources for a specific title by TMDB ID
   * @param {number} tmdbId - TMDB ID
   * @param {string} type - 'movie' or 'tv'
   * @param {string} title - Optional title to help with matching (recommended)
   * @param {number} year - Optional year to help with matching
   * @returns {Promise<Object|null>}
   */
  async getSourcesByTMDBId(tmdbId, type = 'movie', title = null, year = null) {
    if (!this.apiKey || this.apiKey === 'YOUR_WATCHMODE_API_KEY_HERE') {
      return null;
    }

    try {
      // If title is not provided, we need to fetch it from TMDB
      if (!title) {
        if (!config.tmdb.apiKey) {
          console.warn('Cannot search Watchmode without TMDB API key to fetch title');
          return null;
        }
        
        // Wait for fetch to be loaded if not yet available
        if (!fetch) {
          fetch = (await import('node-fetch')).default;
        }
        
        // Fetch title details from TMDB
        const tmdbUrl = `${config.tmdb.baseUrl}/${type}/${tmdbId}?api_key=${config.tmdb.apiKey}`;
        const tmdbResponse = await fetch(tmdbUrl);
        
        if (!tmdbResponse.ok) {
          console.warn(`Failed to fetch TMDB details for ${type} ${tmdbId}`);
          return null;
        }
        
        const tmdbData = await tmdbResponse.json();
        title = tmdbData.title || tmdbData.name;
        
        // Extract year from release date or first air date
        if (tmdbData.release_date) {
          year = parseInt(tmdbData.release_date.split('-')[0]);
        } else if (tmdbData.first_air_date) {
          year = parseInt(tmdbData.first_air_date.split('-')[0]);
        }
      }
      
      if (!title) {
        console.warn('Cannot search Watchmode without a title');
        return null;
      }
      
      // Search Watchmode by title using autocomplete-search endpoint
      const searchResults = await this.searchTitle(title, type);
      
      // Check if we got valid search results
      if (!searchResults || searchResults.length === 0) {
        return null;
      }
      
      // Find the best match - prefer exact title match and matching year
      let bestMatch = searchResults[0]; // Default to first result
      
      if (year) {
        // Try to find a match with the correct year
        const yearMatch = searchResults.find(result => result.year === year);
        if (yearMatch) {
          bestMatch = yearMatch;
        }
      }
      
      // Get the Watchmode ID
      const watchmodeId = bestMatch.id;
      
      if (!watchmodeId) {
        return null;
      }

      // Get full details including sources
      const details = await this.getTitleDetails(watchmodeId);
      return details;
    } catch (error) {
      console.warn('Error getting sources by TMDB ID:', error.message);
      return null;
    }
  }

  /**
   * Get detailed information about a title including streaming sources
   * @param {number} watchmodeId - Watchmode ID
   * @returns {Promise<Object|null>}
   */
  async getTitleDetails(watchmodeId) {
    if (!this.apiKey || this.apiKey === 'YOUR_WATCHMODE_API_KEY_HERE') {
      return null;
    }

    const data = await this.makeRequest(`/title/${watchmodeId}/details/`);
    return data;
  }

  /**
   * Get streaming sources for a title
   * @param {number} watchmodeId - Watchmode ID
   * @param {string} region - Region code (e.g., 'US')
   * @returns {Promise<Array>}
   */
  async getSources(watchmodeId, region = 'US') {
    if (!this.apiKey || this.apiKey === 'YOUR_WATCHMODE_API_KEY_HERE') {
      return [];
    }

    const data = await this.makeRequest(`/title/${watchmodeId}/sources/`, {
      regions: region
    });

    return data || [];
  }

  /**
   * Get list of available streaming services
   * @param {string} region - Region code (e.g., 'US')
   * @returns {Promise<Array>}
   */
  async getStreamingServices(region = 'US') {
    if (!this.apiKey || this.apiKey === 'YOUR_WATCHMODE_API_KEY_HERE') {
      return [];
    }

    const data = await this.makeRequest('/sources/', {
      regions: region
    });

    return data || [];
  }

  /**
   * Format streaming sources into a simple structure
   * @param {Object} titleDetails - Title details from Watchmode
   * @returns {Object}
   */
  formatStreamingSources(titleDetails) {
    if (!titleDetails || !titleDetails.sources) {
      return {
        subscription: [],
        free: [],
        rent: [],
        buy: []
      };
    }

    const formatted = {
      subscription: [],
      free: [],
      rent: [],
      buy: []
    };

    titleDetails.sources.forEach(source => {
      const serviceInfo = {
        id: source.source_id,
        name: source.name,
        type: source.type,
        region: source.region,
        webUrl: source.web_url,
        format: source.format,
        price: source.price
      };

      // Categorize by type
      if (source.type === 'sub') {
        formatted.subscription.push(serviceInfo);
      } else if (source.type === 'free') {
        formatted.free.push(serviceInfo);
      } else if (source.type === 'rent') {
        formatted.rent.push(serviceInfo);
      } else if (source.type === 'buy') {
        formatted.buy.push(serviceInfo);
      }
    });

    return formatted;
  }

  /**
   * Get streaming availability for a movie/show by TMDB ID
   * This is the main method to use for integration
   * @param {number} tmdbId - TMDB ID
   * @param {string} type - 'movie' or 'tv'
   * @param {string} region - Region code (e.g., 'US')
   * @param {string} title - Optional title to help with matching
   * @param {number} year - Optional year to help with matching
   * @returns {Promise<Object>}
   */
  async getStreamingAvailability(tmdbId, type = 'movie', region = 'US', title = null, year = null) {
    if (!this.apiKey || this.apiKey === 'YOUR_WATCHMODE_API_KEY_HERE') {
      return {
        available: false,
        sources: { subscription: [], free: [], rent: [], buy: [] }
      };
    }

    try {
      const details = await this.getSourcesByTMDBId(tmdbId, type, title, year);
      
      if (!details) {
        return {
          available: false,
          sources: { subscription: [], free: [], rent: [], buy: [] }
        };
      }

      const sources = this.formatStreamingSources(details);
      
      return {
        available: Object.values(sources).some(arr => arr.length > 0),
        sources,
        watchmodeId: details.id,
        title: details.title,
        year: details.year
      };
    } catch (error) {
      console.warn('Error getting streaming availability:', error.message);
      return {
        available: false,
        sources: { subscription: [], free: [], rent: [], buy: [] }
      };
    }
  }
}

module.exports = new WatchmodeAPIService();
