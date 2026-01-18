# Auth0 Custom Social Connections Guide

This guide demonstrates how to get Auth0 permissions and build custom social connection integrations using Auth0's extensibility points for providers not available in Auth0's marketplace.

## Table of Contents

1. [Getting Auth0 Permissions](#getting-auth0-permissions)
2. [Custom Social Connection Overview](#custom-social-connection-overview)
3. [Auth0 Extensibility Points](#auth0-extensibility-points)
4. [Fetch User Profile Implementation](#fetch-user-profile-implementation)
5. [Step-by-Step Custom Connection Setup](#step-by-step-custom-connection-setup)
6. [Example: Custom Streaming Service Connection](#example-custom-streaming-service-connection)
7. [Testing and Troubleshooting](#testing-and-troubleshooting)

---

## Getting Auth0 Permissions

### Required Auth0 Permissions for Custom Connections

To implement custom social connections, you need the following permissions in your Auth0 tenant:

#### 1. Management API Permissions

Navigate to **Auth0 Dashboard** → **Applications** → **APIs** → **Auth0 Management API**

Enable the following scopes for your application:

```json
{
  "scopes": [
    "read:connections",
    "create:connections",
    "update:connections",
    "delete:connections",
    "read:users",
    "update:users",
    "create:users",
    "read:user_idp_tokens"
  ]
}
```

#### 2. Application Grants

In **Auth0 Dashboard** → **Applications** → **Your Application** → **Advanced Settings** → **Grant Types**

Enable:
- ✅ Authorization Code
- ✅ Implicit
- ✅ Refresh Token
- ✅ Client Credentials (for Management API access)

#### 3. Getting Management API Token

To manage connections programmatically, you need a Management API token:

**Option A: Use Auth0 Dashboard**
1. Go to **Auth0 Dashboard** → **Applications** → **APIs** → **Auth0 Management API**
2. Click **API Explorer** tab
3. Click **Create & Authorize a Test Application**
4. Copy the token (valid for 24 hours)

**Option B: Programmatic Token Request**

```javascript
const axios = require('axios');

async function getManagementToken() {
  const response = await axios.post(
    `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    {
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
    }
  );
  
  return response.data.access_token;
}
```

---

## Custom Social Connection Overview

### What are Custom Social Connections?

Custom social connections allow you to integrate OAuth 2.0 providers that aren't available in Auth0's marketplace. This is useful for:

- **Custom Streaming Services**: Netflix, Hulu, Disney+, etc. (when APIs are available)
- **Niche Social Networks**: Industry-specific or regional platforms
- **Internal SSO Systems**: Corporate identity providers
- **Custom OAuth Providers**: Your own OAuth service

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   User      │────▶│   Auth0      │────▶│  Custom OAuth    │
│   Browser   │◀────│   Universal  │◀────│  Provider        │
└─────────────┘     │   Login      │     │  (Netflix, etc.) │
                    └──────────────┘     └──────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Your App    │
                    │  Backend     │
                    └──────────────┘
```

---

## Auth0 Extensibility Points

Auth0 provides several extensibility points for custom social connections:

### 1. Custom OAuth2 Connection Script

The main extensibility point is the custom OAuth2 connection, which requires three scripts:

#### Authorization URL Script
```javascript
function(config) {
  const authorizationUrl = 'https://provider.com/oauth/authorize';
  const params = {
    response_type: 'code',
    client_id: config.client_id,
    redirect_uri: config.callback_url,
    scope: config.scope || 'user:email user:profile',
    state: config.state
  };
  
  return authorizationUrl + '?' + new URLSearchParams(params).toString();
}
```

#### Token Exchange Script
```javascript
function(config, callback) {
  const options = {
    method: 'POST',
    url: 'https://provider.com/oauth/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    form: {
      grant_type: 'authorization_code',
      code: config.code,
      client_id: config.client_id,
      client_secret: config.client_secret,
      redirect_uri: config.callback_url
    }
  };

  request(options, function(err, response, body) {
    if (err) return callback(err);
    
    try {
      const tokenResponse = JSON.parse(body);
      callback(null, {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        id_token: tokenResponse.id_token
      });
    } catch (e) {
      callback(e);
    }
  });
}
```

#### Fetch User Profile Script (Most Important)
```javascript
function(accessToken, context, callback) {
  const options = {
    method: 'GET',
    url: 'https://provider.com/api/userinfo',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Accept': 'application/json'
    }
  };

  request(options, function(err, response, body) {
    if (err) return callback(err);
    
    try {
      const userProfile = JSON.parse(body);
      
      // Map provider's user data to Auth0 user profile
      const profile = {
        user_id: userProfile.id,
        email: userProfile.email,
        email_verified: userProfile.email_verified || false,
        name: userProfile.name || userProfile.display_name,
        given_name: userProfile.first_name,
        family_name: userProfile.last_name,
        picture: userProfile.avatar_url || userProfile.picture,
        
        // Custom fields - stored in user_metadata or app_metadata
        user_metadata: {
          provider_username: userProfile.username,
          provider_id: userProfile.id,
          subscription_tier: userProfile.subscription?.tier,
          watch_history: userProfile.watch_history
        }
      };
      
      callback(null, profile);
    } catch (e) {
      callback(e);
    }
  });
}
```

### 2. Rules and Actions

Use Auth0 Rules or Actions to enhance the custom connection:

```javascript
/**
 * Auth0 Action: Enrich user profile with provider data
 */
exports.onExecutePostLogin = async (event, api) => {
  // Check if user logged in with custom social connection
  if (event.connection.name === 'netflix-custom') {
    const { access_token } = event.user.identities[0];
    
    // Fetch additional data from provider
    try {
      const response = await fetch('https://provider.com/api/v1/watchlist', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      const watchlistData = await response.json();
      
      // Store in user metadata
      api.user.setUserMetadata('watchlist', watchlistData);
      
      // Add custom claim to token
      api.idToken.setCustomClaim('has_premium', watchlistData.is_premium);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  }
};
```

---

## Fetch User Profile Implementation

### Understanding the Fetch User Profile Function

The **Fetch User Profile** script is the most critical extensibility point. It:

1. **Receives**: OAuth access token from the provider
2. **Calls**: Provider's userinfo endpoint
3. **Returns**: Normalized user profile in JSON format

### Standard User Profile Schema

Auth0 expects the following standardized fields:

```javascript
{
  // Required fields
  "user_id": "unique-identifier",      // Must be unique per provider
  
  // Standard OIDC claims
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://example.com/avatar.jpg",
  "nickname": "johndoe",
  
  // Optional fields
  "locale": "en-US",
  "birthdate": "1990-01-01",
  "phone_number": "+1234567890",
  "phone_number_verified": true,
  
  // Custom metadata
  "user_metadata": {
    // User-editable data
    "favorite_genre": "Action",
    "binge_count": 5
  },
  "app_metadata": {
    // App-controlled data (not user-editable)
    "subscription_tier": "premium",
    "provider_id": "external-id-123"
  }
}
```

### Advanced Fetch User Profile Examples

#### Example 1: Netflix-style Provider

```javascript
function(accessToken, context, callback) {
  // Configuration
  const PROVIDER_API_BASE = 'https://api.netflix.example.com';
  
  // Fetch user profile
  request.get({
    url: `${PROVIDER_API_BASE}/v1/users/me`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  }, function(err, response, body) {
    if (err) return callback(err);
    if (response.statusCode !== 200) {
      return callback(new Error('Failed to fetch user profile'));
    }
    
    try {
      const user = JSON.parse(body);
      
      // Fetch additional data in parallel
      const watchHistoryPromise = new Promise((resolve, reject) => {
        request.get({
          url: `${PROVIDER_API_BASE}/v1/users/me/history`,
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }, (err, res, body) => {
          if (err) reject(err);
          else resolve(JSON.parse(body));
        });
      });
      
      const preferencesPromise = new Promise((resolve, reject) => {
        request.get({
          url: `${PROVIDER_API_BASE}/v1/users/me/preferences`,
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }, (err, res, body) => {
          if (err) reject(err);
          else resolve(JSON.parse(body));
        });
      });
      
      // Wait for all requests
      Promise.all([watchHistoryPromise, preferencesPromise])
        .then(([watchHistory, preferences]) => {
          const profile = {
            user_id: `netflix|${user.id}`,
            email: user.email,
            email_verified: user.email_verified,
            name: user.display_name,
            picture: user.avatar_url,
            
            user_metadata: {
              netflix_id: user.id,
              subscription_type: user.subscription?.plan,
              member_since: user.created_at,
              watch_history: watchHistory.items || [],
              favorite_genres: preferences.genres || [],
              maturity_rating: preferences.maturity_level
            },
            
            app_metadata: {
              provider: 'netflix',
              access_token: accessToken, // Store for later use
              token_expires_at: Date.now() + (3600 * 1000) // 1 hour
            }
          };
          
          callback(null, profile);
        })
        .catch(callback);
        
    } catch (e) {
      callback(new Error('Error parsing response: ' + e.message));
    }
  });
}
```

#### Example 2: With Error Handling and Retry Logic

```javascript
function(accessToken, context, callback) {
  const MAX_RETRIES = 3;
  let retryCount = 0;
  
  function fetchWithRetry() {
    request.get({
      url: 'https://provider.com/api/v2/me',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Auth0-Custom-Connection/1.0'
      },
      timeout: 5000
    }, function(err, response, body) {
      // Handle network errors with retry
      if (err && retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(fetchWithRetry, 1000 * retryCount); // Exponential backoff
        return;
      }
      
      if (err) return callback(err);
      
      // Handle HTTP errors
      if (response.statusCode === 401) {
        return callback(new Error('Invalid access token'));
      }
      
      if (response.statusCode === 429) {
        return callback(new Error('Rate limit exceeded'));
      }
      
      if (response.statusCode !== 200) {
        return callback(new Error(`HTTP ${response.statusCode}: ${body}`));
      }
      
      try {
        const userData = JSON.parse(body);
        
        // Validate required fields
        if (!userData.id || !userData.email) {
          return callback(new Error('Missing required user fields'));
        }
        
        const profile = {
          user_id: userData.id,
          email: userData.email,
          email_verified: userData.verified || false,
          name: userData.full_name || `${userData.first_name} ${userData.last_name}`,
          given_name: userData.first_name,
          family_name: userData.last_name,
          picture: userData.profile_image,
          
          user_metadata: {
            provider_username: userData.username,
            bio: userData.bio,
            joined_date: userData.created_at
          }
        };
        
        callback(null, profile);
      } catch (e) {
        callback(new Error('JSON parse error: ' + e.message));
      }
    });
  }
  
  fetchWithRetry();
}
```

---

## Step-by-Step Custom Connection Setup

### Prerequisites

- Auth0 account with appropriate permissions
- OAuth credentials from your custom provider (client ID, client secret)
- Provider's OAuth endpoints (authorization, token, userinfo)

### Step 1: Create Custom Social Connection via Dashboard

1. **Navigate to Auth0 Dashboard**
   - Go to **Authentication** → **Social** → **Create Connection**
   - Select **Create Custom**

2. **Configure OAuth Settings**
   ```
   Name: netflix-custom
   Authorization URL: https://provider.com/oauth/authorize
   Token URL: https://provider.com/oauth/token
   Scope: user:read user:email user:history
   Client ID: your_client_id
   Client Secret: your_client_secret
   ```

3. **Add Fetch User Profile Script**
   - Paste your custom script in the editor
   - Test with the built-in debugger

4. **Enable Applications**
   - Select which Auth0 applications can use this connection
   - Save changes

### Step 2: Create Custom Social Connection via Management API

```javascript
const axios = require('axios');

async function createCustomConnection(managementToken) {
  const connection = {
    name: 'netflix-custom',
    display_name: 'Netflix',
    strategy: 'oauth2',
    enabled_clients: [process.env.AUTH0_CLIENT_ID],
    
    options: {
      client_id: 'YOUR_NETFLIX_CLIENT_ID',
      client_secret: 'YOUR_NETFLIX_CLIENT_SECRET',
      
      // Authorization URL template
      authorizationURL: 'https://netflix.example.com/oauth/authorize',
      tokenURL: 'https://netflix.example.com/oauth/token',
      scope: 'user:read user:email streaming:history',
      
      // Custom scripts
      scripts: {
        fetchUserProfile: `
          function(accessToken, context, callback) {
            request.get({
              url: 'https://netflix.example.com/api/userinfo',
              headers: {
                'Authorization': 'Bearer ' + accessToken
              }
            }, function(err, r, body) {
              if (err) return callback(err);
              try {
                const profile = JSON.parse(body);
                callback(null, {
                  user_id: profile.id,
                  email: profile.email,
                  name: profile.name,
                  picture: profile.avatar
                });
              } catch(e) {
                callback(e);
              }
            });
          }
        `
      },
      
      // Custom parameters
      customHeaders: {
        'X-API-Key': 'optional-api-key'
      }
    }
  };
  
  try {
    const response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/connections`,
      connection,
      {
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Connection created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating connection:', error.response?.data || error);
    throw error;
  }
}
```

### Step 3: Integrate in Your Application

#### Frontend Integration

```javascript
// Initialize Auth0 with custom connection
const auth0Client = await createAuth0Client({
  domain: 'your-domain.auth0.com',
  clientId: 'your-client-id',
  authorizationParams: {
    redirect_uri: window.location.origin + '/callback'
  }
});

// Login with custom Netflix connection
async function loginWithNetflix() {
  await auth0Client.loginWithRedirect({
    authorizationParams: {
      connection: 'netflix-custom',
      // Optional: pass additional parameters
      screen_hint: 'signup'
    }
  });
}

// Handle callback
const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has('code') && searchParams.has('state')) {
  await auth0Client.handleRedirectCallback();
  
  // Get user profile (includes custom metadata)
  const user = await auth0Client.getUser();
  console.log('User watch history:', user.user_metadata?.watch_history);
}
```

#### Backend Integration

```javascript
const express = require('express');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();

// Validate Auth0 JWT
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

// Protected route
app.get('/api/profile', checkJwt, async (req, res) => {
  const userId = req.auth.sub;
  
  // Access custom metadata
  const watchHistory = req.auth['user_metadata']?.watch_history || [];
  
  res.json({
    userId,
    watchHistory
  });
});
```

---

## Example: Custom Streaming Service Connection

### Complete Netflix OAuth Integration Example

This example demonstrates a complete custom social connection for a hypothetical Netflix OAuth API.

#### 1. Provider Configuration

```javascript
// backend/config/customSocialProviders.js

module.exports = {
  netflix: {
    name: 'Netflix',
    strategy: 'oauth2',
    icon: 'https://www.netflix.com/favicon.ico',
    
    oauth: {
      authorizationURL: 'https://www.netflix.com/oauth/authorize',
      tokenURL: 'https://www.netflix.com/api/oauth/token',
      userInfoURL: 'https://api.netflix.com/v1/users/current',
      scope: ['user.read', 'user.email', 'viewing.history'],
      
      // OAuth2 configuration
      response_type: 'code',
      grant_type: 'authorization_code',
      
      // Token configuration
      token_endpoint_auth_method: 'client_secret_post'
    },
    
    // Field mapping from provider to Auth0
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
  }
};
```

#### 2. Fetch User Profile Script for Netflix

```javascript
// Auth0 Custom Connection Script
function fetchNetflixUserProfile(accessToken, context, callback) {
  const BASE_URL = 'https://api.netflix.com/v1';
  
  // Step 1: Fetch basic user info
  request.get({
    url: `${BASE_URL}/users/current`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'X-Netflix-Client-Version': '1.0.0'
    },
    json: true
  }, function(err, response, userInfo) {
    if (err) return callback(err);
    if (response.statusCode !== 200) {
      return callback(new Error(`Netflix API returned ${response.statusCode}`));
    }
    
    // Step 2: Fetch viewing history (optional)
    request.get({
      url: `${BASE_URL}/users/current/viewing-activity`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      json: true,
      qs: {
        limit: 50,
        pg: 0
      }
    }, function(histErr, histResponse, viewingActivity) {
      // Don't fail if history fetch fails
      const watchHistory = (histResponse?.statusCode === 200) 
        ? viewingActivity?.viewedItems || []
        : [];
      
      // Step 3: Construct Auth0 user profile
      const profile = {
        // Required fields
        user_id: `netflix|${userInfo.accountId}`,
        email: userInfo.email,
        email_verified: userInfo.emailVerified || false,
        
        // Profile information
        name: userInfo.displayName || userInfo.email,
        nickname: userInfo.profileName,
        picture: userInfo.avatar?.url || 'https://www.netflix.com/default-avatar.png',
        
        // Locale and region
        locale: userInfo.language || 'en-US',
        
        // Custom metadata for your app
        user_metadata: {
          netflix_account_id: userInfo.accountId,
          profile_id: userInfo.profileId,
          subscription_type: userInfo.planType,
          country_code: userInfo.countryCode,
          maturity_level: userInfo.maturityLevel,
          
          // Viewing preferences
          preferred_genres: userInfo.preferences?.genres || [],
          watch_history: watchHistory.map(item => ({
            title_id: item.titleId,
            title_name: item.title,
            watched_at: item.date,
            duration: item.duration,
            series_title: item.seriesTitle
          })),
          
          // Account metadata
          member_since: userInfo.membershipStartDate,
          last_login: new Date().toISOString()
        },
        
        // App-controlled metadata (not user-editable)
        app_metadata: {
          provider: 'netflix',
          provider_access_token: accessToken, // Store for API calls
          token_type: 'Bearer',
          token_obtained_at: Date.now(),
          
          // For token refresh
          requires_token_refresh: true,
          refresh_interval_hours: 1
        }
      };
      
      callback(null, profile);
    });
  });
}
```

#### 3. Backend Service for Managing Custom Connections

```javascript
// backend/services/customSocialConnectionService.js

const axios = require('axios');
const providers = require('../config/customSocialProviders');

class CustomSocialConnectionService {
  constructor() {
    this.managementToken = null;
    this.tokenExpiry = null;
  }
  
  /**
   * Get Auth0 Management API token
   */
  async getManagementToken() {
    // Return cached token if still valid
    if (this.managementToken && this.tokenExpiry > Date.now()) {
      return this.managementToken;
    }
    
    const response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
      }
    );
    
    this.managementToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    
    return this.managementToken;
  }
  
  /**
   * Create or update a custom social connection
   */
  async setupCustomConnection(providerId) {
    const provider = providers[providerId];
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    
    const token = await this.getManagementToken();
    
    // Check if connection already exists
    const existingConnection = await this.getConnection(
      `${providerId}-custom`,
      token
    );
    
    if (existingConnection) {
      return this.updateConnection(providerId, provider, token);
    } else {
      return this.createConnection(providerId, provider, token);
    }
  }
  
  /**
   * Create new custom connection
   */
  async createConnection(providerId, provider, token) {
    const connection = {
      name: `${providerId}-custom`,
      display_name: provider.name,
      strategy: 'oauth2',
      
      enabled_clients: [process.env.AUTH0_CLIENT_ID],
      
      options: {
        client_id: process.env[`${providerId.toUpperCase()}_CLIENT_ID`],
        client_secret: process.env[`${providerId.toUpperCase()}_CLIENT_SECRET`],
        
        authorizationURL: provider.oauth.authorizationURL,
        tokenURL: provider.oauth.tokenURL,
        scope: provider.oauth.scope.join(' '),
        
        scripts: {
          fetchUserProfile: this.generateFetchUserProfileScript(provider)
        },
        
        icon_url: provider.icon
      }
    };
    
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
    
    return response.data;
  }
  
  /**
   * Generate Fetch User Profile script based on provider config
   */
  generateFetchUserProfileScript(provider) {
    const mapping = provider.profileMapping;
    
    return `
function(accessToken, context, callback) {
  request.get({
    url: '${provider.oauth.userInfoURL}',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Accept': 'application/json'
    },
    json: true
  }, function(err, response, body) {
    if (err) return callback(err);
    if (response.statusCode !== 200) {
      return callback(new Error('Failed to fetch user profile'));
    }
    
    try {
      const profile = {
        user_id: body['${mapping.user_id}'],
        email: body['${mapping.email}'],
        email_verified: body['${mapping.email_verified}'] || false,
        name: body['${mapping.name}'],
        picture: body['${mapping.picture}']
      };
      
      callback(null, profile);
    } catch (e) {
      callback(e);
    }
  });
}`;
  }
  
  /**
   * Get existing connection
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
      throw error;
    }
  }
  
  /**
   * List all custom connections
   */
  async listCustomConnections() {
    const token = await this.getManagementToken();
    
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
  }
}

