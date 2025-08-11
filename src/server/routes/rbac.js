const express = require('express');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { validateTenantAccess } = require('../middleware/tenantValidation');
const {
  requirePermission,
  requireAnyPermission,
  addUserPermissions
} = require('../middleware/rbacMiddleware');
const rbacService = require('../services/rbacService');
const { permissionHelpers } = require('../config/permissions');

const router = express.Router({ mergeParams: true });

// Get all permissions (for UI) - no tenant validation needed
router.get('/permissions', ensureAuthenticated, (req, res) => {
  try {
    const permissions = permissionHelpers.getAllPermissions();
    const categories = permissionHelpers.getPermissionsByCategory();

    res.json({
      success: true,
      data: Object.keys(permissions).map(permission => ({
        key: permission,
        description: permissionHelpers.getPermissionDescription(permission)
      })),
      categories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply middleware to all other RBAC routes
router.use(ensureAuthenticated);
router.use(validateTenantAccess);
router.use(addUserPermissions);

// Get all roles in tenant
router.get('/roles', requirePermission('roles:read'), async (req, res) => {
  try {
    const roles = await rbacService.getTenantRoles(req.tenant._id);

    // Add user count for each role
    const rolesWithUserCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await rbacService.getUsersWithRole(req.tenant._id, role._id);
        return {
          ...role.toObject(),
          userCount: userCount.length
        };
      })
    );

    res.json({
      success: true,
      data: rolesWithUserCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new role
router.post('/roles', requirePermission('roles:create'), async (req, res) => {
  try {
    const { name, description, permissions, parentRole } = req.body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        error: 'Name and permissions array are required'
      });
    }

    const role = await rbacService.createRole(req.tenant._id, {
      name,
      description,
      permissions,
      parentRole
    });

    res.status(201).json({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a role
router.put('/roles/:id', requirePermission('roles:update'), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const roleId = req.params.id;

    const role = await rbacService.getRoleById(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(403).json({ error: 'Cannot modify system roles' });
    }

    const updatedRole = await rbacService.updateRole(roleId, {
      name,
      description,
      permissions
    });

    res.json({
      success: true,
      data: updatedRole
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a role
router.delete('/roles/:id', requirePermission('roles:delete'), async (req, res) => {
  try {
    const roleId = req.params.id;

    const role = await rbacService.getRoleById(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(403).json({ error: 'Cannot delete system roles' });
    }

    // Check if role is assigned to any users
    const usersWithRole = await rbacService.getUsersWithRole(req.tenant._id, roleId);
    if (usersWithRole.length > 0) {
      return res.status(400).json({ error: 'Cannot delete role that is assigned to users' });
    }

    await rbacService.deleteRole(roleId);

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users with their roles
router.get('/users', requirePermission('users:read'), async (req, res) => {
  try {
    const users = await rbacService.getTenantUsers(req.tenant._id);

    // Get roles for each user
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRoles = await rbacService.getUserRoles(user._id, req.tenant._id);
        return {
          ...user.toObject(),
          roles: userRoles
        };
      })
    );

    res.json({
      success: true,
      data: usersWithRoles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's roles and permissions
router.get('/user/permissions', (req, res) => {
  res.json({
    success: true,
    data: {
      permissions: req.userPermissions,
      roles: req.userRoles
    }
  });
});

// Assign role to user
router.post('/assignments', requirePermission('roles:assign'), async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ error: 'User ID and Role ID are required' });
    }

    const assignment = await rbacService.assignRole(
      userId,
      req.tenant._id,
      roleId,
      req.user._id
    );

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove role from user
router.delete('/assignments/:userId/:roleId', requirePermission('roles:assign'), async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    await rbacService.removeRole(userId, req.tenant._id, roleId);

    res.json({
      success: true,
      message: 'Role removed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users with a specific role
router.get('/roles/:roleId/users', requirePermission('roles:read'), async (req, res) => {
  try {
    const { roleId } = req.params;
    const users = await rbacService.getUsersWithRole(req.tenant._id, roleId);
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user has specific permission
router.post('/check-permission', async (req, res) => {
  try {
    const { permission } = req.body;

    if (!permission) {
      return res.status(400).json({ error: 'Permission is required' });
    }

    const hasPermission = await rbacService.hasPermission(
      req.user._id,
      req.tenant._id,
      permission
    );

    res.json({
      success: true,
      data: { hasPermission }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
