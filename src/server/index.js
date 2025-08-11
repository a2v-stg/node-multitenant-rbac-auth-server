const modulealias = require('module-alias/register');
const express = require('express');
const { createContext, initContext } = require('./context');
const logger = require('./utils/logger');

// Initialize Sentry
const { initSentry, captureError, createTransaction } = require('./config/sentry');

let context;

async function initApp({ config = {}, logger: customLogger = logger, mongoose, models = {} }) {
  const transaction = createTransaction('admin-ui.initApp', 'app');
  
  try {
    console.log('🔧 Initializing Admin UI submodule...');
    console.log('🔍 Models:', models);
    
    // Create context with dependencies
    context = createContext({ config, logger: customLogger, mongoose, models });
    
    // Initialize the context globally
    initContext(context);
    
    console.log('✅ Admin UI submodule initialized');
    
    if (transaction) {
      transaction.setStatus('ok');
      transaction.finish();
    }
  } catch (error) {
    console.error('❌ Failed to initialize Admin UI submodule:', error);
    
    if (transaction) {
      transaction.setStatus('internal_error');
      transaction.finish();
    }
    
    captureError(error, { context: 'admin-ui.initApp', models: Object.keys(models) });
    throw error;
  }
}

function getRoutes() {
  if (!context) {
    throw new Error("Admin UI not initialized. Call initApp() first.");
  }
  
  const transaction = createTransaction('admin-ui.getRoutes', 'app');
  
  try {
    const router = express.Router();
    
    // Import routes with context
    const authRoutes = require('./routes/auth');
    const tenantRoutes = require('./routes/tenant');
    const userRoutes = require('./routes/user');
    const rbacRoutes = require('./routes/rbac');
    const blacklistRoutes = require('./routes/blacklist');
    //const coreRoutes = require('./routes/core');
    const settingsRoutes = require('./routes/settings');
    const testRoutes = require('./tests/unit/routes.test');
    
    // Apply rate limiting middleware BEFORE routes
    const { setupAllRateLimiting } = require('./middleware/setupRateLimit');
    setupAllRateLimiting(router);
    
    // Apply routes
    router.use('/auth', authRoutes);
    router.use('/api/auth', authRoutes); // Add auth routes to /api path as well
    router.use('/api', tenantRoutes); // This will make /api/current-tenant work
    router.use('/api/tenant', tenantRoutes);
    router.use('/api/users', userRoutes);
    router.use('/t/:tenantId/rbac', rbacRoutes);
    router.use('/api/rbac', rbacRoutes); // Add RBAC routes to /api path as well
    router.use('/api', blacklistRoutes);
    //router.use('/api/core', coreRoutes);
    router.use('/api/settings', settingsRoutes);
    
    // Add test routes for rate limiting verification
    router.use('/test', testRoutes);
    
    if (transaction) {
      transaction.setStatus('ok');
      transaction.finish();
    }
    
    return router;
  } catch (error) {
    if (transaction) {
      transaction.setStatus('internal_error');
      transaction.finish();
    }
    
    captureError(error, { context: 'admin-ui.getRoutes' });
    throw error;
  }
}

function getMiddleware() {
  if (!context) {
    throw new Error("Admin UI not initialized. Call initApp() first.");
  }
  
  const transaction = createTransaction('admin-ui.getMiddleware', 'app');
  
  try {
    const { ensureTenantSelected } = require('./middleware/tenantValidation');
    const { addUserPermissions } = require('./middleware/rbacMiddleware');
    const { errorHandler } = require('./middleware/errorHandler');
    
    // Import rate limiting middleware
    const { 
      generalLimiter, 
      authLimiter, 
      apiLimiter, 
      mfaLimiter, 
      adminLimiter,
      routeRateLimit 
    } = require('./middleware/rateLimit');
    
    if (transaction) {
      transaction.setStatus('ok');
      transaction.finish();
    }
    
    return {
      ensureTenantSelected,
      addUserPermissions,
      errorHandler,
      // Rate limiting middleware
      generalLimiter,
      authLimiter,
      apiLimiter,
      mfaLimiter,
      adminLimiter,
      routeRateLimit,
      // Route-specific rate limiting utilities
      routeRateLimitUtils: require('./middleware/routeRateLimit')
    };
  } catch (error) {
    if (transaction) {
      transaction.setStatus('internal_error');
      transaction.finish();
    }
    
    captureError(error, { context: 'admin-ui.getMiddleware' });
    throw error;
  }
}

function getPassport() {
  if (!context) {
    throw new Error("Admin UI not initialized. Call initApp() first.");
  }
  
  const transaction = createTransaction('admin-ui.getPassport', 'app');
  
  try {
    const passport = require('passport');
    const { setupPassport } = require('./config/passport');
    
    // Setup passport with context
    setupPassport(passport);
    
    if (transaction) {
      transaction.setStatus('ok');
      transaction.finish();
    }
    
    return passport;
  } catch (error) {
    if (transaction) {
      transaction.setStatus('internal_error');
      transaction.finish();
    }
    
    captureError(error, { context: 'admin-ui.getPassport' });
    throw error;
  }
}

module.exports = {
  initApp,
  getRoutes,
  getMiddleware,
  getPassport,
}; 