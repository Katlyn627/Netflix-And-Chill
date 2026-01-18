/**
 * Custom Social Connection Service
 * 
 * Manages Auth0 custom social connections for providers not in the marketplace.
 * Implements Auth0's extensibility points for custom OAuth2 integrations.
 */

const axios = require('axios');

class CustomSocialConnectionService {
  constructor() {
    this.managementToken = null;
    this.tokenExpiry = null;
    
    // Configuration for supported custom providers
    this.providers = {
      netflix: {
        name: 'Netflix',
        strategy: 'oauth2',
        icon: 'https://www.netflix.com/favicon.ico',
        oauth: {
          authorizationURL: 'https://www.netflix.com/oauth/authorize',
          tokenURL: 'https://www.netflix.com/api/oauth/token',
          userInfoURL: 'https://api.netflix.com/v1/users/current',
          scope: ['user.read', 'user.email', 'viewing.history']
        },
        profileMapping: {
          user_id: 'accountId',
          email: 'email',
          name: 'displayName',
          picture: 'avatar.url',
          email_verified: 'emailVerified'
        }
      },
      
      hulu: {
        name: 'Hulu',
        strategy: 'oauth2',
        icon: 'https://www.hulu.com/favicon.ico',
        oauth: {
          authorizationURL: 'https://auth.hulu.com/v1/authorize',
          tokenURL: 'https://auth.hulu.com/v1/token',
          userInfoURL: 'https://api.hulu.com/v1/users/me',
          scope: ['user:basic', 'user:email', 'watch:history']
        },
        profileMapping: {
          user_id: 'userId',
          email: 'userEmail',
          name: 'userName',
          picture: 'profileImage'
        }
      },
      
      disney: {
        name: 'Disney+',
        strategy: 'oauth2',
        icon: 'https://www.disneyplus.com/favicon.ico',
        oauth: {
          authorizationURL: 'https://disneyid.disney.com/authorize',
          tokenURL: 'https://disneyid.disney.com/token',
          userInfoURL: 'https://api.disneyplus.com/v1/user/profile',
          scope: ['openid', 'profile', 'email', 'watchlist']
        },
        profileMapping: {
          user_id: 'sub',
          email: 'email',
          name: 'name',
          picture: 'picture',
          email_verified: 'email_verified'
        }
      }
    };
  }
  
  /**
   * Get Auth0 Management API token
   * Caches token until expiry
   */
  async getManagementToken() {
    // Return cached token if still valid
    if (this.managementToken && this.tokenExpiry > Date.now()) {
      return this.managementToken;
    }
    
    try {
      const response = await axios.post(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      this.managementToken = response.data.access_token;
      // Set expiry with 5-minute buffer
      this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);
      
      return this.managementToken;
    } catch (error) {
      console.error('Error getting Management API token:', error.response?.data || error.message);
      throw new Error('Failed to obtain Auth0 Management API token');
    }
  }
  
