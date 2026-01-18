const config = require('../config/config');

/**
 * Service for making requests to RapidAPI marketplace APIs
 * This service provides a wrapper for calling external APIs through RapidAPI
 */
class RapidAPIService {
  constructor() {
    this.clientKey = config.rapidapi.clientKey;
    this.clientHost = config.rapidapi.clientHost;
  }

  /**
   * Check if RapidAPI client credentials are configured
   * @returns {boolean}
   */
  isConfigured() {
    // Check if credentials exist and are not null/undefined
    if (!this.clientKey || !this.clientHost) {
      return false;
    }
    
    // Ensure credentials are not placeholder values by checking if they start with "YOUR_"
    if (this.clientKey.startsWith('YOUR_') || this.clientHost.startsWith('YOUR_')) {
      return false;
    }
    
    return true;
  }

  /**
   * Make a request to a RapidAPI marketplace API
   * @param {string} url - Full API endpoint URL
   * @param {Object} options - Fetch options (method, headers, body, etc.)
   * @returns {Promise<Object>}
   */
  async makeRequest(url, options = {}) {
    if (!this.isConfigured()) {
      console.warn('RapidAPI client credentials not configured');
      return null;
    }

    // Prepare headers with RapidAPI authentication
    const headers = {
      'X-RapidAPI-Key': this.clientKey,
      'X-RapidAPI-Host': this.clientHost,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling RapidAPI:', error.message);
      throw error;
    }
  }

  /**
   * Make a GET request to RapidAPI
   * @param {string} url - API endpoint URL
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>}
   */
  async get(url, queryParams = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.makeRequest(fullUrl, {
      method: 'GET'
    });
  }

  /**
   * Make a POST request to RapidAPI
   * @param {string} url - API endpoint URL
   * @param {Object} body - Request body
   * @returns {Promise<Object>}
   */
  async post(url, body = {}) {
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * Make a PUT request to RapidAPI
   * @param {string} url - API endpoint URL
   * @param {Object} body - Request body
   * @returns {Promise<Object>}
   */
  async put(url, body = {}) {
    return this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * Make a DELETE request to RapidAPI
   * @param {string} url - API endpoint URL
   * @returns {Promise<Object>}
   */
  async delete(url) {
    return this.makeRequest(url, {
      method: 'DELETE'
    });
  }
}

module.exports = new RapidAPIService();
