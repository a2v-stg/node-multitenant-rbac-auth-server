const path = require('path');
require('module-alias/register');

// Import server components
const authService = require('./server/services/authService');
const mfaService = require('./server/services/mfaService');
const rbacService = require('./server/services/rbacService');
const logger = require('./server/utils/logger');

// Import middleware
const authMiddleware = require('./server/middleware/authMiddleware');
const errorHandler = require('./server/middleware/errorHandler');
const rbacMiddleware = require('./server/middleware/rbacMiddleware');
const tenantValidation = require('./server/middleware/tenantValidation');
const validation = require('./server/middleware/validation');

// Import models
const User = require('./server/models/User');
const Role = require('./server/models/Role');
const UserRole = require('./server/models/UserRole');
const UserTenant = require('./server/models/UserTenant');
const Migration = require('./server/models/Migration');

// Import routes
const authRoutes = require('./server/routes/auth');
const tenantRoutes = require('./server/routes/tenant');
const userRoutes = require('./server/routes/user');
const rbacRoutes = require('./server/routes/rbac');
const blacklistRoutes = require('./server/routes/blacklist');

// Import client components (only paths and metadata)
const clientApp = path.join(__dirname, 'client/src/App.vue');
const clientRouter = path.join(__dirname, 'client/src/router');

// Export the admin-ui submodule
module.exports = {
  // Server services
  services: {
    auth: authService,
    mfa: mfaService,
    rbac: rbacService,
    logger
  },

  // Middleware
  middleware: {
    auth: authMiddleware,
    errorHandler,
    rbac: rbacMiddleware,
    tenantValidation,
    validation
  },

  // Models
  models: {
    User,
    Role,
    UserRole,
    UserTenant,
    Migration
  },

  // Routes
  routes: {
    auth: authRoutes,
    tenant: tenantRoutes,
    user: userRoutes,
    rbac: rbacRoutes,
    blacklist: blacklistRoutes
  },

  // Client components (paths only)
  client: {
    app: clientApp,
    router: clientRouter,
    components: {
      // Component paths (not the actual components)
      AppHeader: path.join(__dirname, 'client/src/components/AppHeader.vue'),
      AppLayout: path.join(__dirname, 'client/src/components/AppLayout.vue'),
      AppSidebar: path.join(__dirname, 'client/src/components/AppSidebar.vue'),
      BlacklistManagement: path.join(__dirname, 'client/src/components/BlacklistManagement.vue'),
      DataTable: path.join(__dirname, 'client/src/components/DataTable.vue'),
      MfaOptions: path.join(__dirname, 'client/src/components/MfaOptions.vue'),
      MfaSetup: path.join(__dirname, 'client/src/components/MfaSetup.vue'),
      OrganizationMfaSettings: path.join(__dirname, 'client/src/components/OrganizationMfaSettings.vue'),
      TotpSetup: path.join(__dirname, 'client/src/components/TotpSetup.vue'),
      UserSettings: path.join(__dirname, 'client/src/components/UserSettings.vue')
    }
  },

  // Path utilities
  paths: {
    root: __dirname,
    server: path.join(__dirname, 'server'),
    client: path.join(__dirname, 'client'),
    views: path.join(__dirname, 'server/views'),
    public: path.join(__dirname, 'public')
  },

  // Configuration
  config: {
    name: 'admin-ui-submodule',
    version: '1.0.0'
  }
}; 