const config = require('../config/config');

/**
 * Service for managing OAuth authentication with streaming platforms
 * Supports Netflix, Hulu, Disney+, Amazon Prime Video, HBO Max, Apple TV+
 * 
 * Note: Most streaming platforms have restricted API access.
 * This service provides the OAuth flow structure, but actual implementation
 * depends on getting approved for each platform's developer program.
 */
class StreamingOAuthService {
  constructor() {
    this.providers = config.streamingOAuth.providers;
  }

  /**
   * Get OAuth authorization URL for a streaming platform
   * @param {string} provider - Provider name (netflix, hulu, disney, prime, hbo, appletv)
   * @param {string} state - CSRF state token
   * @returns {string|null} Authorization URL
   */
  getAuthorizationUrl(provider, state) {
    const providerConfig = this.providers[provider];
    
    if (!providerConfig || !providerConfig.enabled) {
      console.warn(`OAuth not configured for provider: ${provider}`);
      return null;
    }

    const params = new URLSearchParams({
      client_id: providerConfig.clientId,
      redirect_uri: providerConfig.redirectUri,
      response_type: 'code',
      state: state,
      scope: providerConfig.scope
    });

    return `${providerConfig.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} provider - Provider name
   * @param {string} code - Authorization code
   * @returns {Promise<Object>} Token response
   */
  async exchangeCodeForToken(provider, code) {
    const providerConfig = this.providers[provider];
    
    if (!providerConfig || !providerConfig.enabled) {
      throw new Error(`OAuth not configured for provider: ${provider}`);
    }

    const fetch = (await import('node-fetch')).default;
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: providerConfig.redirectUri,
      client_id: providerConfig.clientId,
      client_secret: providerConfig.clientSecret
    });

    try {
      const response = await fetch(providerConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error exchanging code for token (${provider}):`, error.message);
      throw error;
    }
  }

  /**
   * Refresh an access token
   * @param {string} provider - Provider name
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token response
   */
  async refreshAccessToken(provider, refreshToken) {
    const providerConfig = this.providers[provider];
    
    if (!providerConfig || !providerConfig.enabled) {
      throw new Error(`OAuth not configured for provider: ${provider}`);
    }

    const fetch = (await import('node-fetch')).default;
    
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: providerConfig.clientId,
      client_secret: providerConfig.clientSecret
    });

    try {
      const response = await fetch(providerConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error refreshing token (${provider}):`, error.message);
      throw error;
    }
  }

  /**
   * Get user's watch history from streaming platform
   * @param {string} provider - Provider name
   * @param {string} accessToken - Access token
   * @returns {Promise<Array>} Watch history
   */
  async getWatchHistory(provider, accessToken) {
    const providerConfig = this.providers[provider];
    
    if (!providerConfig || !providerConfig.enabled || !providerConfig.apiUrl) {
      console.warn(`API not available for provider: ${provider}`);
      return [];
    }

    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch(`${providerConfig.apiUrl}/watch-history`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get watch history: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeWatchHistory(provider, data);
    } catch (error) {
      console.error(`Error getting watch history (${provider}):`, error.message);
      return [];
    }
  }

  /**
   * Get user's profile from streaming platform
   * @param {string} provider - Provider name
   * @param {string} accessToken - Access token
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(provider, accessToken) {
    const providerConfig = this.providers[provider];
    
    if (!providerConfig || !providerConfig.enabled || !providerConfig.apiUrl) {
      console.warn(`API not available for provider: ${provider}`);
      return null;
    }

    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch(`${providerConfig.apiUrl}/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error getting user profile (${provider}):`, error.message);
      return null;
    }
  }

  /**
   * Normalize watch history from different providers to common format
   * @param {string} provider - Provider name
   * @param {Object} data - Raw API response
   * @returns {Array} Normalized watch history
   */
  normalizeWatchHistory(provider, data) {
    // Each provider has different response format
    // This method normalizes them to a common structure
    
    let items = [];
    
    switch (provider) {
      case 'netflix':
        items = data.viewingActivity || [];
        return items.map(item => ({
          id: item.movieID || item.seriesTitle,
          title: item.title,
          type: item.series ? 'tv' : 'movie',
          watchedAt: item.date,
          duration: item.duration,
          provider: 'Netflix'
        }));
        
      case 'hulu':
        items = data.history || [];
        return items.map(item => ({
          id: item.id,
          title: item.name,
          type: item.type,
          watchedAt: item.watched_at,
          duration: item.duration,
          provider: 'Hulu'
        }));
        
      case 'disney':
        items = data.watchlist || [];
        return items.map(item => ({
          id: item.contentId,
          title: item.title,
          type: item.programType,
          watchedAt: item.lastWatched,
          duration: item.runtime,
          provider: 'Disney+'
        }));
        
      case 'prime':
        items = data.items || [];
        return items.map(item => ({
          id: item.asin,
          title: item.title,
          type: item.contentType,
          watchedAt: item.viewedDate,
          duration: item.runtime,
          provider: 'Amazon Prime Video'
        }));
        
      case 'hbo':
        items = data.viewing_history || [];
        return items.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type,
          watchedAt: item.timestamp,
          duration: item.duration,
          provider: 'HBO Max'
        }));
        
      case 'appletv':
        items = data.history || [];
        return items.map(item => ({
          id: item.id,
          title: item.title,
          type: item.contentType,
          watchedAt: item.playedAt,
          duration: item.playbackDuration,
          provider: 'Apple TV+'
        }));
        
      default:
        return [];
    }
  }

  /**
   * Revoke access token
   * @param {string} provider - Provider name
   * @param {string} token - Access or refresh token
   * @returns {Promise<boolean>} Success status
   */
  async revokeToken(provider, token) {
    const providerConfig = this.providers[provider];
    
    if (!providerConfig || !providerConfig.enabled || !providerConfig.revokeUrl) {
      console.warn(`Token revocation not available for provider: ${provider}`);
      return false;
    }

    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch(providerConfig.revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          token: token,
          client_id: providerConfig.clientId,
          client_secret: providerConfig.clientSecret
        })
      });

      return response.ok;
    } catch (error) {
      console.error(`Error revoking token (${provider}):`, error.message);
      return false;
    }
  }

  /**
   * Check if a provider is configured and enabled
   * @param {string} provider - Provider name
   * @returns {boolean}
   */
  isProviderEnabled(provider) {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      return false;
    }
    
    // Check if explicitly enabled
    if (!providerConfig.enabled) {
      return false;
    }
    
    // Check if client credentials are configured (not null/undefined/empty)
    if (!providerConfig.clientId || !providerConfig.clientSecret) {
      return false;
    }
    
    // Ensure credentials are not placeholder values by checking length and format
    // Placeholder typically starts with "YOUR_" - real credentials don't
    if (providerConfig.clientId.startsWith('YOUR_') || 
        providerConfig.clientSecret.startsWith('YOUR_')) {
      return false;
    }
    
    return true;
  }

  /**
   * Get list of enabled providers
   * @returns {Array<string>}
   */
  getEnabledProviders() {
    return Object.keys(this.providers).filter(provider => 
      this.isProviderEnabled(provider)
    );
  }
}

module.exports = new StreamingOAuthService();
