const express = require('express');
const { getContext } = require('../context');

const router = express.Router();

router.get('/login', (req, res) => res.render('login'));

router.post('/login', async (req, res, next) => {
  const context = getContext();
  const logger = context.getLogger();
  const passport = require('passport');

  // Import middleware with context
  const { validateLogin, sanitizeInput } = require('../middleware/validation');

  // Apply middleware
  sanitizeInput(req, res, () => {
    // Apply validation middleware
    const validationChain = validateLogin;
    validationChain[validationChain.length - 1] = (req, res, next) => {
      const errors = require('express-validator').validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }
      next();
    };

    // Execute validation chain
    let currentIndex = 0;
    const executeValidation = () => {
      if (currentIndex < validationChain.length - 1) {
        validationChain[currentIndex](req, res, () => {
          currentIndex++;
          executeValidation();
        });
      } else {
        validationChain[currentIndex](req, res, () => {
          passport.authenticate('local', (err, user, info) => {
            if (err) {
              logger.error('Passport authentication error:', err);
              return res.status(500).json({ error: 'Authentication failed' });
            }

            if (!user) {
              return res.status(401).json({ error: 'Invalid credentials' });
            }

            req.logIn(user, async err => {
              if (err) {
                logger.error('Login error:', err);
                return res.status(500).json({ error: 'Login failed' });
              }

              logger.auth('Login successful, user:', user.email);
              logger.auth('Session ID:', req.sessionID);
              logger.auth('Session authenticated:', req.isAuthenticated());
              logger.auth('Session user:', req.user?.email);
              logger.auth('Session passport user:', req.session.passport?.user);

              try {
                const authService = require('../services/authService');
                const result = await authService.handleUserLogin(user);
                logger.auth('Auth service result:', result);

                if (result.type === 'mfa_setup_required') {
                  // Store user info in session for MFA setup
                  req.session.mfaSetupUser = {
                    id: user._id,
                    email: user.email
                    // tenantId: result.tenant.tenantId
                  };
                  logger.mfa('Returning MFA setup redirect');
                  res.json({ redirectUrl: 'http://localhost:3001/mfa-setup' });
                } else if (result.type === 'mfa_required') {
                  // Store user info in session for MFA verification
                  req.session.mfaUser = {
                    id: user._id,
                    email: user.email,
                    mfaMethod: user.mfaMethod
                  };
                  logger.mfa('Returning MFA verification redirect');
                  res.json({ redirectUrl: 'http://localhost:3001/mfa?mfa=true' });
                } else if (result.type === 'single') {
                  // Set tenant in session for single tenant users
                  req.session.tenantId = result.tenant.tenantId;
                  logger.auth('Setting tenant in session:', result.tenant.tenantId);
                  logger.auth('Returning dashboard redirect');
                  res.json({ redirectUrl: result.redirectUrl });
                } else if (result.type === 'multiple_tenants') {
                  logger.auth('Returning tenant selection redirect');
                  res.json({ redirectUrl: 'http://localhost:3001/tenant-selection' });
                } else {
                  logger.auth('Unknown result type, returning dashboard redirect');
                  res.json({ redirectUrl: 'http://localhost:3001/dashboard' });
                }
              } catch (error) {
                logger.error('Error in login handler:', error);
                res.status(500).json({ error: 'Login processing failed' });
              }
            });
          })(req, res, next);
        });
      }
    };

    executeValidation();
  });
});

