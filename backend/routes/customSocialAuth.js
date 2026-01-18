/**
 * Custom Social Authentication Routes
 * 
 * API endpoints for managing Auth0 custom social connections.
 * Demonstrates how to use Auth0's extensibility points for custom OAuth2 providers.
 */

const express = require('express');
const router = express.Router();
const customSocialConnectionService = require('../services/customSocialConnectionService');

/**
 * GET /api/custom-social/providers
 * List available custom social providers
 */
router.get('/providers', (req, res) => {
  try {
    const providers = customSocialConnectionService.getAvailableProviders();
    
    res.json({
      success: true,
      count: providers.length,
      providers: providers,
      message: 'These providers support custom social connections via Auth0 extensibility points'
    });
  } catch (error) {
    console.error('Error listing providers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/custom-social/setup/:provider
 * Set up or update a custom social connection
 * 
 * This endpoint demonstrates:
 * - Getting Auth0 Management API permissions
 * - Creating custom OAuth2 connections
 * - Implementing Fetch User Profile functionality
 * 
 * @param {string} provider - Provider ID (e.g., 'netflix', 'hulu', 'disney')
 */
router.post('/setup/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    
    // Validate provider credentials
    const validation = customSocialConnectionService.validateProviderCredentials(provider);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        hint: `Set ${provider.toUpperCase()}_CUSTOM_CLIENT_ID and ${provider.toUpperCase()}_CUSTOM_CLIENT_SECRET in your environment variables`
      });
    }
    
    // Create or update custom connection using Auth0 extensibility
    const connection = await customSocialConnectionService.setupCustomConnection(provider);
    
    res.json({
      success: true,
      connection: {
        id: connection.id,
        name: connection.name,
        display_name: connection.display_name,
        strategy: connection.strategy,
        enabled: connection.enabled_clients?.length > 0,
        authorization_url: connection.options?.authorizationURL,
        token_url: connection.options?.tokenURL
      },
      message: `Successfully configured custom social connection for ${validation.provider}`,
      usage: {
        frontend: `auth0Client.loginWithRedirect({ authorizationParams: { connection: '${connection.name}' } })`,
        description: 'Use this connection name when initiating Auth0 login from your frontend'
      }
    });
  } catch (error) {
    console.error('Error setting up custom connection:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

/**
 * GET /api/custom-social/connections
 * List all configured custom social connections
 * 
 * Shows connections created through Auth0's custom OAuth2 extensibility
 */
router.get('/connections', async (req, res) => {
  try {
    const connections = await customSocialConnectionService.listCustomConnections();
    
    res.json({
      success: true,
      count: connections.length,
      connections: connections.map(conn => ({
        id: conn.id,
        name: conn.name,
        display_name: conn.display_name,
        strategy: conn.strategy,
        enabled: conn.enabled_clients?.length > 0,
        enabled_for: conn.enabled_clients || [],
        created_at: conn.created_at,
        updated_at: conn.updated_at
      })),
      message: 'Custom OAuth2 connections configured in Auth0'
    });
  } catch (error) {
    console.error('Error listing connections:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/custom-social/connection/:connectionId
 * Delete a custom social connection
 * 
 * @param {string} connectionId - Auth0 connection ID
 */
router.delete('/connection/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    
    await customSocialConnectionService.deleteConnection(connectionId);
    
    res.json({
      success: true,
      message: `Successfully deleted connection: ${connectionId}`
    });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/custom-social/validate/:provider
 * Validate provider credentials without creating connection
 * 
 * @param {string} provider - Provider ID
 */
router.get('/validate/:provider', (req, res) => {
  try {
    const { provider } = req.params;
    
    const validation = customSocialConnectionService.validateProviderCredentials(provider);
    
    if (validation.valid) {
      res.json({
        success: true,
        provider: validation.provider,
        message: 'Provider credentials are configured correctly',
        ready: true
      });
    } else {
      res.status(400).json({
        success: false,
        error: validation.error,
        ready: false,
        action: 'Add the required environment variables and restart the server'
      });
    }
  } catch (error) {
    console.error('Error validating provider:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/custom-social/test/:provider
 * Test custom connection by fetching authorization URL
 * 
 * @param {string} provider - Provider ID
 */
router.post('/test/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required for testing'
      });
    }
    
    // Validate credentials
    const validation = customSocialConnectionService.validateProviderCredentials(provider);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    res.json({
      success: true,
      message: 'Provider is configured. Use Auth0 Universal Login to test the connection.',
      test_url: `https://${process.env.AUTH0_DOMAIN}/authorize?` +
        `client_id=${process.env.AUTH0_CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback.html')}&` +
        `connection=${provider}-custom&` +
        `state=${userId}`,
      instructions: [
        '1. Navigate to the test_url in a browser',
        '2. You will be redirected to the provider\'s OAuth page',
        '3. Authorize the application',
        '4. You will be redirected back with user profile data',
        '5. Check Auth0 logs for the Fetch User Profile script output'
      ]
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/custom-social/documentation
 * Get API documentation and examples
 */
router.get('/documentation', (req, res) => {
  res.json({
    success: true,
    title: 'Custom Social Connections API Documentation',
    description: 'This API demonstrates how to implement custom social connections using Auth0 extensibility points',
    
    concepts: {
      'Custom Social Connections': 'Auth0 custom OAuth2 connections for providers not in the marketplace',
      'Extensibility Points': 'Auth0 provides scripts for Authorization URL, Token Exchange, and Fetch User Profile',
      'Fetch User Profile': 'Retrieves user information from provider\'s userinfo endpoint in JSON format',
      'Management API': 'Required to create and manage custom connections programmatically'
    },
    
    endpoints: [
      {
        method: 'GET',
        path: '/api/custom-social/providers',
        description: 'List available custom providers',
        authentication: 'None'
      },
      {
        method: 'POST',
        path: '/api/custom-social/setup/:provider',
        description: 'Create or update custom social connection',
        authentication: 'Server-side only (uses Management API)',
        parameters: {
          provider: 'Provider ID (netflix, hulu, disney)'
        },
        example: {
          request: 'POST /api/custom-social/setup/netflix',
          response: {
            success: true,
            connection: {
              name: 'netflix-custom',
              display_name: 'Netflix',
              enabled: true
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/api/custom-social/connections',
        description: 'List all configured custom connections',
        authentication: 'Server-side only (uses Management API)'
      },
      {
        method: 'DELETE',
        path: '/api/custom-social/connection/:connectionId',
        description: 'Delete a custom connection',
        authentication: 'Server-side only (uses Management API)',
        parameters: {
          connectionId: 'Auth0 connection ID'
        }
      },
      {
        method: 'GET',
        path: '/api/custom-social/validate/:provider',
        description: 'Validate provider credentials',
        authentication: 'None',
        parameters: {
          provider: 'Provider ID'
        }
      }
    ],
    
    setup_guide: 'See AUTH0_CUSTOM_SOCIAL_CONNECTIONS.md for complete setup instructions',
    
    example_usage: {
      step1: 'Set environment variables (NETFLIX_CLIENT_ID, NETFLIX_CLIENT_SECRET)',
      step2: 'POST /api/custom-social/setup/netflix to create connection',
      step3: 'Frontend: auth0Client.loginWithRedirect({ authorizationParams: { connection: "netflix-custom" } })',
      step4: 'Auth0 calls Fetch User Profile script to retrieve user data from Netflix API',
      step5: 'User profile data (in JSON format) is returned to your application'
    },
    
    related_files: [
      'AUTH0_CUSTOM_SOCIAL_CONNECTIONS.md - Complete documentation',
      'backend/services/customSocialConnectionService.js - Implementation',
      'backend/routes/customSocialAuth.js - API routes (this file)'
    ]
  });
});

module.exports = router;
