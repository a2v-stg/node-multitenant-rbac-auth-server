const modulealias = require('module-alias/register');
const express = require('express');
const { createContext, initContext } = require('./context');
const logger = require('./utils/logger');

let context;

async function initApp({ config = {}, logger: customLogger = logger, mongoose, models = {} }) {
  console.log('🔧 Initializing Admin UI submodule...');
  console.log('🔍 Models:', models);
  
  // Create context with dependencies
  context = createContext({ config, logger: customLogger, mongoose, models });
  
  // Initialize the context globally
  initContext(context);
  
  console.log('✅ Admin UI submodule initialized');
}

function getRoutes() {
  if (!context) {
    throw new Error("Admin UI not initialized. Call initApp() first.");
  }
  
  const router = express.Router();
  
  // Import routes with context
  const authRoutes = require('./routes/auth');
  const tenantRoutes = require('./routes/tenant');
  const userRoutes = require('./routes/user');
  const rbacRoutes = require('./routes/rbac');
  const blacklistRoutes = require('./routes/blacklist');
  //const coreRoutes = require('./routes/core');
  const settingsRoutes = require('./routes/settings');
  
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
  
  return router;
}

function getMiddleware() {
  if (!context) {
    throw new Error("Admin UI not initialized. Call initApp() first.");
  }
  
  const { ensureTenantSelected } = require('./middleware/tenantValidation');
  const { addUserPermissions } = require('./middleware/rbacMiddleware');
  const { errorHandler } = require('./middleware/errorHandler');
  
  return {
    ensureTenantSelected,
    addUserPermissions,
    errorHandler
  };
}

function getPassport() {
  if (!context) {
    throw new Error("Admin UI not initialized. Call initApp() first.");
  }
  
  const passport = require('passport');
  const { setupPassport } = require('./config/passport');
  
  // Setup passport with context
  setupPassport(passport);
  
  return passport;
}

module.exports = {
  initApp,
  getRoutes,
  getMiddleware,
  getPassport,
}; 