const express = require('express');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { validateTenantAccess } = require('../middleware/tenantValidation');
const { addUserPermissions, requirePermission } = require('../middleware/rbacMiddleware');
const router = express.Router();

// Import models
const Organization = require('../models/Organization');

// Get all settings
router.get('/', ensureAuthenticated, addUserPermissions, requirePermission('settings:read'), async (req, res) => {
  try {
    const tenantId = req.session.tenantId || req.tenant?._id;

    // Get organization settings
    let organization = await Organization.findOne({ organizationId: 'default' });

    if (!organization) {
      // Create default organization if it doesn't exist
      organization = new Organization({
        name: 'Default Organization',
        organizationId: 'default',
        description: 'Default organization configuration'
      });
      await organization.save();
    }

    // Get system settings
    const systemSettings = {
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        connection: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
        name: process.env.MONGODB_URI ? process.env.MONGODB_URI.split('/').pop().split('?')[0] : 'Unknown'
      }
    };

    res.json({
      success: true,
      data: {
        organization,
        system: systemSettings
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get organization settings
router.get('/organization', ensureAuthenticated, addUserPermissions, requirePermission('settings:read'), async (req, res) => {
  try {
    let organization = await Organization.findOne({ organizationId: 'default' });

    if (!organization) {
      // Create default organization if it doesn't exist
      organization = new Organization({
        name: 'Default Organization',
        organizationId: 'default',
        description: 'Default organization configuration'
      });
      await organization.save();
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update organization settings
router.put('/organization', ensureAuthenticated, addUserPermissions, requirePermission('settings:update'), async (req, res) => {
  try {
    const {
      name,
      description,
      mfaEnabled,
      mfaGracePeriod,
      sessionTimeout,
      passwordPolicy,
      auditLogging,
      maxLoginAttempts,
      lockoutDuration,
      features
    } = req.body;

    let organization = await Organization.findOne({ organizationId: 'default' });

    if (!organization) {
      organization = new Organization({
        organizationId: 'default'
      });
    }

    // Update organization settings
    organization.name = name || organization.name;
    organization.description = description || organization.description;
    organization.mfaEnabled = mfaEnabled !== undefined ? mfaEnabled : organization.mfaEnabled;
    organization.mfaGracePeriod = mfaGracePeriod !== undefined ? mfaGracePeriod : organization.mfaGracePeriod;
    organization.sessionTimeout = sessionTimeout !== undefined ? sessionTimeout * 60 * 60 * 1000 : organization.sessionTimeout;
    organization.maxLoginAttempts = maxLoginAttempts !== undefined ? maxLoginAttempts : organization.maxLoginAttempts;
    organization.lockoutDuration = lockoutDuration !== undefined ? lockoutDuration * 60 * 1000 : organization.lockoutDuration;

    // Update password policy
    if (passwordPolicy) {
      organization.passwordPolicy = {
        ...organization.passwordPolicy,
        ...passwordPolicy
      };
    }

    // Update audit logging
    if (auditLogging) {
      organization.auditLogging = {
        ...organization.auditLogging,
        ...auditLogging
      };
    }

    // Update features
    if (features) {
      organization.features = {
        ...organization.features,
        ...features
      };
    }

    organization.updatedAt = new Date();
    await organization.save();

    res.json({
      success: true,
      data: organization,
      message: 'Organization settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system settings
router.get('/system', ensureAuthenticated, addUserPermissions, requirePermission('settings:read'), async (req, res) => {
  try {
    const systemSettings = {
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        connection: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
        name: process.env.MONGODB_URI ? process.env.MONGODB_URI.split('/').pop().split('?')[0] : 'Unknown'
      }
    };

    res.json({
      success: true,
      data: systemSettings
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
