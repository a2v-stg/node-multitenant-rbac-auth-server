const {
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  mfaLimiter,
  adminLimiter,
  speedLimiter
} = require('./rateLimit');

const routeRateLimit = require('./routeRateLimit');

/**
 * Setup comprehensive rate limiting for the application
 * This middleware should be applied early in the middleware chain
 */
const setupRateLimit = (app) => {
  // Trust proxy for accurate IP detection (important for rate limiting)
  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }

  // Apply general rate limiting to all routes
  app.use(generalLimiter);

  // Apply speed limiting to all routes
  app.use(speedLimiter);

  // Apply specific rate limiting to different route groups
  app.use('/auth', authLimiter);
  app.use('/api/auth', authLimiter);

  app.use('/api', apiLimiter);

  // Apply stricter rate limiting to sensitive routes
  app.use('/api/users', apiLimiter);
  app.use('/api/tenant', apiLimiter);
  app.use('/api/rbac', apiLimiter);
  app.use('/api/settings', apiLimiter);
  app.use('/api/blacklist', apiLimiter);

  // Apply admin rate limiting
  app.use('/t/:tenantId/rbac', adminLimiter);

  // Apply MFA rate limiting
  app.use('/mfa', mfaLimiter);
  app.use('/totp', mfaLimiter);

  // Apply upload rate limiting (if you have file upload routes)
  // app.use('/upload', uploadLimiter);
  // app.use('/api/upload', uploadLimiter);

  console.log('✅ Rate limiting middleware configured successfully');
};

/**
 * Setup rate limiting for specific routes with custom configurations
 */
const setupRouteSpecificRateLimit = (app) => {
  // Example: Apply different rate limits to different API versions
  app.use('/api/v1', apiLimiter);
  app.use('/api/v2', apiLimiter);

  // Example: Apply stricter rate limiting to admin routes
  app.use('/admin', adminLimiter);

  // Example: Apply role-based rate limiting
  // app.use('/api/admin', routeRateLimit.roleBased('admin'));
  // app.use('/api/tenant', routeRateLimit.roleBased('tenantadmin'));

  console.log('✅ Route-specific rate limiting configured successfully');
};

/**
 * Setup rate limiting for development vs production
 */
const setupEnvironmentSpecificRateLimit = (app) => {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    // Stricter rate limiting in production
    app.use('/api', require('express-rate-limit')({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 30, // 30 requests per 15 minutes
      message: 'Production rate limit exceeded',
      standardHeaders: true,
      legacyHeaders: false
    }));

    console.log('✅ Production rate limiting configured');
  } else if (env === 'staging') {
    // Moderate rate limiting in staging
    app.use('/api', require('express-rate-limit')({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per 15 minutes
      message: 'Staging rate limit exceeded',
      standardHeaders: true,
      legacyHeaders: false
    }));

    console.log('✅ Staging rate limiting configured');
  } else {
    // More lenient rate limiting in development
    app.use('/api', require('express-rate-limit')({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // 500 requests per 15 minutes
      message: 'Development rate limit exceeded',
      standardHeaders: true,
      legacyHeaders: false
    }));

    console.log('✅ Development rate limiting configured');
  }
};

/**
 * Setup rate limiting with monitoring and logging
 */
const setupRateLimitWithMonitoring = (app) => {
  // Add rate limit monitoring middleware
  app.use((req, res, next) => {
    // Log rate limit information
    if (req.rateLimit) {
      const remaining = req.rateLimit.remaining;
      const limit = req.rateLimit.limit;
      const resetTime = req.rateLimit.resetTime;

      // Log when rate limit is getting low
      if (remaining < limit * 0.2) { // Less than 20% remaining
        console.warn(`Rate limit warning for IP ${req.ip}: ${remaining}/${limit} requests remaining`);
      }

      // Add rate limit headers for debugging
      res.set('X-RateLimit-Remaining', remaining);
      res.set('X-RateLimit-Limit', limit);
      res.set('X-RateLimit-Reset', resetTime);
    }

    next();
  });

  console.log('✅ Rate limiting monitoring configured');
};

/**
 * Main function to setup all rate limiting
 */
const setupAllRateLimiting = (app) => {
  try {
    // Setup basic rate limiting
    setupRateLimit(app);

    // Setup environment-specific rate limiting
    setupEnvironmentSpecificRateLimit(app);

    // Setup route-specific rate limiting
    setupRouteSpecificRateLimit(app);

    // Setup monitoring
    setupRateLimitWithMonitoring(app);

    console.log('✅ All rate limiting configured successfully');
  } catch (error) {
    console.error('❌ Failed to setup rate limiting:', error);
    throw error;
  }
};

module.exports = {
  setupRateLimit,
  setupRouteSpecificRateLimit,
  setupEnvironmentSpecificRateLimit,
  setupRateLimitWithMonitoring,
  setupAllRateLimiting
};
