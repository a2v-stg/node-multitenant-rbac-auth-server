const authService = require('../services/authService');

const validateTenantAccess = async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId || req.session.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID required'
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const tenant = await authService.validateTenantAccess(
      req.user._id,
      tenantId
    );
    req.tenant = tenant;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Unauthorized tenant access',
      details: error.message
    });
  }
};

const ensureTenantSelected = (req, res, next) => {
  // Only apply tenant validation to API routes that require a tenant
  if (
    req.path.startsWith('/api/') &&
    !req.path.startsWith('/api/auth/') &&
    !req.path.startsWith('/api/rbac/permissions') &&
    !req.session.tenantId
  ) {
    return res.status(401).json({ error: 'No tenant selected' });
  }

  // For non-API routes, let the Vue app handle routing
  next();
};

module.exports = {
  validateTenantAccess,
  ensureTenantSelected
};
