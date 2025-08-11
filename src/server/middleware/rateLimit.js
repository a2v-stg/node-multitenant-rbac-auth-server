const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const config = require('../config/rateLimit');

// Get environment-specific settings
const env = process.env.NODE_ENV || 'development';
const envConfig = config.environment[env] || {};

// General rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: config.general.windowMs,
  max: envConfig.general?.max || config.general.max,
  message: {
    error: config.general.message,
    retryAfter: config.general.retryAfter
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: config.trustProxy,
  skip: (req) => {
    // Skip rate limiting for certain IPs
    const clientIP = req.ip || req.connection.remoteAddress;
    if (config.skipIPs.includes(clientIP)) return true;
    
    // Skip rate limiting for certain user agents
    const userAgent = req.get('User-Agent');
    if (userAgent && config.skipUserAgents.some(agent => userAgent.includes(agent))) return true;
    
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: config.general.message,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: req.rateLimit.resetTime
    });
  }
});

// Stricter rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: config.auth.windowMs,
  max: envConfig.auth?.max || config.auth.max,
  message: {
    error: config.auth.message,
    retryAfter: config.auth.retryAfter
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: config.trustProxy,
  skip: (req) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (config.skipIPs.includes(clientIP)) return true;
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: config.auth.message,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: req.rateLimit.resetTime
    });
  }
});

// Rate limiter for API endpoints that perform database operations
const apiLimiter = rateLimit({
  windowMs: config.api.windowMs,
  max: envConfig.api?.max || config.api.max,
  message: {
    error: config.api.message,
    retryAfter: config.api.retryAfter
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: config.trustProxy,
  skip: (req) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (config.skipIPs.includes(clientIP)) return true;
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: config.api.message,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: req.rateLimit.resetTime
    });
  }
});

// Rate limiter for file uploads and heavy operations
const uploadLimiter = rateLimit({
  windowMs: config.upload.windowMs,
  max: config.upload.max,
  message: {
    error: config.upload.message,
    retryAfter: config.upload.retryAfter
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: config.trustProxy,
  skip: (req) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (config.skipIPs.includes(clientIP)) return true;
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: config.upload.message,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: req.rateLimit.resetTime
    });
  }
});

// Speed limiter to slow down requests after a certain threshold
const speedLimiter = slowDown({
  windowMs: config.speedLimit.windowMs,
  delayAfter: config.speedLimit.delayAfter,
  delayMs: config.speedLimit.delayMs,
  maxDelayMs: config.speedLimit.maxDelayMs,
  skipSuccessfulRequests: false, // delay successful requests too
  skipFailedRequests: false, // delay failed requests too
  keyGenerator: (req) => {
    // Use IP address as key, but you can customize this
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
  }
});

// Rate limiter for MFA operations
const mfaLimiter = rateLimit({
  windowMs: config.mfa.windowMs,
  max: config.mfa.max,
  message: {
    error: config.mfa.message,
    retryAfter: config.mfa.retryAfter
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: config.trustProxy,
  skip: (req) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (config.skipIPs.includes(clientIP)) return true;
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: config.mfa.message,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: req.rateLimit.resetTime
    });
  }
});

// Rate limiter for admin operations
const adminLimiter = rateLimit({
  windowMs: config.admin.windowMs,
  max: config.admin.max,
  message: {
    error: config.admin.message,
    retryAfter: config.admin.retryAfter
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: config.trustProxy,
  skip: (req) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (config.skipIPs.includes(clientIP)) return true;
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: config.admin.message,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: req.rateLimit.resetTime
    });
  }
});

// Dynamic rate limiter based on user role
const dynamicLimiter = (role) => {
  const limits = config.roleBased;
  
  return rateLimit({
    windowMs: config.general.windowMs,
    max: limits[role] || limits.default,
    message: {
      error: `Rate limit exceeded for role: ${role}`,
      retryAfter: config.general.retryAfter
    },
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: config.trustProxy,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip || req.connection.remoteAddress;
    },
    skip: (req) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      if (config.skipIPs.includes(clientIP)) return true;
      return false;
    },
    handler: (req, res) => {
      res.status(429).json({
        error: `Rate limit exceeded for role: ${role}`,
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
        limit: req.rateLimit.limit,
        remaining: req.rateLimit.remaining,
        resetTime: req.rateLimit.resetTime
      });
    }
  });
};

// Middleware to apply rate limiting based on route type
const applyRateLimiting = (req, res, next) => {
  // Apply general limiter first
  generalLimiter(req, res, (err) => {
    if (err) return next(err);
    
    // Apply speed limiter
    speedLimiter(req, res, next);
  });
};

// Export all limiters for specific use cases
module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  mfaLimiter,
  adminLimiter,
  dynamicLimiter,
  speedLimiter,
  applyRateLimiting
}; 