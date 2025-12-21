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

    const params = { search_field: 'name', search_value: title };
    if (type) {
      params.types = type === 'movie' ? 'movie' : 'tv_series';
    }

    const data = await this.makeRequest('/search/', params);
    return data?.title_results || [];
  }

  /**
   * Get streaming sources for a specific title by TMDB ID
   * @param {number} tmdbId - TMDB ID
   * @param {string} type - 'movie' or 'tv'
   * @returns {Promise<Object|null>}
   */
  async getSourcesByTMDBId(tmdbId, type = 'movie') {
    if (!this.apiKey || this.apiKey === 'YOUR_WATCHMODE_API_KEY_HERE') {
      return null;
    }

    try {
      // First, find the Watchmode ID using TMDB ID
      // Use the correct search endpoint with tmdb_id as search field
      const searchParams = {
        search_field: 'tmdb_id',
        search_value: tmdbId
      };
      
      // Add type filter to improve search accuracy
      if (type) {
        searchParams.types = type === 'movie' ? 'movie' : 'tv_series';
      }
      
      const searchData = await this.makeRequest('/search/', searchParams);

      // Check if we got valid search results
      if (!searchData || !searchData.title_results || searchData.title_results.length === 0) {
        return null;
      }

      // Get the first result's Watchmode ID
      const watchmodeId = searchData.title_results[0].id;
      
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
   * @returns {Promise<Object>}
   */
  async getStreamingAvailability(tmdbId, type = 'movie', region = 'US') {
    if (!this.apiKey || this.apiKey === 'YOUR_WATCHMODE_API_KEY_HERE') {
      return {
        available: false,
        sources: { subscription: [], free: [], rent: [], buy: [] }
      };
    }

    try {
      const details = await this.getSourcesByTMDBId(tmdbId, type);
      
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
