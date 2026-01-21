const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const streamingOAuthService = require('../services/streamingOAuthService');
const { getDatabase } = require('../utils/database');
const { rateLimiters } = require('../middleware/rateLimiter');
const User = require('../models/User');

// Store for CSRF state tokens
// NOTE: In production with multiple server instances, use Redis or database storage
// This in-memory store is suitable for development/single-instance deployments
const stateStore = new Map();

// Clean up expired state tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  const expiredStates = [];
  
  for (const [state, data] of stateStore.entries()) {
    if (now - data.createdAt > 10 * 60 * 1000) { // 10 minutes
      expiredStates.push(state);
    }
  }
  
  expiredStates.forEach(state => stateStore.delete(state));
}, 5 * 60 * 1000);

/**
 * GET /api/auth/:provider/connect
 * Initiate OAuth flow for streaming platform
 * Rate limited to 10 requests per 15 minutes per user
 */
router.get('/:provider/connect', rateLimiters.auth, async (req, res) => {
  try {
    const { provider } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Verify user exists
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if provider is enabled
    if (!streamingOAuthService.isProviderEnabled(provider)) {
      return res.status(400).json({ 
        error: `OAuth not configured for provider: ${provider}`,
        message: 'Please contact the administrator to enable this streaming platform integration'
      });
    }

    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state with userId (expires in 10 minutes)
    stateStore.set(state, {
      userId,
      provider,
      createdAt: Date.now()
    });

    // Clean up expired states
    setTimeout(() => {
      stateStore.delete(state);
    }, 10 * 60 * 1000);

    // Get authorization URL
    const authUrl = streamingOAuthService.getAuthorizationUrl(provider, state);

    if (!authUrl) {
      return res.status(500).json({ error: 'Failed to generate authorization URL' });
    }

    // Redirect to provider's OAuth page
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating OAuth flow:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
});

/**
 * GET /api/auth/:provider/callback
 * OAuth callback endpoint
 * Rate limited to prevent callback abuse
 */
router.get('/:provider/callback', rateLimiters.auth, async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state, error, error_description } = req.query;

    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error, error_description);
      const userId = req.query.userId || stateStore.get(state)?.userId;
      // Validate userId format before using in redirect
      const isValidUserId = userId && /^user_[0-9]+_[a-z0-9]+$/.test(userId);
      const safeUserId = isValidUserId ? encodeURIComponent(userId) : '';
      const redirectUrl = safeUserId ? `/streaming-services.html?userId=${safeUserId}` : '/profile';
      return res.redirect(`${redirectUrl}?error=${encodeURIComponent(error_description || error)}`);
    }

    // Verify state token
    const stateData = stateStore.get(state);
    if (!stateData) {
      return res.status(400).json({ error: 'Invalid or expired state token' });
    }

    // Delete state token (one-time use)
    stateStore.delete(state);

    const { userId } = stateData;

    // Exchange code for token
    const tokenData = await streamingOAuthService.exchangeCodeForToken(provider, code);

    // Get user
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create User instance to access methods
    const user = new User(userData);

    // Store OAuth token
    user.setStreamingOAuthToken(provider, tokenData);

    // Add service to user's streaming services list with proper mapping
    const providerMapping = {
      netflix: { 
        name: 'Netflix', 
        id: 8,
        logoPath: '/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg',
        logoUrl: 'https://image.tmdb.org/t/p/original/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg'
      },
      hulu: { 
        name: 'Hulu', 
        id: 15,
        logoPath: '/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg',
        logoUrl: 'https://image.tmdb.org/t/p/original/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg'
      },
      disney: { 
        name: 'Disney+', 
        id: 337,
        logoPath: '/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg',
        logoUrl: 'https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'
      },
      prime: { 
        name: 'Amazon Prime Video', 
        id: 9,
        logoPath: '/emthp39XA2YScoYL1p0sdbAH2WA.jpg',
        logoUrl: 'https://image.tmdb.org/t/p/original/emthp39XA2YScoYL1p0sdbAH2WA.jpg'
      },
      hbo: { 
        name: 'HBO Max', 
        id: 384,
        logoPath: '/aS2zvJWn9mwiCOeaaCkIh4wleZS.jpg',
        logoUrl: 'https://image.tmdb.org/t/p/original/aS2zvJWn9mwiCOeaaCkIh4wleZS.jpg'
      },
      appletv: { 
        name: 'Apple TV+', 
        id: 350,
        logoPath: '/6uhKBfmtzFqOcLousHwZuzcrScK.jpg',
        logoUrl: 'https://image.tmdb.org/t/p/original/6uhKBfmtzFqOcLousHwZuzcrScK.jpg'
      }
    };
    
    const serviceInfo = providerMapping[provider];
    if (serviceInfo) {
      user.addStreamingService(serviceInfo);
    }

    // Try to sync watch history
    try {
      const watchHistory = await streamingOAuthService.getWatchHistory(
        provider,
        tokenData.access_token
      );

      // Add watch history to user profile
      if (watchHistory && watchHistory.length > 0) {
        // Merge with existing watch history, avoiding duplicates
        const existingIds = new Set(user.watchHistory.map(item => item.id));
        const newHistory = watchHistory.filter(item => !existingIds.has(item.id));
        user.watchHistory.push(...newHistory);
      }
    } catch (historyError) {
      console.error('Error syncing watch history:', historyError);
      // Continue even if watch history sync fails
    }

    // Save user
    await dataStore.updateUser(userId, user);

    // Redirect to success page - update to redirect to streaming-services page
    res.redirect(`/streaming-services.html?userId=${encodeURIComponent(userId)}&connected=${encodeURIComponent(provider)}&success=true`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    const userId = req.query.userId || stateStore.get(state)?.userId;
    // Validate userId format before using in redirect
    const isValidUserId = userId && /^user_[0-9]+_[a-z0-9]+$/.test(userId);
    const safeUserId = isValidUserId ? encodeURIComponent(userId) : '';
    const redirectUrl = safeUserId ? `/streaming-services.html?userId=${safeUserId}` : '/profile';
    res.redirect(`${redirectUrl}?error=${encodeURIComponent('Failed to connect streaming platform')}`);
  }
});

