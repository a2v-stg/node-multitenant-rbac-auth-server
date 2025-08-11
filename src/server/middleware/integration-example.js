// Rate Limiting Integration Example
// This file shows how to integrate rate limiting into your existing application

const { setupAllRateLimiting } = require('./setupRateLimit');
const { routeRateLimit } = require('./routeRateLimit');

/**
 * Example 1: Basic Integration
 * Apply comprehensive rate limiting to your Express app
 */
function basicIntegration(app) {
  // This will apply rate limiting to all routes
  setupAllRateLimiting(app);
  
  console.log('✅ Basic rate limiting integration complete');
}

/**
 * Example 2: Selective Integration
 * Apply rate limiting only to specific areas
 */
function selectiveIntegration(app) {
  // Apply general rate limiting
  app.use(require('./rateLimit').generalLimiter);
  
  // Apply to authentication routes only
  app.use('/auth', routeRateLimit.auth);
  app.use('/api/auth', routeRateLimit.auth);
  
  // Apply to API routes only
  app.use('/api', routeRateLimit.api);
  
  // Apply to admin routes only
  app.use('/admin', routeRateLimit.admin);
  app.use('/api/rbac', routeRateLimit.admin);
  
  console.log('✅ Selective rate limiting integration complete');
}

/**
 * Example 3: Route-by-Route Integration
 * Apply different rate limits to different routes
 */
function routeByRouteIntegration(app) {
  // Authentication routes - strict limits
  app.use('/auth/login', routeRateLimit.auth);
  app.use('/auth/register', routeRateLimit.auth);
  app.use('/auth/forgot-password', routeRateLimit.auth);
  
  // MFA routes - very strict limits
  app.use('/mfa/setup', routeRateLimit.mfa);
  app.use('/mfa/verify', routeRateLimit.mfa);
  app.use('/totp/setup', routeRateLimit.mfa);
  app.use('/totp/verify', routeRateLimit.mfa);
  
  // User management - moderate limits
  app.use('/api/users', routeRateLimit.api);
  app.use('/api/tenant', routeRateLimit.api);
  
  // Admin operations - strict limits
  app.use('/api/rbac', routeRateLimit.admin);
  app.use('/api/settings', routeRateLimit.admin);
  app.use('/api/blacklist', routeRateLimit.admin);
  
  // File operations - upload limits
  // app.use('/api/upload', routeRateLimit.upload);
  // app.use('/api/documents', routeRateLimit.upload);
  
  console.log('✅ Route-by-route rate limiting integration complete');
}

/**
 * Example 4: Role-Based Integration
 * Apply different limits based on user roles
 */
function roleBasedIntegration(app) {
  // Apply role-based rate limiting to protected routes
  app.use('/api/admin', routeRateLimit.roleBased('admin'));
  app.use('/api/tenant-admin', routeRateLimit.roleBased('tenantadmin'));
  app.use('/api/user', routeRateLimit.roleBased('user'));
  
  console.log('✅ Role-based rate limiting integration complete');
}

/**
 * Example 5: Custom Integration
 * Create custom rate limiting for specific needs
 */
function customIntegration(app) {
  const rateLimit = require('express-rate-limit');
  
  // Custom rate limiter for health checks
  const healthCheckLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 health checks per minute
    message: 'Too many health check requests',
    standardHeaders: true,
    legacyHeaders: false
  });
  
  // Custom rate limiter for reporting
  const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 reports per hour
    message: 'Too many report requests',
    standardHeaders: true,
    legacyHeaders: false
  });
  
  app.use('/health', healthCheckLimiter);
  app.use('/api/reports', reportLimiter);
  
  console.log('✅ Custom rate limiting integration complete');
}

/**
 * Example 6: Environment-Aware Integration
 * Apply different limits based on environment
 */
function environmentAwareIntegration(app) {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    // Stricter limits in production
    setupAllRateLimiting(app);
    console.log('✅ Production rate limiting configured');
  } else if (env === 'staging') {
    // Moderate limits in staging
    selectiveIntegration(app);
    console.log('✅ Staging rate limiting configured');
  } else {
    // More lenient limits in development
    basicIntegration(app);
    console.log('✅ Development rate limiting configured');
  }
}

/**
 * Example 7: Integration with Existing Middleware
 * Show how to integrate with your existing middleware chain
 */
function existingMiddlewareIntegration(app) {
  // Your existing middleware
  app.use(require('cors')());
  app.use(require('express').json());
  app.use(require('express').urlencoded({ extended: true }));
  
  // Apply rate limiting early in the chain
  setupAllRateLimiting(app);
  
  // Your existing routes and other middleware
  // app.use('/api', apiRoutes);
  // app.use('/auth', authRoutes);
  
  console.log('✅ Existing middleware integration complete');
}

/**
 * Example 8: Testing Integration
 * Show how to test rate limiting
 */
function testingIntegration(app) {
  // Apply rate limiting
  setupAllRateLimiting(app);
  
  // Add test routes to verify rate limiting
  app.get('/test/rate-limit', (req, res) => {
    res.json({ 
      message: 'Rate limit test endpoint',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  });
  
  // Add a route to check current rate limit status
  app.get('/test/rate-limit/status', (req, res) => {
    if (req.rateLimit) {
      res.json({
        remaining: req.rateLimit.remaining,
        limit: req.rateLimit.limit,
        resetTime: req.rateLimit.resetTime,
        retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
      });
    } else {
      res.json({ message: 'No rate limit information available' });
    }
  });
  
  console.log('✅ Testing integration complete');
}

// Export all integration examples
module.exports = {
  basicIntegration,
  selectiveIntegration,
  routeByRouteIntegration,
  roleBasedIntegration,
  customIntegration,
  environmentAwareIntegration,
  existingMiddlewareIntegration,
  testingIntegration
}; 