  /**
   * Create or update a custom social connection
   * 
   * @param {string} providerId - Provider identifier (e.g., 'netflix', 'hulu')
   * @returns {Object} Created/updated connection details
   */
  async setupCustomConnection(providerId) {
    const provider = this.providers[providerId];
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}. Supported: ${Object.keys(this.providers).join(', ')}`);
    }
    
    // Validate environment variables
    const clientId = process.env[`${providerId.toUpperCase()}_CUSTOM_CLIENT_ID`];
    const clientSecret = process.env[`${providerId.toUpperCase()}_CUSTOM_CLIENT_SECRET`];
    
    if (!clientId || !clientSecret) {
      throw new Error(`Missing OAuth credentials for ${providerId}. Set ${providerId.toUpperCase()}_CUSTOM_CLIENT_ID and ${providerId.toUpperCase()}_CUSTOM_CLIENT_SECRET`);
    }
    
    const token = await this.getManagementToken();
    const connectionName = `${providerId}-custom`;
    
    // Check if connection already exists
    const existingConnection = await this.getConnection(connectionName, token);
    
    if (existingConnection) {
      console.log(`Updating existing connection: ${connectionName}`);
      return this.updateConnection(existingConnection.id, providerId, provider, token);
    } else {
      console.log(`Creating new connection: ${connectionName}`);
      return this.createConnection(providerId, provider, token);
    }
  }
  
  /**
   * Create new custom social connection
   * 
   * @param {string} providerId - Provider identifier
   * @param {Object} provider - Provider configuration
   * @param {string} token - Management API token
   */
  async createConnection(providerId, provider, token) {
    const connectionName = `${providerId}-custom`;
    
    const connection = {
      name: connectionName,
      display_name: provider.name,
      strategy: 'oauth2',
      enabled_clients: [process.env.AUTH0_CLIENT_ID],
      
      options: {
        client_id: process.env[`${providerId.toUpperCase()}_CUSTOM_CLIENT_ID`],
        client_secret: process.env[`${providerId.toUpperCase()}_CUSTOM_CLIENT_SECRET`],
        
        authorizationURL: provider.oauth.authorizationURL,
        tokenURL: provider.oauth.tokenURL,
        scope: Array.isArray(provider.oauth.scope) 
          ? provider.oauth.scope.join(' ') 
          : provider.oauth.scope,
        
        scripts: {
          fetchUserProfile: this.generateFetchUserProfileScript(provider)
        },
        
        icon_url: provider.icon
      }
    };
    
    try {
      const response = await axios.post(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/connections`,
        connection,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`Successfully created connection: ${connectionName}`);
      return response.data;
    } catch (error) {
      console.error(`Error creating connection ${connectionName}:`, error.response?.data || error.message);
      throw new Error(`Failed to create custom connection: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Update existing custom connection
   * 
   * @param {string} connectionId - Connection ID
   * @param {string} providerId - Provider identifier
   * @param {Object} provider - Provider configuration
   * @param {string} token - Management API token
   */
  async updateConnection(connectionId, providerId, provider, token) {
    const updates = {
      enabled_clients: [process.env.AUTH0_CLIENT_ID],
      
      options: {
        client_id: process.env[`${providerId.toUpperCase()}_CUSTOM_CLIENT_ID`],
        client_secret: process.env[`${providerId.toUpperCase()}_CUSTOM_CLIENT_SECRET`],
        
        authorizationURL: provider.oauth.authorizationURL,
        tokenURL: provider.oauth.tokenURL,
        scope: Array.isArray(provider.oauth.scope) 
          ? provider.oauth.scope.join(' ') 
          : provider.oauth.scope,
        
        scripts: {
          fetchUserProfile: this.generateFetchUserProfileScript(provider)
        }
      }
    };
    
    try {
      const response = await axios.patch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/connections/${connectionId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`Successfully updated connection: ${connectionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating connection ${connectionId}:`, error.response?.data || error.message);
      throw new Error(`Failed to update custom connection: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Generate Fetch User Profile script based on provider configuration
   * This is the core extensibility point for custom social connections
   * 
   * @param {Object} provider - Provider configuration
   * @returns {string} JavaScript function as string
   */
  generateFetchUserProfileScript(provider) {
    const mapping = provider.profileMapping;
    
    // Helper function to generate field access code
    const getFieldAccess = (path) => {
      return path.includes('.') 
        ? `body.${path}`
        : `body['${path}']`;
    };
    
    return `function(accessToken, context, callback) {
  // Fetch user profile from provider's userinfo endpoint
  // This implements Auth0's Fetch User Profile extensibility point
  
  request.get({
    url: '${provider.oauth.userInfoURL}',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Accept': 'application/json',
      'User-Agent': 'Auth0-Custom-Connection/1.0'
    },
    json: true,
    timeout: 10000
  }, function(err, response, body) {
    // Error handling
    if (err) {
      console.error('Request error:', err);
      return callback(err);
    }
    
    // HTTP status validation
    if (response.statusCode === 401) {
      return callback(new Error('Invalid or expired access token'));
    }
    
    if (response.statusCode === 429) {
      return callback(new Error('Rate limit exceeded'));
    }
    
    if (response.statusCode !== 200) {
      console.error('HTTP error:', response.statusCode, body);
      return callback(new Error('Failed to fetch user profile: HTTP ' + response.statusCode));
    }
    
    // Validate response body
    if (!body || typeof body !== 'object') {
      return callback(new Error('Invalid response body'));
    }
    
    try {
      // Map provider fields to Auth0 user profile schema
      // This is returned in JSON format as specified in Auth0 documentation
      var profile = {
        // Required fields
        user_id: String(${getFieldAccess(mapping.user_id)}),
        email: ${getFieldAccess(mapping.email)},
        email_verified: ${getFieldAccess(mapping.email_verified)} || false,
        
        // Standard profile fields
        name: ${getFieldAccess(mapping.name)} || ${getFieldAccess(mapping.email)},
        picture: ${getFieldAccess(mapping.picture)} || 'https://via.placeholder.com/150',
        
        // Store provider-specific data in user_metadata
        user_metadata: {
          provider: '${provider.name.toLowerCase().replace(/[^a-z0-9]/g, '')}',
          provider_user_id: String(${getFieldAccess(mapping.user_id)}),
          provider_access_token: accessToken,
          token_obtained_at: new Date().toISOString(),
          raw_profile: body
        }
      };
      
      // Validate required fields
      if (!profile.user_id || !profile.email) {
        return callback(new Error('Missing required user fields (user_id or email)'));
      }
      
      callback(null, profile);
    } catch (e) {
      console.error('Profile mapping error:', e);
      callback(new Error('Error mapping user profile: ' + e.message));
    }
  });
}`;
  }
  
  /**
   * Get existing connection by name
   * 
   * @param {string} name - Connection name
   * @param {string} token - Management API token
   * @returns {Object|null} Connection object or null if not found
   */
  async getConnection(name, token) {
    try {
      const response = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/connections`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            name: name
          }
        }
      );
      
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error getting connection:', error.response?.data || error.message);
      throw error;
    }
  }
  
  /**
   * List all custom OAuth2 connections
   * 
   * @returns {Array} Array of connection objects
   */
  async listCustomConnections() {
    const token = await this.getManagementToken();
    
    try {
      const response = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/connections`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            strategy: 'oauth2'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error listing connections:', error.response?.data || error.message);
      throw new Error('Failed to list custom connections');
    }
  }
  
  /**
   * Delete a custom connection
   * 
   * @param {string} connectionId - Connection ID
   */
  async deleteConnection(connectionId) {
    const token = await this.getManagementToken();
    
    try {
      await axios.delete(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/connections/${connectionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log(`Successfully deleted connection: ${connectionId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting connection:', error.response?.data || error.message);
      throw new Error(`Failed to delete connection: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Get available providers
   * 
   * @returns {Array} Array of available provider IDs and names
   */
  getAvailableProviders() {
    return Object.entries(this.providers).map(([id, config]) => ({
      id,
      name: config.name,
      icon: config.icon
    }));
  }
  
  /**
   * Validate provider credentials in environment
   * 
   * @param {string} providerId - Provider identifier
   * @returns {Object} Validation result
   */
  validateProviderCredentials(providerId) {
    const provider = this.providers[providerId];
    if (!provider) {
      return {
        valid: false,
        error: `Unknown provider: ${providerId}`
      };
    }
    
    const clientId = process.env[`${providerId.toUpperCase()}_CUSTOM_CLIENT_ID`];
    const clientSecret = process.env[`${providerId.toUpperCase()}_CUSTOM_CLIENT_SECRET`];
    
    if (!clientId) {
      return {
        valid: false,
        error: `Missing ${providerId.toUpperCase()}_CUSTOM_CLIENT_ID environment variable`
      };
    }
    
    if (!clientSecret) {
      return {
        valid: false,
        error: `Missing ${providerId.toUpperCase()}_CUSTOM_CLIENT_SECRET environment variable`
      };
    }
    
    return {
      valid: true,
      provider: provider.name
    };
  }
}

module.exports = new CustomSocialConnectionService();