/**
 * POST /api/auth/:provider/disconnect
 * Disconnect streaming platform
 * Rate limited to 10 requests per 15 minutes per user
 */
router.post('/:provider/disconnect', rateLimiters.auth, async (req, res) => {
  try {
    const { provider } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create User instance to access methods
    const user = new User(userData);

    // Get token before removing
    const token = user.getStreamingOAuthToken(provider);

    // Remove OAuth token
    user.removeStreamingOAuthToken(provider);

    // Try to revoke token on provider's side
    if (token && token.accessToken) {
      try {
        await streamingOAuthService.revokeToken(provider, token.accessToken);
      } catch (revokeError) {
        console.error('Error revoking token:', revokeError);
        // Continue even if revocation fails
      }
    }

    // Also remove from streaming services list
    const providerNames = {
      netflix: 'Netflix',
      hulu: 'Hulu',
      disney: 'Disney+',
      prime: 'Amazon Prime Video',
      hbo: 'HBO Max',
      appletv: 'Apple TV+'
    };
    
    user.removeStreamingService(null, providerNames[provider]);

    // Save user
    await dataStore.updateUser(userId, user);

    res.json({ 
      success: true, 
      message: `Successfully disconnected from ${providerNames[provider]}` 
    });
  } catch (error) {
    console.error('Error disconnecting streaming platform:', error);
    res.status(500).json({ error: 'Failed to disconnect streaming platform' });
  }
});

/**
 * POST /api/auth/:provider/refresh
 * Refresh OAuth access token
 * Rate limited to 10 requests per 15 minutes per user
 */