// MFA setup endpoint for first-time users
router.post('/mfa/setup', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const context = getContext();
    const logger = context.getLogger();
    const { method, phoneNumber, countryCode } = req.body;
    const mfaSetupUser = req.session.mfaSetupUser;

    if (!mfaSetupUser) {
      return res.status(400).json({ error: 'No MFA setup session found' });
    }

    if (!method) {
      return res.status(400).json({ error: 'MFA method is required' });
    }

    // Update user with MFA configuration
    const mfaService = require('../services/mfaService');
    const result = await mfaService.setupMFA(mfaSetupUser.id, method, phoneNumber, countryCode);

    if (result.success) {
      // Clear MFA setup session
      delete req.session.mfaSetupUser;
      res.json({ message: 'MFA setup completed successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    const context = getContext();
    const logger = context.getLogger();
    logger.error('MFA setup error:', error);
    res.status(500).json({ error: 'MFA setup failed' });
  }
});

// User MFA enable endpoint
router.post('/mfa/enable', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const context = getContext();
    const logger = context.getLogger();
    const { method, phoneNumber, countryCode } = req.body;

    if (!method) {
      return res.status(400).json({ error: 'MFA method is required' });
    }

    const authService = require('../services/authService');
    const mfaService = require('../services/mfaService');

    // Setup MFA for the user
    if (method === 'sms' && phoneNumber) {
      // Update user's phone number first
      await authService.updateUserPhoneNumber(req.user._id, phoneNumber, countryCode || '+1');
    }

    // Setup MFA
    const user = await authService.setupMfaForUser(req.user._id, method);

    logger.mfa('MFA enabled for user:', req.user.email, 'Method:', method);
    res.json({
      success: true,
      message: 'MFA enabled successfully',
      user: {
        mfaMethod: user.mfaMethod,
        mfaSetupCompleted: user.mfaSetupCompleted,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode
      }
    });
  } catch (error) {
    const context = getContext();
    const logger = context.getLogger();
    logger.error('MFA enable error:', error);
    res.status(500).json({ error: 'Failed to enable MFA' });
  }
});

// User MFA disable endpoint
router.post('/mfa/disable', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const context = getContext();
    const logger = context.getLogger();
    const { User } = context.getModels();

    // Find and update user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Disable MFA
    user.mfaSetupCompleted = false;
    user.mfaMethod = null;
    user.totpSecret = null;
    user.phoneNumber = null;
    user.countryCode = null;
    await user.save();

    logger.mfa('MFA disabled for user:', req.user.email);
    res.json({
      success: true,
      message: 'MFA disabled successfully',
      user: {
        mfaMethod: user.mfaMethod,
        mfaSetupCompleted: user.mfaSetupCompleted
      }
    });
  } catch (error) {
    const context = getContext();
    const logger = context.getLogger();
    logger.error('MFA disable error:', error);
    res.status(500).json({ error: 'Failed to disable MFA' });
  }
});

// OAuth2 login
router.get('/oauth', (req, res, next) => {
  const passport = require('passport');
  passport.authenticate('oauth2')(req, res, next);
});

// OAuth2 callback
router.get(
  '/callback',
  (req, res, next) => {
    const passport = require('passport');
    passport.authenticate('oauth2', {
      failureRedirect: 'http://localhost:3001/login'
    })(req, res, next);
  },
  async (req, res) => {
    try {
      const context = getContext();
      const logger = context.getLogger();
      const authService = require('../services/authService');

      const result = await authService.handleUserLogin(req.user);
      logger.auth('OAuth callback result:', result);

      if (result.type === 'mfa_setup_required') {
        // Store user info in session for MFA setup
        req.session.mfaSetupUser = {
          id: req.user._id,
          email: req.user.email,
          tenantId: result.tenant.tenantId
        };
        logger.mfa('Redirecting to MFA setup');
        res.redirect('http://localhost:3001/mfa-setup');
      } else if (result.type === 'mfa_required') {
        // Store user info in session for MFA verification
        req.session.mfaUser = {
          id: req.user._id,
          email: req.user.email,
          mfaMethod: req.user.mfaMethod
        };
        logger.mfa('Redirecting to MFA');
        res.redirect('http://localhost:3001/mfa?mfa=true');
      } else if (result.type === 'single') {
        req.session.tenantId = result.tenant.tenantId;
        logger.auth('Redirecting to dashboard');
        res.redirect('http://localhost:3001/dashboard');
      } else if (result.type === 'multiple_tenants') {
        logger.auth('Redirecting to tenant selection');
        res.redirect('http://localhost:3001/tenant-selection');
      } else {
        logger.auth('Unknown result type, redirecting to dashboard');
        res.redirect('http://localhost:3001/dashboard');
      }
    } catch (error) {
      const context = getContext();
      const logger = context.getLogger();
      logger.authError('OAuth callback error:', error);
      return res.status(500).send('Internal server error');
    }
  }
);

