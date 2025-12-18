const config = require('../config/config');

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
   * Make a request to TMDB API
   * @param {string} endpoint 
   * @param {Object} params 
   * @returns {Promise<Object>}
   */
  async makeRequest(endpoint, params = {}) {
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
    const endpoint = `/search/${type}`;
    const data = await this.makeRequest(endpoint, { query });
    return data.results || [];
  }

  /**
   * Get trending movies and TV shows
   * @param {string} mediaType - 'movie', 'tv', or 'all'
   * @param {string} timeWindow - 'day' or 'week'
   * @returns {Promise<Array>}
   */
  async getTrending(mediaType = 'all', timeWindow = 'week') {
    const endpoint = `/trending/${mediaType}/${timeWindow}`;
    const data = await this.makeRequest(endpoint);
    return data.results || [];
  }

  /**
   * Get popular movies
   * @returns {Promise<Array>}
   */
  async getPopularMovies() {
    const data = await this.makeRequest('/movie/popular');
    return data.results || [];
  }

  /**
   * Get popular TV shows
   * @returns {Promise<Array>}
   */
  async getPopularTVShows() {
    const data = await this.makeRequest('/tv/popular');
    return data.results || [];
  }

  /**
   * Get movie or TV show details
   * @param {number} id 
   * @param {string} type - 'movie' or 'tv'
   * @returns {Promise<Object>}
   */
  async getDetails(id, type = 'movie') {
    const endpoint = `/${type}/${id}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Get recommendations based on a movie or TV show
   * @param {number} id 
   * @param {string} type - 'movie' or 'tv'
   * @returns {Promise<Array>}
   */
  async getRecommendations(id, type = 'movie') {
    const endpoint = `/${type}/${id}/recommendations`;
    const data = await this.makeRequest(endpoint);
    return data.results || [];
  }

  /**
   * Discover movies or TV shows with filters
   * @param {string} type - 'movie' or 'tv'
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async discover(type = 'movie', filters = {}) {
    const endpoint = `/discover/${type}`;
    const data = await this.makeRequest(endpoint, filters);
    return data.results || [];
  }

  /**
   * Get genre list
   * @param {string} type - 'movie' or 'tv'
   * @returns {Promise<Array>}
   */
  async getGenres(type = 'movie') {
    const endpoint = `/genre/${type}/list`;
    const data = await this.makeRequest(endpoint);
    return data.genres || [];
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
}

module.exports = new StreamingAPIService();