router.post('/:provider/refresh', rateLimiters.auth, async (req, res) => {
  try {
    const { provider } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create User instance to access methods
    const user = new User(userData);

    // Get existing token
    const token = user.getStreamingOAuthToken(provider);
    if (!token || !token.refreshToken) {
      return res.status(400).json({ error: 'No refresh token available' });
    }

    // Refresh token
    const newTokenData = await streamingOAuthService.refreshAccessToken(
      provider,
      token.refreshToken
    );

    // Update token
    user.setStreamingOAuthToken(provider, newTokenData);

    // Save user
    await dataStore.updateUser(userId, user);

    res.json({ 
      success: true, 
      message: 'Token refreshed successfully',
      expiresAt: user.getStreamingOAuthToken(provider).expiresAt
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * GET /api/auth/:provider/status
 * Check connection status for streaming platform
 * Rate limited to prevent status polling abuse
 */
router.get('/:provider/status', rateLimiters.api, async (req, res) => {
  try {
    const { provider } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create User instance to access methods
    const user = new User(userData);

    const connected = user.isStreamingProviderConnected(provider);
    const token = user.getStreamingOAuthToken(provider);

    res.json({
      provider,
      connected,
      connectedAt: token?.connectedAt || null,
      expiresAt: token?.expiresAt || null,
      expired: token ? user.isStreamingOAuthTokenExpired(provider) : null
    });
  } catch (error) {
    console.error('Error checking provider status:', error);
    res.status(500).json({ error: 'Failed to check provider status' });
  }
});

/**
 * GET /api/auth/providers/status
 * Get connection status for all providers for a specific user
 */
router.get('/providers/status', rateLimiters.api, async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create User instance to access methods
    const user = new User(userData);

    const enabledProviders = streamingOAuthService.getEnabledProviders();
    const providerInfo = {
      netflix: { name: 'Netflix', icon: '🎬', color: '#E50914' },
      hulu: { name: 'Hulu', icon: '🎭', color: '#1CE783' },
      disney: { name: 'Disney+', icon: '🏰', color: '#113CCF' },
      prime: { name: 'Amazon Prime Video', icon: '📦', color: '#00A8E1' },
      hbo: { name: 'HBO Max', icon: '👑', color: '#B300F0' },
      appletv: { name: 'Apple TV+', icon: '🍎', color: '#000000' }
    };

    const statuses = enabledProviders.map(provider => {
      const connected = user.isStreamingProviderConnected(provider);
      const token = user.getStreamingOAuthToken(provider);
      
      return {
        id: provider,
        ...providerInfo[provider],
        connected,
        connectedAt: token?.connectedAt || null,
        expiresAt: token?.expiresAt || null,
        expired: token ? user.isStreamingOAuthTokenExpired(provider) : null
      };
    });

    res.json({
      userId,
      providers: statuses,
      count: statuses.length
    });
  } catch (error) {
    console.error('Error getting provider statuses:', error);
    res.status(500).json({ error: 'Failed to get provider statuses' });
  }
});

/**
 * GET /api/auth/providers
 * Get list of available streaming providers
 */
router.get('/providers', (req, res) => {
  try {
    const enabledProviders = streamingOAuthService.getEnabledProviders();
    
    const providerInfo = {
      netflix: { name: 'Netflix', icon: '🎬', color: '#E50914' },
      hulu: { name: 'Hulu', icon: '🎭', color: '#1CE783' },
      disney: { name: 'Disney+', icon: '🏰', color: '#113CCF' },
      prime: { name: 'Amazon Prime Video', icon: '📦', color: '#00A8E1' },
      hbo: { name: 'HBO Max', icon: '👑', color: '#B300F0' },
      appletv: { name: 'Apple TV+', icon: '🍎', color: '#000000' }
    };

    const providers = enabledProviders.map(provider => ({
      id: provider,
      ...providerInfo[provider],
      enabled: true
    }));

    res.json({
      providers,
      count: providers.length
    });
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({ error: 'Failed to get providers' });
  }
});

/**
 * POST /api/auth/:provider/sync-history
 * Manually sync watch history from streaming platform
 * Rate limited to 10 requests per 15 minutes per user
 */
router.post('/:provider/sync-history', rateLimiters.auth, async (req, res) => {
  try {
    const { provider } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user
    const dataStore = await getDatabase();
    const userData = await dataStore.findUserById(userId);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create User instance to access methods
    const user = new User(userData);

    // Get OAuth token
    const token = user.getStreamingOAuthToken(provider);
    if (!token) {
      return res.status(400).json({ error: 'Streaming platform not connected' });
    }

    // Check if token is expired
    if (user.isStreamingOAuthTokenExpired(provider)) {
      return res.status(401).json({ error: 'Token expired. Please reconnect.' });
    }

    // Sync watch history
    const watchHistory = await streamingOAuthService.getWatchHistory(
      provider,
      token.accessToken
    );

    // Merge with existing watch history
    const existingIds = new Set(user.watchHistory.map(item => item.id));
    const newHistory = watchHistory.filter(item => !existingIds.has(item.id));
    user.watchHistory.push(...newHistory);

    // Save user
    await dataStore.updateUser(userId, user);

    res.json({
      success: true,
      message: 'Watch history synced successfully',
      newItems: newHistory.length,
      totalItems: user.watchHistory.length
    });
  } catch (error) {
    console.error('Error syncing watch history:', error);
    res.status(500).json({ error: 'Failed to sync watch history' });
  }
});

module.exports = router;