module.exports = new CustomSocialConnectionService();
```

#### 4. API Route for Custom Connections

```javascript
// backend/routes/customSocialAuth.js

const express = require('express');
const router = express.Router();
const customSocialConnectionService = require('../services/customSocialConnectionService');

/**
 * POST /api/custom-social/setup/:provider
 * Set up a custom social connection
 */
router.post('/setup/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    
    const connection = await customSocialConnectionService.setupCustomConnection(provider);
    
    res.json({
      success: true,
      connection: {
        name: connection.name,
        display_name: connection.display_name,
        enabled: connection.enabled_clients.length > 0
      }
    });
  } catch (error) {
    console.error('Error setting up custom connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/custom-social/connections
 * List all custom social connections
 */
router.get('/connections', async (req, res) => {
  try {
    const connections = await customSocialConnectionService.listCustomConnections();
    
    res.json({
      success: true,
      connections: connections.map(conn => ({
        name: conn.name,
        display_name: conn.display_name,
        strategy: conn.strategy,
        enabled: conn.enabled_clients.length > 0
      }))
    });
  } catch (error) {
    console.error('Error listing connections:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

---

## Testing and Troubleshooting

### Testing Your Custom Connection

#### 1. Use Auth0's Connection Tester

1. Go to **Authentication** → **Social** → Your Custom Connection
2. Click **Try Connection**
3. Review the debug output

#### 2. Test with Your Application

```javascript
// Test script
async function testCustomConnection() {
  const auth0 = await createAuth0Client({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID
  });
  
  // Trigger login
  await auth0.loginWithRedirect({
    authorizationParams: {
      connection: 'netflix-custom'
    }
  });
  
  // After redirect
  const user = await auth0.getUser();
  console.log('User profile:', user);
  console.log('Watch history:', user.user_metadata?.watch_history);
}
```

### Common Issues and Solutions

#### Issue: "Failed to fetch user profile"

**Causes:**
- Invalid access token
- Wrong userinfo endpoint URL
- Missing required headers

**Solution:**
```javascript
// Add detailed error logging
function(accessToken, context, callback) {
  console.log('Fetching profile with token:', accessToken.substring(0, 10) + '...');
  
  request.get({
    url: 'https://provider.com/userinfo',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  }, function(err, response, body) {
    console.log('Response status:', response?.statusCode);
    console.log('Response body:', body);
    
    if (err) {
      console.error('Request error:', err);
      return callback(err);
    }
    
    // ... rest of the code
  });
}
```

#### Issue: "Invalid callback URL"

**Solution:**
1. Verify callback URL in Auth0 Dashboard matches provider's whitelist
2. Add `https://YOUR_DOMAIN.auth0.com/login/callback` to provider's OAuth settings

#### Issue: "Scope not authorized"

**Solution:**
1. Check that requested scopes are available in provider's OAuth settings
2. Request user consent for additional scopes
3. Update scope configuration in Auth0 connection

#### Issue: "Token expired"

**Solution:**
Implement token refresh in your application:

```javascript
// backend/utils/refreshProviderToken.js

async function refreshProviderToken(userId, provider) {
  const user = await getAuth0User(userId);
  const refreshToken = user.app_metadata?.refresh_token;
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await axios.post(
    'https://provider.com/oauth/token',
    {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.PROVIDER_CLIENT_ID,
      client_secret: process.env.PROVIDER_CLIENT_SECRET
    }
  );
  
  // Update user metadata with new token
  await updateAuth0UserMetadata(userId, {
    access_token: response.data.access_token,
    token_obtained_at: Date.now()
  });
  
  return response.data.access_token;
}
```

### Debug Mode

Enable debug logging in your Fetch User Profile script:

```javascript
function(accessToken, context, callback) {
  const DEBUG = true;
  
  function log(message, data) {
    if (DEBUG) {
      console.log(`[Custom Connection Debug] ${message}`, data || '');
    }
  }
  
  log('Starting user profile fetch');
  log('Access token length:', accessToken.length);
  
  // Your fetch logic here
  
  log('Profile fetch complete');
  callback(null, profile);
}
```

---

## Security Best Practices

### 1. Token Storage

**Never store tokens in user_metadata:**
```javascript
// ❌ DON'T DO THIS
user_metadata: {
  access_token: accessToken  // Exposed in ID token!
}

// ✅ DO THIS
app_metadata: {
  access_token_encrypted: encrypt(accessToken)  // Not exposed to client
}
```

### 2. Scope Limitation

Request only necessary scopes:
```javascript
scope: ['user:read', 'user:email']  // Minimal required scopes
```

### 3. Token Expiration

Always check and handle token expiration:
```javascript
if (Date.now() > user.app_metadata.token_expires_at) {
  // Refresh token
  await refreshProviderToken(user.sub, 'netflix');
}
```

### 4. Rate Limiting

Implement rate limiting for custom connections:
```javascript
const rateLimit = require('express-rate-limit');

const customAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per window
});

router.post('/custom-social/setup/:provider', customAuthLimiter, async (req, res) => {
  // ... handler
});
```

---

## Additional Resources

### Official Documentation

- [Auth0 Custom Social Connections](https://auth0.com/docs/authenticate/identity-providers/social-identity-providers/oauth2)
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)
- [OAuth 2.0 Framework](https://oauth.net/2/)

### Related Guides in This Repository

- [AUTH0_SETUP_GUIDE.md](./AUTH0_SETUP_GUIDE.md) - Basic Auth0 setup
- [FRONTEND_AUTH0_CONFIG.md](./FRONTEND_AUTH0_CONFIG.md) - Frontend configuration
- [STREAMING_SERVICES_GUIDE.md](./docs/guides/STREAMING_SERVICES_GUIDE.md) - Streaming integration

### Example Implementations

- See `backend/routes/auth.js` for OAuth flow implementation
- See `backend/services/streamingOAuthService.js` for provider management
- See `frontend/src/utils/auth0-config.js` for frontend integration

---

## Summary

This guide covered:

✅ How to get Auth0 permissions for custom connections  
✅ Understanding Auth0's extensibility points  
✅ Implementing Fetch User Profile functionality  
✅ Creating custom social connections via Dashboard and API  
✅ Complete Netflix OAuth integration example  
✅ Testing and troubleshooting tips  
✅ Security best practices  

For custom social connections not available in Auth0's marketplace, use the extensibility points and Fetch User Profile scripts to retrieve user information from the provider's userinfo endpoint in JSON format.

---

**Last Updated**: January 2026  
**Version**: 1.0.0
