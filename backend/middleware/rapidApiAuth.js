/**
 * Middleware for RapidAPI key authorization
 * Validates X-RapidAPI-Key header against configured API keys
 */

const config = require('../config/config');
const crypto = require('crypto');

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings are equal
 */
function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  // Convert to buffers for constant-time comparison
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  // Use crypto.timingSafeEqual for constant-time comparison
  // Returns true only if buffers are equal length and content
  try {
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  } catch (e) {
    // Lengths don't match, return false
    return false;
  }
}

/**
 * Middleware to validate RapidAPI key in request headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateRapidApiKey = (req, res, next) => {
  // Skip authentication if RapidAPI is not configured
  if (!config.rapidapi || !config.rapidapi.enabled) {
    return next();
  }

  // Get the API key from request headers
  const apiKey = req.headers['x-rapidapi-key'];
  const apiHost = req.headers['x-rapidapi-host'];

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'X-RapidAPI-Key header is required'
    });
  }

  // Validate the API key against configured keys using constant-time comparison
  const validKeys = config.rapidapi.apiKeys || [];
  
  const isValid = validKeys.some(validKey => constantTimeCompare(apiKey, validKey));
  
  if (!isValid) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }

  // Optionally validate host header if configured
  if (config.rapidapi.validateHost && apiHost !== config.rapidapi.expectedHost) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API host'
    });
  }

  // API key is valid, proceed to the next middleware
  next();
};

/**
 * Middleware to add RapidAPI headers to outgoing API requests
 * This is useful when the app itself needs to call RapidAPI services
 * @param {Object} headers - Existing headers object
 * @returns {Object} Headers with RapidAPI credentials added
 */
const addRapidApiHeaders = (headers = {}) => {
  if (!config.rapidapi || !config.rapidapi.clientKey) {
    return headers;
  }

  return {
    ...headers,
    'X-RapidAPI-Key': config.rapidapi.clientKey,
    'X-RapidAPI-Host': config.rapidapi.clientHost
  };
};

module.exports = {
  validateRapidApiKey,
  addRapidApiHeaders
};
