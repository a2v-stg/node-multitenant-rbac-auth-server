const rbacService = require('../services/rbacService');

// Middleware to check if user has a specific permission
const requirePermission = permission => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.tenant) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const hasPermission = await rbacService.hasPermission(
        req.user._id,
        req.tenant._id,
        permission
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          requiredPermission: permission
        });
      }

      next();
    } catch (error) {
      console.error('Permission check middleware error:', error);
      return res.status(500).json({
        error: 'Permission check failed'
      });
    }
  };
};

// Middleware to check if user has any of the specified permissions
const requireAnyPermission = permissions => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.tenant) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const hasPermission = await rbacService.hasAnyPermission(
        req.user._id,
        req.tenant._id,
        permissions
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          requiredPermissions: permissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check middleware error:', error);
      return res.status(500).json({
        error: 'Permission check failed'
      });
    }
  };
};

// Middleware to check if user has all of the specified permissions
const requireAllPermissions = permissions => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.tenant) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const hasPermission = await rbacService.hasAllPermissions(
        req.user._id,
        req.tenant._id,
        permissions
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          requiredPermissions: permissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check middleware error:', error);
      return res.status(500).json({
        error: 'Permission check failed'
      });
    }
  };
};

// Middleware to check if user has a specific role
const requireRole = roleName => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.tenant) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const userRoles = await rbacService.getUserRoles(
        req.user._id,
        req.tenant._id
      );

      const hasRole = userRoles.some(role => role.name === roleName);

      if (!hasRole) {
        return res.status(403).json({
          error: 'Insufficient role',
          requiredRole: roleName
        });
      }

      next();
    } catch (error) {
      console.error('Role check middleware error:', error);
      return res.status(500).json({
        error: 'Role check failed'
      });
    }
  };
};

// Middleware to add user permissions to request object
const addUserPermissions = async (req, res, next) => {
  try {
    if (req.user && req.tenant) {
      req.userPermissions = await rbacService.getUserPermissions(
        req.user._id,
        req.tenant._id
      );
      req.userRoles = await rbacService.getUserRoles(
        req.user._id,
        req.tenant._id
      );
    }
    next();
  } catch (error) {
    console.error('Add user permissions middleware error:', error);
    req.userPermissions = [];
    req.userRoles = [];
    next();
  }
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  addUserPermissions
};