// MFA Routes
router.post('/mfa-send-verification', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const mfaService = require('../services/mfaService');

  try {
    const { username, mode } = req.body;

    logger.mfa('MFA verification requested:', { username, mode });

    let result;

    switch (mode) {
    case 'sms':
      if (req.user.phoneNumber) {
        result = await mfaService.sendSmsVerification(
          req.user.phoneNumber,
          req.user.countryCode || '+1'
        );
      } else {
        return res
          .status(400)
          .json({ error: 'Phone number not configured for user' });
      }
      break;

    case 'voice':
      if (req.user.phoneNumber) {
        result = await mfaService.sendVoiceVerification(
          req.user.phoneNumber,
          req.user.countryCode || '+1'
        );
      } else {
        return res
          .status(400)
          .json({ error: 'Phone number not configured for user' });
      }
      break;

    case 'email':
      if (req.user.email) {
        result = await mfaService.sendEmailVerification(req.user.email);
      } else {
        return res
          .status(400)
          .json({ error: 'Email not configured for user' });
      }
      break;

    default:
      return res.status(400).json({ error: 'Invalid verification mode' });
    }

    res.status(200).json(result);
  } catch (error) {
    logger.mfaError('MFA verification error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/mfa-verify-token', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const mfaService = require('../services/mfaService');

  try {
    const { token, mode } = req.body;

    logger.mfa('MFA token validation:', { token, mode });

    let result;

    switch (mode) {
    case 'sms':
    case 'voice':
      if (req.user.phoneNumber) {
        result = await mfaService.verifyTwilioToken(
          req.user.phoneNumber,
          token,
          req.user.countryCode || '+1'
        );
      } else {
        return res
          .status(400)
          .json({ error: 'Phone number not configured for user' });
      }
      break;

    case 'email':
      if (req.user.email) {
        result = await mfaService.verifyEmailToken(req.user.email, token);
      } else {
        return res
          .status(400)
          .json({ error: 'Email not configured for user' });
      }
      break;

    case 'totp':
      if (req.user.totpSecret) {
        result = {
          success: mfaService.verifyTotpToken(req.user.totpSecret, token)
        };
      } else {
        return res
          .status(400)
          .json({ error: 'TOTP secret not configured for user' });
      }
      break;

    default:
      return res.status(400).json({ error: 'Invalid verification mode' });
    }

    res.status(200).json({ validated: result.success });
  } catch (error) {
    logger.mfaError('MFA token validation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/mfa-push-status', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const mfaService = require('../services/mfaService');

  try {
    const uuid = req.session.pushAuthUuid;

    if (!uuid) {
      return res
        .status(400)
        .json({ error: 'No push authentication session found' });
    }

    const result = await mfaService.checkPushStatus(uuid);

    if (result.approved) {
      // Clear the UUID after successful approval
      delete req.session.pushAuthUuid;
    }

    res.status(200).json(result);
  } catch (error) {
    logger.mfaError('MFA push status error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// TOTP setup routes
router.post('/mfa-setup-totp', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const mfaService = require('../services/mfaService');

  try {
    const secret = mfaService.generateTotpSecret(req.user.email);
    const qrCode = await mfaService.generateQrCode(secret.otpauth_url);

    res.status(200).json({
      secret: secret.base32,
      qrCode,
      otpauthUrl: secret.otpauth_url
    });
  } catch (error) {
    logger.mfaError('TOTP setup error:', error);
    res.status(500).json({ error: 'Failed to setup TOTP' });
  }
});

router.post('/mfa-verify-totp-setup', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const mfaService = require('../services/mfaService');
  const authService = require('../services/authService');

  try {
    const { secret, token } = req.body;

    if (!secret || !token) {
      return res.status(400).json({ error: 'Secret and token are required' });
    }

    const isValid = mfaService.verifyTotpToken(secret, token);

    if (isValid) {
      // Update user with TOTP secret and setup MFA
      await authService.setupMfaForUser(req.user._id, 'totp', secret);

      res.status(200).json({ success: true, message: 'TOTP setup completed' });
    } else {
      res.status(200).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    logger.mfaError('TOTP setup verification error:', error);
    res.status(500).json({ error: 'Failed to verify TOTP setup' });
  }
});

// MFA verification endpoint for login flow
router.post('/mfa-verify-login', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const authService = require('../services/authService');

  try {
    const { token } = req.body;
    const mfaUser = req.session.mfaUser;

    if (!mfaUser) {
      return res.status(400).json({ error: 'No MFA session found' });
    }

    if (!token || token.length !== 6) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    // Verify the MFA token
    const result = await authService.handleMfaVerification(
      req.user,
      token,
      req.user.mfaMethod
    );

    // Clear MFA session
    delete req.session.mfaUser;

    if (result.type === 'single') {
      res.json({
        success: true,
        redirectUrl: result.redirectUrl
      });
    } else {
      res.json({
        success: true,
        redirectUrl: 'http://localhost:3001/tenant-selection'
      });
    }
  } catch (error) {
    logger.mfaError('MFA verification error:', error);
    res.status(400).json({ error: error.message || 'MFA verification failed' });
  }
});

// Organization MFA Management Routes
router.post('/organization/mfa/enable', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const authService = require('../services/authService');

  try {
    const { methods } = req.body;

    await authService.enableOrganizationMfa(methods || ['totp']);

    res
      .status(200)
      .json({ success: true, message: 'Organization MFA enabled' });
  } catch (error) {
    logger.error('Enable organization MFA error:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to enable organization MFA' });
  }
});

router.post('/organization/mfa/disable', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const authService = require('../services/authService');

  try {
    await authService.disableOrganizationMfa();

    res
      .status(200)
      .json({ success: true, message: 'Organization MFA disabled' });
  } catch (error) {
    logger.error('Disable organization MFA error:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to disable organization MFA' });
  }
});

router.post('/organization/mfa/methods', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const authService = require('../services/authService');

  try {
    const { methods } = req.body;

    if (!methods || !Array.isArray(methods)) {
      return res.status(400).json({ error: 'Methods array is required' });
    }

    await authService.updateOrganizationMfaMethods(methods);

    res
      .status(200)
      .json({ success: true, message: 'Organization MFA methods updated' });
  } catch (error) {
    logger.error('Update organization MFA methods error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update organization MFA methods'
    });
  }
});

