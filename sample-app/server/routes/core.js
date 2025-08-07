// Register module aliases first
require('module-alias/register');

const express = require('express');
const router = express.Router();

// Import middleware from admin-ui submodule using the correct path
const { ensureAuthenticated } = require('@admin-ui/middleware/authMiddleware');
const { validateTenantAccess } = require('@admin-ui/middleware/tenantValidation');
const { addUserPermissions } = require('@admin-ui/middleware/rbacMiddleware');

// Import models from the admin-ui context (these are properly connected to the database)
const { getContext } = require('../../../src/server/context');

// Get models from context - these are properly connected to the main mongoose instance
const getModels = () => {
  const context = getContext();
  return {
    DecisionModel: context.getModel('DecisionModel'),
    DocumentsModel: context.getModel('DocumentsModel'),
    EventModel: context.getModel('EventModel'),
    ErrorModel: context.getModel('ErrorModel'),
    BlackListModel: context.getModel('BlackListModel'),
    SecurityViolationModel: context.getModel('SecurityViolationModel'),
    RetroReviewModel: context.getModel('RetroReviewModel')
  };
};

// Helper function to build tenant filter
const buildTenantFilter = req => {
  const filter = {};
  if (req.session.tenantId) {
    filter.tenantId = req.session.tenantId;
  }
  return filter;
};

// Helper function to build pagination
const buildPagination = req => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Helper function to build sort
const buildSort = req => {
  const sortBy = req.query.sortBy || 'createdTime';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  return { [sortBy]: sortOrder };
};



// ==================== DECISION APIs ====================

