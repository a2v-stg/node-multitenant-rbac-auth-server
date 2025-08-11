const {
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  mfaLimiter,
  adminLimiter,
  dynamicLimiter,
  speedLimiter
} = require('./rateLimit');

// Route-specific rate limiting middleware
const routeRateLimit = {
  // Apply to authentication routes
  auth: (req, res, next) => {
    authLimiter(req, res, next);
  },

  // Apply to API routes that perform database operations
  api: (req, res, next) => {
    apiLimiter(req, res, next);
  },

  // Apply to file upload routes
  upload: (req, res, next) => {
    uploadLimiter(req, res, next);
  },

  // Apply to MFA routes
  mfa: (req, res, next) => {
    mfaLimiter(req, res, next);
  },

  // Apply to admin operation routes
  admin: (req, res, next) => {
    adminLimiter(req, res, next);
  },

  // Apply role-based rate limiting
  roleBased: (role) => {
    return (req, res, next) => {
      const limiter = dynamicLimiter(role);
      limiter(req, res, next);
    };
  },

  // Apply to all routes with general limiting
  general: (req, res, next) => {
    generalLimiter(req, res, next);
  },

  // Apply speed limiting
  speed: (req, res, next) => {
    speedLimiter(req, res, next);
  },

  // Apply multiple limiters in sequence
  combined: (limiters) => {
    return (req, res, next) => {
      let index = 0;

      const applyNext = () => {
        if (index >= limiters.length) {
          return next();
        }

        const limiter = limiters[index];
        index++;

        if (typeof limiter === 'function') {
          limiter(req, res, applyNext);
        } else if (typeof limiter === 'string') {
          // Apply predefined limiter by name
          const predefinedLimiter = routeRateLimit[limiter];
          if (predefinedLimiter) {
            predefinedLimiter(req, res, applyNext);
          } else {
            applyNext();
          }
        } else {
          applyNext();
        }
      };

      applyNext();
    };
  },

  // Apply rate limiting based on route path
  byPath: (req, res, next) => {
    const path = req.path;

    // Authentication routes
    if (path.startsWith('/auth') || path.startsWith('/api/auth')) {
      return authLimiter(req, res, next);
    }

    // MFA routes
    if (path.includes('/mfa') || path.includes('/totp')) {
      return mfaLimiter(req, res, next);
    }

    // File upload routes
    if (path.includes('/upload') || path.includes('/file')) {
      return uploadLimiter(req, res, next);
    }

    // Admin routes
    if (path.startsWith('/admin') || path.includes('/rbac') || path.includes('/settings')) {
      return adminLimiter(req, res, next);
    }

    // API routes
    if (path.startsWith('/api')) {
      return apiLimiter(req, res, next);
    }

    // Default to general limiting
    return generalLimiter(req, res, next);
  },

  // Apply rate limiting based on HTTP method
  byMethod: (req, res, next) => {
    const method = req.method;

    // Stricter limits for destructive operations
    if (method === 'DELETE') {
      const strictLimiter = require('express-rate-limit')({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // 10 delete operations per 15 minutes
        message: 'Too many delete operations from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false
      });
      return strictLimiter(req, res, next);
    }

    // Moderate limits for write operations
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      const writeLimiter = require('express-rate-limit')({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 30, // 30 write operations per 15 minutes
        message: 'Too many write operations from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false
      });
      return writeLimiter(req, res, next);
    }

    // Default to general limiting for GET requests
    return generalLimiter(req, res, next);
  },

  // Apply rate limiting based on user authentication status
  byAuthStatus: (req, res, next) => {
    if (req.isAuthenticated()) {
      // Authenticated users get higher limits
      const authUserLimiter = require('express-rate-limit')({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200, // 200 requests per 15 minutes for authenticated users
        message: 'Rate limit exceeded for authenticated user',
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.user?.id || req.ip
      });
      return authUserLimiter(req, res, next);
    } else {
      // Unauthenticated users get stricter limits
      const unauthUserLimiter = require('express-rate-limit')({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50, // 50 requests per 15 minutes for unauthenticated users
        message: 'Rate limit exceeded for unauthenticated user',
        standardHeaders: true,
        legacyHeaders: false
      });
      return unauthUserLimiter(req, res, next);
    }
  }
};

module.exports = routeRateLimit;
