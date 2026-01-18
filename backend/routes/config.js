// Configuration Routes
// Serves non-sensitive configuration to the frontend
const express = require('express');
const router = express.Router();
const config = require('../config/config');

/**
 * GET /api/config/auth0
 * Returns Auth0 configuration for frontend
 * Only returns public configuration values (domain, clientId, audience)
 * Never returns secrets like clientSecret
 */
router.get('/auth0', (req, res) => {
  try {
    // Only send public Auth0 configuration
    const auth0Config = {
      domain: config.auth0.domain || 'YOUR_AUTH0_DOMAIN.auth0.com',
      clientId: config.auth0.clientId || 'YOUR_AUTH0_CLIENT_ID',
      audience: config.auth0.audience || 'https://YOUR_AUTH0_DOMAIN.auth0.com/api/v2/',
      callbackUrl: config.auth0.callbackUrl,
      logoutUrl: config.auth0.logoutUrl
    };

    res.json(auth0Config);
  } catch (error) {
    console.error('Error fetching Auth0 config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

module.exports = router;
