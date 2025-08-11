const express = require('express');
const { getContext } = require('../context');
const rbacService = require('../services/rbacService');

const router = express.Router();

// Get all tenants (only for default tenant users)
router.get(
  '/tenants',
  async (req, res) => {
    try {
      const context = getContext();
      const Tenant = context.getModel('Tenant');

      // Check if user is authenticated and has default tenant access
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          error: 'Access denied. Only default tenant users can manage tenants.'
        });
      }

      const tenants = await Tenant.find({}).sort({ tenantName: 1 });

      res.json({
        success: true,
        data: tenants
      });
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get available tenants for user assignment (only for default tenant users)
router.get(
  '/tenants/available',
  async (req, res) => {
    try {
      const context = getContext();
      const Tenant = context.getModel('Tenant');

      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          error: 'Access denied. Only default tenant users can view available tenants.'
        });
      }

      // Only default tenant users can view available tenants
      if (req.session.tenantId !== 'default') {
        return res.status(403).json({
          error: 'Access denied. Only default tenant users can view available tenants.'
        });
      }

      // Get all tenants
      const tenants = await Tenant.find().sort({ tenantName: 1 });

      const tenantList = tenants.map(tenant => ({
        id: tenant._id,
        tenantName: tenant.tenantName,
        tenantId: tenant.tenantId,
        envName: tenant.envName,
        mfaEnabled: tenant.mfaEnabled,
        mfaRequiredForLocalUsers: tenant.mfaRequiredForLocalUsers,
        mfaMethods: tenant.mfaMethods
      }));

      res.json({
        success: true,
        data: tenantList
      });
    } catch (error) {
      console.error('Error fetching available tenants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get specific tenant
router.get(
  '/tenants/:id',
  async (req, res) => {
    try {
      const context = getContext();
      const Tenant = context.getModel('Tenant');

      const tenant = await Tenant.findById(req.params.id);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Error fetching tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create new tenant (only for default tenant users)
router.post(
  '/tenants',
  async (req, res) => {
    try {
      const context = getContext();
      const Tenant = context.getModel('Tenant');

      // Check if user is authenticated and has default tenant access
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          error: 'Access denied. Only default tenant users can create tenants.'
        });
      }

      // Only default tenant users can create tenants
      if (req.session.tenantId !== 'default') {
        return res.status(403).json({
          error: 'Access denied. Only default tenant users can create tenants.'
        });
      }

      const {
        tenantName,
        tenantId,
        envName,
        apiKey,
        sharedKey,
        callbackUrl,
        callbackRetries,
        allowedModules,
        allowedSocureSubModules,
        rulesEngineHost,
        rulesEngineAccessToken,
        callbackEndpoint,
        subscribeEventsFrom,
        selectedEvents,
        documentCallbackUrl,
        topFaceSimilarity,
        topImageSimilarity
      } = req.body;

      // Validate required fields
      if (!tenantName || !tenantId || !envName) {
        return res.status(400).json({
          error: 'tenantName, tenantId, and envName are required'
        });
      }

      // Check if tenant already exists
      const existingTenant = await Tenant.findOne({ tenantId });
      if (existingTenant) {
        return res.status(400).json({
          error: 'Tenant with this tenantId already exists'
        });
      }

      const tenant = new Tenant({
        tenantName,
        tenantId,
        envName,
        apiKey,
        sharedKey,
        callbackUrl,
        callbackRetries,
        allowedModules,
        allowedSocureSubModules,
        rulesEngineHost,
        rulesEngineAccessToken,
        callbackEndpoint,
        subscribeEventsFrom,
        selectedEvents,
        documentCallbackUrl,
        topFaceSimilarity,
        topImageSimilarity
      });

      await tenant.save();

      res.status(201).json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update tenant (only for default tenant users)
router.put(
  '/tenants/:id',
  async (req, res) => {
    try {
      const context = getContext();
      const Tenant = context.getModel('Tenant');

      // Check if user is authenticated and has default tenant access
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          error: 'Access denied. Only default tenant users can update tenants.'
        });
      }

      // Only default tenant users can update tenants
      if (req.session.tenantId !== 'default') {
        return res.status(403).json({
          error: 'Access denied. Only default tenant users can update tenants.'
        });
      }

      const tenant = await Tenant.findById(req.params.id);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Update tenant fields
      const updateFields = [
        'tenantName',
        'envName',
        'apiKey',
        'sharedKey',
        'callbackUrl',
        'callbackRetries',
        'allowedModules',
        'allowedSocureSubModules',
        'rulesEngineHost',
        'rulesEngineAccessToken',
        'callbackEndpoint',
        'subscribeEventsFrom',
        'selectedEvents',
        'documentCallbackUrl',
        'topFaceSimilarity',
        'topImageSimilarity'
      ];

      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          tenant[field] = req.body[field];
        }
      });

      await tenant.save();

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Error updating tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete tenant (only for default tenant users)
router.delete(
  '/tenants/:id',
  async (req, res) => {
    try {
      const context = getContext();
      const Tenant = context.getModel('Tenant');

      // Check if user is authenticated and has default tenant access
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          error: 'Access denied. Only default tenant users can delete tenants.'
        });
      }

      // Only default tenant users can delete tenants
      if (req.session.tenantId !== 'default') {
        return res.status(403).json({
          error: 'Access denied. Only default tenant users can delete tenants.'
        });
      }

      const tenant = await Tenant.findById(req.params.id);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Don't allow deletion of default tenant
      if (tenant.tenantId === 'default') {
        return res.status(400).json({
          error: 'Cannot delete default tenant'
        });
      }

      await Tenant.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Tenant deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get current tenant for the authenticated user
router.get(
  '/current-tenant',
  async (req, res) => {
    try {
      const context = getContext();
      const Tenant = context.getModel('Tenant');

      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          error: 'Not authenticated'
        });
      }

      // Get tenant from session
      const tenantId = req.session.tenantId;
      if (!tenantId) {
        return res.status(404).json({
          error: 'No tenant selected'
        });
      }

      // Find the tenant
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found'
        });
      }

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Error fetching current tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get tenant by tenantId
router.get(
  '/tenants/by-id/:tenantId',
  async (req, res) => {
    try {
      const context = getContext();
      const Tenant = context.getModel('Tenant');

      const tenant = await Tenant.findOne({
        tenantId: req.params.tenantId
      });

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Error fetching tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