// Get all decisions with pagination and filtering
router.get(
  '/decisions',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const filter = buildTenantFilter(req);
      const { page, limit, skip } = buildPagination(req);
      const sort = buildSort(req);

      // Add search filters
      if (req.query.applicationNumber) {
        filter.applicationNumber = {
          $regex: req.query.applicationNumber,
          $options: 'i',
        };
      }
      if (req.query.fdeReference) {
        filter.fdeReference = { $regex: req.query.fdeReference, $options: 'i' };
      }
      if (req.query.decision) {
        filter['validation.decision'] = {
          $regex: req.query.decision,
          $options: 'i',
        };
      }
      console.log('🔍 Filter:', filter);

      const models = getModels();
      const decisions = await models.DecisionModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .maxTimeMS(10000);

      const total = await models.DecisionModel.countDocuments(filter).maxTimeMS(10000);

      res.json({
        success: true,
        data: decisions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching decisions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get decision by ID
router.get(
  '/decisions/:id',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const models = getModels();
      const decision = await models.DecisionModel.findById(req.params.id);
      if (!decision) {
        return res.status(404).json({ error: 'Decision not found' });
      }

      // Check tenant access
      if (decision.tenantId !== req.session.tenantId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json({ success: true, data: decision });
    } catch (error) {
      console.error('Error fetching decision:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== DOCUMENTS APIs ====================

// Get all documents with pagination and filtering
router.get(
  '/documents',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const filter = buildTenantFilter(req);
      const { page, limit, skip } = buildPagination(req);
      const sort = buildSort(req);

      // Add search filters
      if (req.query.documentName) {
        filter.documentName = { $regex: req.query.documentName, $options: 'i' };
      }
      if (req.query.documentType) {
        filter.documentType = { $regex: req.query.documentType, $options: 'i' };
      }
      if (req.query.sourceReference) {
        filter.sourceReference = {
          $regex: req.query.sourceReference,
          $options: 'i',
        };
      }
      if (req.query.fraudulentDocumentStatus !== undefined) {
        filter.fraudulentDocumentStatus =
          req.query.fraudulentDocumentStatus === 'true';
      }
      const models = getModels();
      const documents = await models.DocumentsModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .maxTimeMS(10000);
      const total = await models.DocumentsModel.countDocuments(filter).maxTimeMS(10000);

      res.json({
        success: true,
        data: documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get document by ID
router.get(
  '/documents/:id',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const models = getModels();
      const document = await models.DocumentsModel.findById(req.params.id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check tenant access
      if (document.tenantId !== req.session.tenantId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json({ success: true, data: document });
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== EVENTS APIs ====================

// Get all events with pagination and filtering
router.get(
  '/events',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const filter = buildTenantFilter(req);
      const { page, limit, skip } = buildPagination(req);
      const sort = buildSort(req);

      // Add search filters
      if (req.query.applicationNumber) {
        filter.applicationNumber = {
          $regex: req.query.applicationNumber,
          $options: 'i',
        };
      }
      if (req.query.validationType) {
        filter.validationType = {
          $regex: req.query.validationType,
          $options: 'i',
        };
      }
      if (req.query.validationStatus) {
        filter.validationStatus = {
          $regex: req.query.validationStatus,
          $options: 'i',
        };
      }
      if (req.query.eventType) {
        filter.eventType = { $regex: req.query.eventType, $options: 'i' };
      }
      if (req.query.retroreviewed !== undefined) {
        filter.retroreviewed = req.query.retroreviewed === 'true';
      }

      const models = getModels();
      const events = await models.EventModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .maxTimeMS(10000);

      const total = await models.EventModel.countDocuments(filter).maxTimeMS(10000);

      res.json({
        success: true,
        data: events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get event by ID
router.get(
  '/events/:id',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const models = getModels();
      const event = await models.EventModel.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check tenant access
      if (event.tenantId !== req.session.tenantId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json({ success: true, data: event });
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== ERRORS APIs ====================

// Get all errors with pagination and filtering
router.get(
  '/errors',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const filter = buildTenantFilter(req);
      const { page, limit, skip } = buildPagination(req);
      const sort = buildSort(req);

      // Add search filters
      if (req.query.errorType) {
        filter.errorType = { $regex: req.query.errorType, $options: 'i' };
      }
      if (req.query.validationType) {
        filter.validationType = {
          $regex: req.query.validationType,
          $options: 'i',
        };
      }
      if (req.query.retryStatus) {
        filter.retryStatus = { $regex: req.query.retryStatus, $options: 'i' };
      }

      const models = getModels();
      const errors = await models.ErrorModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .maxTimeMS(10000);

      const total = await models.ErrorModel.countDocuments(filter).maxTimeMS(10000);

      res.json({
        success: true,
        data: errors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching errors:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get error by ID
router.get(
  '/errors/:id',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const models = getModels();
      const error = await models.ErrorModel.findById(req.params.id);
      if (!error) {
        return res.status(404).json({ error: 'Error not found' });
      }

      // Check tenant access
      if (error.tenantId !== req.session.tenantId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json({ success: true, data: error });
    } catch (error) {
      console.error('Error fetching error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== BLACKLIST APIs ====================

// Get all blacklist entries with pagination and filtering
router.get(
  '/blacklist',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const filter = buildTenantFilter(req);
      const { page, limit, skip } = buildPagination(req);
      const sort = buildSort(req);

      // Add search filters
      if (req.query.entityValue) {
        filter.entityValue = { $regex: req.query.entityValue, $options: 'i' };
      }
      if (req.query.entityType) {
        filter.entityType = { $regex: req.query.entityType, $options: 'i' };
      }
      const models = getModels();
      const blacklistEntries = await models.BlackListModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .maxTimeMS(10000);

      const total = await models.BlackListModel.countDocuments(filter).maxTimeMS(10000);
      res.json({
        success: true,
        data: blacklistEntries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching blacklist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== SECURITY VIOLATIONS APIs ====================

// Get all security violations with pagination and filtering
router.get(
  '/security-violations',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const filter = buildTenantFilter(req);
      const { page, limit, skip } = buildPagination(req);
      const sort = buildSort(req);

      // Add search filters
      if (req.query.violationType) {
        filter.violationType = {
          $regex: req.query.violationType,
          $options: 'i',
        };
      }
      if (req.query.severity) {
        filter.severity = { $regex: req.query.severity, $options: 'i' };
      }

      const models = getModels();
      const violations = await models.SecurityViolationModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .maxTimeMS(10000);
      const total = await models.SecurityViolationModel.countDocuments(filter).maxTimeMS(10000);
      res.json({
        success: true,
        data: violations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching security violations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== RETRO REVIEW APIs ====================

// Get all retro reviews with pagination and filtering
router.get(
  '/retro-reviews',
  ensureAuthenticated,
  validateTenantAccess,
  async (req, res) => {
    try {
      const filter = buildTenantFilter(req);
      const { page, limit, skip } = buildPagination(req);
      const sort = buildSort(req);

      // Add search filters
      if (req.query.reviewStatus) {
        filter.reviewStatus = { $regex: req.query.reviewStatus, $options: 'i' };
      }
      if (req.query.reviewType) {
        filter.reviewType = { $regex: req.query.reviewType, $options: 'i' };
      }

      const models = getModels();
      const reviews = await models.RetroReviewModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .maxTimeMS(10000);
      const total = await models.RetroReviewModel.countDocuments(filter).maxTimeMS(10000);
      res.json({
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching retro reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== DASHBOARD STATS APIs ====================

// Get dashboard statistics
router.get(
  '/dashboard-stats',
  ensureAuthenticated,
  addUserPermissions,
  async (req, res) => {
    try {
      const tenantId = req.session.tenantId;
      const filter = { tenantId };

      const models = getModels();

      // Get counts for different models with timeout protection
      const [
        decisionsCount,
        documentsCount,
        eventsCount,
        errorsCount,
        blacklistCount,
        securityViolationsCount,
        retroReviewsCount,
      ] = await Promise.all([
        models.DecisionModel.countDocuments(filter).maxTimeMS(10000),
        models.DocumentsModel.countDocuments(filter).maxTimeMS(10000),
        models.EventModel.countDocuments(filter).maxTimeMS(10000),
        models.ErrorModel.countDocuments(filter).maxTimeMS(10000),
        models.BlackListModel.countDocuments(filter).maxTimeMS(10000),
        models.SecurityViolationModel.countDocuments(filter).maxTimeMS(10000),
        models.RetroReviewModel.countDocuments(filter).maxTimeMS(10000),
      ]);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentFilter = {
        ...filter,
        createdTime: { $gte: sevenDaysAgo },
      };

      const [recentDecisions, recentEvents, recentErrors] = await Promise.all([
        models.DecisionModel.countDocuments(recentFilter).maxTimeMS(10000),
        models.EventModel.countDocuments(recentFilter).maxTimeMS(10000),
        models.ErrorModel.countDocuments(recentFilter).maxTimeMS(10000),
      ]);

      // Get decision statistics
      const decisionStats = await models.DecisionModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$validation.decision',
            count: { $sum: 1 },
          },
        },
      ]).option({ maxTimeMS: 10000 });

      res.json({
        success: true,
        data: {
          counts: {
            decisions: decisionsCount,
            documents: documentsCount,
            events: eventsCount,
            errors: errorsCount,
            blacklist: blacklistCount,
            securityViolations: securityViolationsCount,
            retroReviews: retroReviewsCount,
          },
          recentActivity: {
            decisions: recentDecisions,
            events: recentEvents,
            errors: recentErrors,
          },
          decisionStats,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router; 