router.post('/organization/mfa/grace-period', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const authService = require('../services/authService');

  try {
    const { days } = req.body;

    if (typeof days !== 'number' || days < 0) {
      return res
        .status(400)
        .json({ error: 'Valid grace period in days is required' });
    }

    await authService.setOrganizationMfaGracePeriod(days);

    res.status(200).json({
      success: true,
      message: 'Organization MFA grace period updated'
    });
  } catch (error) {
    logger.error('Update organization MFA grace period error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update organization MFA grace period'
    });
  }
});

router.get('/organization/mfa/config', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const authService = require('../services/authService');

  try {
    const config = await authService.getOrganizationMfaConfig();
    res.status(200).json(config);
  } catch (error) {
    logger.error('Get organization MFA config error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get organization MFA config'
    });
  }
});

// Tenant MFA Management Routes
router.post('/tenant/mfa/enable', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const authService = require('../services/authService');

  try {
    const { tenantId, methods } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    await authService.enableMfaForTenant(tenantId);

    if (methods && methods.length > 0) {
      await authService.updateTenantMfaMethods(tenantId, methods);
    }

    res.status(200).json({ success: true, message: 'MFA enabled for tenant' });
  } catch (error) {
    logger.error('Enable tenant MFA error:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to enable MFA for tenant' });
  }
});

