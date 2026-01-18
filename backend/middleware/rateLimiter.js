/**
 * Rate limiting middleware to prevent abuse
 * Implements token bucket algorithm for rate limiting
 */

// Store for rate limit tracking (in production, use Redis)
const rateLimitStore = new Map();

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {string} options.message - Error message when rate limit exceeded
 * @returns {Function} Express middleware
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100, // 100 requests per window default
    message = 'Too many requests, please try again later.'
  } = options;

  return (req, res, next) => {
    // Get identifier (IP address or user ID from query/body)
    const identifier = req.query.userId || req.body?.userId || req.ip || req.connection.remoteAddress;
    
    if (!identifier) {
      return next();
    }

    const now = Date.now();
    const key = `${req.path}:${identifier}`;
    
    // Get or create rate limit entry
    let limitEntry = rateLimitStore.get(key);
    
    if (!limitEntry) {
      limitEntry = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, limitEntry);
    }
    
    // Reset if window has passed
    if (now > limitEntry.resetTime) {
      limitEntry.count = 0;
      limitEntry.resetTime = now + windowMs;
    }
    
    // Increment request count
    limitEntry.count++;
    
    // Check if limit exceeded
    if (limitEntry.count > maxRequests) {
      const retryAfter = Math.ceil((limitEntry.resetTime - now) / 1000);
      
      res.set('Retry-After', retryAfter.toString());
      res.set('X-RateLimit-Limit', maxRequests.toString());
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', limitEntry.resetTime.toString());
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter
      });
    }
    
    // Add rate limit headers
    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', (maxRequests - limitEntry.count).toString());
    res.set('X-RateLimit-Reset', limitEntry.resetTime.toString());
    
    next();
  };
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const expiredKeys = [];
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      expiredKeys.push(key);
    }
  }
  
  expiredKeys.forEach(key => rateLimitStore.delete(key));
}, 5 * 60 * 1000);

// Pre-configured rate limiters for common scenarios
const rateLimiters = {
  // Strict rate limit for authentication endpoints (10 requests per 15 minutes)
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: 'Too many authentication attempts, please try again later.'
  }),
  
  // Moderate rate limit for API endpoints (100 requests per 15 minutes)
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: 'Too many API requests, please slow down.'
  }),
  
  // Lenient rate limit for general endpoints (200 requests per 15 minutes)
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 200,
    message: 'Too many requests, please try again later.'
  })
};

module.exports = {
  createRateLimiter,
  rateLimiters
};