router.post('/tenant/mfa/disable', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const context = getContext();
  const logger = context.getLogger();
  const authService = require('../services/authService');

  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    await authService.disableMfaForTenant(tenantId);

    res.status(200).json({ success: true, message: 'MFA disabled for tenant' });
  } catch (error) {
    logger.error('Disable tenant MFA error:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to disable MFA for tenant' });
  }
});

// Check if user exists and return their tenants
router.get('/check-user', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const context = getContext();
    const User = context.getModel('User');
    const UserTenant = context.getModel('UserTenant');
    const Tenant = context.getModel('Tenant');
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ exists: false, tenants: [] });
    }
    // Find all tenants for this user
    const userTenants = await UserTenant.find({ user: user._id }).populate(
      'tenant'
    );
    const tenants = userTenants.map(ut => ({
      name: ut.tenant.tenantName,
      tenantId: ut.tenant.tenantId
    }));
    res.json({ exists: true, tenants });
  } catch (error) {
    console.error('Error in /auth/check-user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('http://localhost:3001/login'));
});

// Vue.js login page
router.get('/vue-login', (req, res) => {
  res.render('vue-login');
});

// Vue.js test page
router.get('/vue-test', (req, res) => {
  res.render('vue-test');
});

// Test Vue dashboard route
router.get('/test-vue-dashboard', (req, res) => {
  res.render('vue-dashboard-simple', {
    tenant: { tenantName: 'test-tenant', tenantId: 'test-123' },
    user: { email: 'test@example.com', name: 'Test User' },
    userRoles: [{ name: 'User' }],
    userPermissions: ['read']
  });
});

// Test API endpoint
router.get('/test-api', (req, res) => {
  logger.api('Test API endpoint called');
  res.json({
    message: 'API proxy is working!',
    timestamp: new Date().toISOString()
  });
});

// Get OAuth configuration for frontend
router.get('/oauth-config', (req, res) => {
  const context = getContext();
  const logger = context.getLogger();
  logger.api('OAuth config endpoint called');
  const config = {
    oauthEnabled: !!process.env.OAUTH_CLIENT_ID,
    oauthUrl: '/auth/oauth',
    provider: process.env.OAUTH_PROVIDER || 'SSO'
  };
  logger.api('Sending OAuth config:', config);
  res.json(config);
});

// Get current user data for Vue app
router.get('/current-user', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const context = getContext();
    const logger = context.getLogger();
    const TenantsModel = context.getModel('Tenant');
    const UserTenant = context.getModel('UserTenant');
    const rbacService = require('../services/rbacService');
    const mfaService = require('../services/mfaService');

    // Get tenant from session or find first available tenant
    let tenant = null;
    if (req.session.tenantId) {
      tenant = await TenantsModel.findOne({ tenantId: req.session.tenantId });
    }

    // If no tenant in session, get the first available tenant for user
    if (!tenant) {
      const userTenant = await UserTenant.findOne({
        user: req.user._id
      }).populate('tenant');
      if (userTenant) {
        tenant = userTenant.tenant;
        req.session.tenantId = tenant.tenantId;
      }
    }

    // Validate tenant access
    if (tenant) {
      const authService = require('../services/authService');
      try {
        await authService.validateTenantAccess(req.user._id, tenant.tenantId);

        // Get user roles and permissions
        const userRoles = await rbacService.getUserRoles(
          req.user._id,
          tenant._id
        );
        const userPermissions = await rbacService.getUserPermissions(
          req.user._id,
          tenant._id
        );

        // Get available MFA methods
        const availableMfaMethods = mfaService.getAvailableMethods(req.user);

        res.json({
          user: {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            phoneNumber: req.user.phoneNumber,
            countryCode: req.user.countryCode,
            totpSecret: req.user.totpSecret ? true : false,
            mfaMethod: req.user.mfaMethod,
            mfaSetupCompleted: req.user.mfaSetupCompleted,
            oauthProvider: req.user.oauthProvider
          },
          tenant: {
            id: tenant._id,
            tenantName: tenant.tenantName,
            tenantId: tenant.tenantId,
            envName: tenant.envName,
            mfaEnabled: tenant.mfaEnabled,
            mfaRequiredForLocalUsers: tenant.mfaRequiredForLocalUsers,
            mfaMethods: tenant.mfaMethods
          },
          userRoles,
          userPermissions,
          availableMfaMethods
        });
      } catch (error) {
        console.error('Tenant access validation failed:', error);
        res.status(403).json({ error: 'Access denied to tenant' });
      }
    } else {
      res.status(404).json({ error: 'No tenant found for user' });
    }
  } catch (error) {
    const context = getContext();
    const logger = context.getLogger();
    console.error('Error in /auth/current-user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user data (alias for /current-user)
router.get('/me', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  try {
    const context = getContext();
    const logger = context.getLogger();
    const TenantsModel = context.getModel('Tenant');
    const UserTenant = context.getModel('UserTenant');
    const rbacService = require('../services/rbacService');
    const mfaService = require('../services/mfaService');

    // Get tenant from session or find first available tenant
    let tenant = null;
    if (req.session.tenantId) {
      tenant = await TenantsModel.findOne({ tenantId: req.session.tenantId });
    }

    // If no tenant in session, get the first available tenant for user
    if (!tenant) {
      const userTenant = await UserTenant.findOne({
        user: req.user._id
      }).populate('tenant');
      if (userTenant) {
        tenant = userTenant.tenant;
        req.session.tenantId = tenant.tenantId;
      }
    }

    // Validate tenant access
    if (tenant) {
      const authService = require('../services/authService');
      try {
        await authService.validateTenantAccess(req.user._id, tenant.tenantId);

        // Get user roles and permissions
        const userRoles = await rbacService.getUserRoles(
          req.user._id,
          tenant._id
        );
        const userPermissions = await rbacService.getUserPermissions(
          req.user._id,
          tenant._id
        );

        // Get available MFA methods
        const availableMfaMethods = mfaService.getAvailableMethods(req.user);

        res.json({
          success: true,
          user: {
            id: req.user._id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            name: req.user.name,
            phoneNumber: req.user.phoneNumber,
            countryCode: req.user.countryCode,
            totpSecret: req.user.totpSecret ? true : false,
            mfaMethod: req.user.mfaMethod,
            mfaSetupCompleted: req.user.mfaSetupCompleted,
            oauthProvider: req.user.oauthProvider,
            permissions: userPermissions,
            roles: userRoles
          },
          tenant: {
            id: tenant._id,
            tenantName: tenant.tenantName,
            tenantId: tenant.tenantId,
            envName: tenant.envName,
            mfaEnabled: tenant.mfaEnabled,
            mfaRequiredForLocalUsers: tenant.mfaRequiredForLocalUsers,
            mfaMethods: tenant.mfaMethods
          },
          userRoles,
          userPermissions,
          availableMfaMethods
        });
      } catch (error) {
        console.error('Tenant access validation failed:', error);
        res.status(403).json({ success: false, error: 'Access denied to tenant' });
      }
    } else {
      res.status(404).json({ success: false, error: 'No tenant found for user' });
    }
  } catch (error) {
    const context = getContext();
    const logger = context.getLogger();
    console.error('Error in /auth/me:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Tenant selection endpoint
router.post(
  '/select-tenant',
  async (req, res) => {
    const context = getContext();
    const logger = context.getLogger();
    const { validateTenantSelection, sanitizeInput } = require('../middleware/validation');
    const authService = require('../services/authService');

    // Apply middleware
    sanitizeInput(req, res, () => {
      // Apply validation middleware
      const validationChain = validateTenantSelection;
      validationChain[validationChain.length - 1] = (req, res, next) => {
        const errors = require('express-validator').validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            errors: errors.array()
          });
        }
        next();
      };

      // Execute validation chain
      let currentIndex = 0;
      const executeValidation = () => {
        if (currentIndex < validationChain.length - 1) {
          validationChain[currentIndex](req, res, () => {
            currentIndex++;
            executeValidation();
          });
        } else {
          validationChain[currentIndex](req, res, async () => {
            logger.auth('Select tenant request', {
              sessionId: req.sessionID,
              authenticated: req.isAuthenticated(),
              user: req.user?.email,
              sessionData: Object.keys(req.session)
            });

            // Check if user is authenticated
            if (!req.isAuthenticated()) {
              return res.status(401).json({ error: 'Not authenticated' });
            }
            try {
              const { tenantId } = req.body;

              // Use authService to select tenant and check MFA requirements
              const result = await authService.selectTenant(req.user._id, tenantId);
              logger.auth('Tenant selection result:', result);

              if (result.type === 'mfa_setup_required') {
                // Store user info in session for MFA setup
                req.session.mfaSetupUser = {
                  id: req.user._id,
                  email: req.user.email,
                  tenantId: result.tenant.tenantId
                };
                logger.mfa('Redirecting to MFA setup after tenant selection');
                res.redirect('http://localhost:3001/mfa-setup');
              } else if (result.type === 'mfa_required') {
                // Store user info in session for MFA verification
                req.session.mfaUser = {
                  id: req.user._id,
                  email: req.user.email,
                  mfaMethod: req.user.mfaMethod
                };
                logger.mfa('Redirecting to MFA verification after tenant selection');
                res.redirect('http://localhost:3001/mfa');
              } else if (result.type === 'success') {
                // Set tenant in session
                req.session.tenantId = tenantId;
                logger.auth('Redirecting to dashboard after tenant selection');
                res.redirect('http://localhost:3001/dashboard');
              } else {
                logger.error('Unknown result type from tenant selection:', result);
                res.redirect('http://localhost:3001/tenant-selection');
              }
            } catch (error) {
              logger.error('Error in tenant selection:', error);
              res.redirect('http://localhost:3001/tenant-selection');
            }
          });
        }
      };

      executeValidation();
    });
  }
);

// Get available tenants for user
router.get('/available-tenants', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const context = getContext();
    const UserTenant = context.getModel('UserTenant');
    const userTenants = await UserTenant.find({ user: req.user._id }).populate(
      'tenant'
    );

    const tenants = userTenants.map(ut => ({
      id: ut.tenant._id,
      tenantName: ut.tenant.tenantName,
      tenantId: ut.tenant.tenantId,
      envName: ut.tenant.envName,
      mfaEnabled: ut.tenant.mfaEnabled,
      mfaRequiredForLocalUsers: ut.tenant.mfaRequiredForLocalUsers,
      mfaMethods: ut.tenant.mfaMethods
    }));

    res.json({ tenants });
  } catch (error) {
    const context = getContext();
    const logger = context.getLogger();
    console.trace('some trace');
    console.log(error);
    console.error('Error fetching available tenants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Switch tenant endpoint
router.post('/switch-tenant', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const context = getContext();
    const logger = context.getLogger();
    const { sanitizeInput } = require('../middleware/validation');

    sanitizeInput(req, res, async () => {
      const { tenant } = req.body;

      if (!tenant) {
        return res.status(400).json({ error: 'Tenant is required' });
      }

      // Update session with new tenant
      req.session.tenantId = tenant;
      logger.auth('Switched tenant:', tenant);

      res.json({ success: true, tenant });
    });
  } catch (error) {
    const context = getContext();
    const logger = context.getLogger();
    logger.error('Error switching tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
