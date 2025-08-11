const express = require('express');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { validateTenantAccess } = require('../middleware/tenantValidation');
const { addUserPermissions } = require('../middleware/rbacMiddleware');
const { getContext } = require('../context');

const bcrypt = require('bcrypt');
const router = express.Router();

// Helper function to get models
const getModels = () => {
  const context = getContext();
  return {
    User: context.getModel('User'),
    Tenant: context.getModel('Tenant'),
    UserTenant: context.getModel('UserTenant'),
    Role: context.getModel('Role'),
    UserRole: context.getModel('UserRole')
  };
};

// Helper function to check if user is in default tenant
const isDefaultTenantUser = req => {
  return req.session.tenantId === 'default';
};

// Helper function to clean up orphaned UserTenant records
const cleanupOrphanedUserTenants = async () => {
  try {
    const { UserTenant } = getModels();
    const userTenants = await UserTenant.find().populate('user');
    const orphanedRecords = userTenants.filter(ut => ut.user === null);

    if (orphanedRecords.length > 0) {
      console.log(
        `Cleaning up ${orphanedRecords.length} orphaned UserTenant records`
      );
      await UserTenant.deleteMany({
        _id: { $in: orphanedRecords.map(ut => ut._id) }
      });
    }
  } catch (error) {
    console.error('Error cleaning up orphaned UserTenant records:', error);
  }
};

// Get all users for current tenant
router.get('/', ensureAuthenticated, addUserPermissions, async (req, res) => {
  try {
    const { Tenant, UserTenant, UserRole } = getModels();
    const currentTenant = await Tenant.findOne({
      tenantId: req.session.tenantId
    });
    if (!currentTenant) {
      return res.status(404).json({ error: 'Current tenant not found' });
    }

    // Clean up orphaned records
    await cleanupOrphanedUserTenants();

    // Get users for current tenant
    const userTenants = await UserTenant.find({
      tenant: currentTenant._id
    }).populate('user');

    // Filter out orphaned records where user is null
    const validUserTenants = userTenants.filter(ut => ut.user !== null);

    // Get roles for each user
    const users = await Promise.all(
      validUserTenants.map(async ut => {
        const userRoles = await UserRole.find({
          user: ut.user._id,
          tenant: currentTenant._id
        }).populate('role');

        return {
          _id: ut.user._id,
          email: ut.user.email,
          fullName: ut.user.fullName,
          isActive: ut.user.isActive,
          lastLogin: ut.user.lastLogin,
          oauthProvider: ut.user.oauthProvider,
          roles: userRoles.map(ur => ur.role),
          createdAt: ut.user.createdAt
        };
      })
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available roles for current tenant
router.get(
  '/roles',
  ensureAuthenticated,
  addUserPermissions,
  async (req, res) => {
    try {
      const { Role, Tenant } = getModels();
      const currentTenant = await Tenant.findOne({
        tenantId: req.session.tenantId
      });
      if (!currentTenant) {
        return res.status(404).json({ error: 'Current tenant not found' });
      }

      const roles = await Role.find({ tenant: currentTenant._id }).sort({
        name: 1
      });

      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get single user
router.get(
  '/:id',
  ensureAuthenticated,
  addUserPermissions,
  async (req, res) => {
    try {
      const { User, Tenant, UserTenant, UserRole } = getModels();
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user belongs to current tenant
      const currentTenant = await Tenant.findOne({
        tenantId: req.session.tenantId
      });
      const userTenant = await UserTenant.findOne({
        user: user._id,
        tenant: currentTenant._id
      });

      if (!userTenant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get user roles for current tenant
      const userRoles = await UserRole.find({
        user: user._id,
        tenant: currentTenant._id
      }).populate('role');

      res.json({
        success: true,
        data: {
          user,
          roles: userRoles.map(ur => ur.role)
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create new user
router.post('/', ensureAuthenticated, addUserPermissions, async (req, res) => {
  try {
    // Only default tenant users can create users
    if (!isDefaultTenantUser(req)) {
      return res.status(403).json({
        error: 'Access denied. Only default tenant users can create users.'
      });
    }

    const { User, Tenant, UserTenant, UserRole } = getModels();
    const { email, password, fullName, tenantId, roles } = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !tenantId) {
      return res.status(400).json({
        error: 'Email, password, full name, and tenant are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Validate tenant exists
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(400).json({
        error: 'Specified tenant does not exist'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      fullName,
      isActive: true
    });

    await user.save();

    // Assign user to tenant
    const userTenant = new UserTenant({
      user: user._id,
      tenant: tenant._id
    });

    await userTenant.save();

    // Assign roles if specified
    if (roles && roles.length > 0) {
      const roleAssignments = roles.map(roleId => ({
        user: user._id,
        tenant: tenant._id,
        role: roleId
      }));

      await UserRole.insertMany(roleAssignments);
    }

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put(
  '/:id',
  ensureAuthenticated,
  addUserPermissions,
  async (req, res) => {
    try {
      const { User, Tenant, UserTenant, UserRole } = getModels();
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user belongs to current tenant
      const currentTenant = await Tenant.findOne({
        tenantId: req.session.tenantId
      });
      const userTenant = await UserTenant.findOne({
        user: user._id,
        tenant: currentTenant._id
      });

      if (!userTenant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { email, fullName, isActive, password, roles } = req.body;

      // Update fields
      if (email !== undefined) user.email = email;
      if (fullName !== undefined) user.fullName = fullName;
      if (isActive !== undefined) user.isActive = isActive;

      // Update password if provided
      if (password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(password, saltRounds);
      }

      await user.save();

      // Update roles if specified
      if (roles !== undefined) {
        // Remove existing roles
        await UserRole.deleteMany({
          user: user._id,
          tenant: currentTenant._id
        });

        // Add new roles
        if (roles.length > 0) {
          const roleAssignments = roles.map(roleId => ({
            user: user._id,
            tenant: currentTenant._id,
            role: roleId
          }));

          await UserRole.insertMany(roleAssignments);
        }
      }

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete user
router.delete(
  '/:id',
  ensureAuthenticated,
  addUserPermissions,
  async (req, res) => {
    try {
      // Only default tenant users can delete users
      if (!isDefaultTenantUser(req)) {
        return res.status(403).json({
          error: 'Access denied. Only default tenant users can delete users.'
        });
      }

      const { User, Tenant, UserTenant, UserRole } = getModels();
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user belongs to current tenant
      const currentTenant = await Tenant.findOne({
        tenantId: req.session.tenantId
      });
      const userTenant = await UserTenant.findOne({
        user: user._id,
        tenant: currentTenant._id
      });

      if (!userTenant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Remove user from tenant
      await UserTenant.deleteMany({ user: user._id });

      // Remove user roles
      await UserRole.deleteMany({ user: user._id });

      // Delete user
      await User.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get user's current tenants
router.get(
  '/:id/tenants',
  ensureAuthenticated,
  addUserPermissions,
  async (req, res) => {
    try {
      // Only default tenant users can view user tenants
      if (!isDefaultTenantUser(req)) {
        return res.status(403).json({
          error:
            'Access denied. Only default tenant users can view user tenants.'
        });
      }

      const { User, Tenant, UserTenant } = getModels();
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get all tenants for this user
      const userTenants = await UserTenant.find({ user: user._id }).populate(
        'tenant'
      );

      const tenants = userTenants.map(ut => ({
        id: ut.tenant._id,
        tenantId: ut.tenant.tenantId,
        tenantName: ut.tenant.tenantName,
        envName: ut.tenant.envName
      }));

      res.json({
        success: true,
        data: tenants
      });
    } catch (error) {
      console.error('Error fetching user tenants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Assign tenant to user
router.post(
  '/:id/assign-tenant',
  ensureAuthenticated,
  addUserPermissions,
  async (req, res) => {
    try {
      // Only default tenant users can assign tenants
      if (!isDefaultTenantUser(req)) {
        return res.status(403).json({
          error: 'Access denied. Only default tenant users can assign tenants.'
        });
      }

      const { User, Tenant, UserTenant } = getModels();
      const { tenantId } = req.body;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const tenant = await Tenant.findOne({ tenantId });
      console.log('tenant', tenant);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      const criteria = {
        user: user._id,
        tenant: tenant._id
      };
      console.log('criteria', criteria);

      // Check if user is already assigned to this tenant
      const existingAssignment = await UserTenant.findOne(criteria);

      if (existingAssignment) {
        return res.status(400).json({
          error: 'User is already assigned to this tenant'
        });
      }

      // Assign user to tenant
      const userTenant = new UserTenant(criteria);

      await userTenant.save();

      res.json({
        success: true,
        message: `User ${user.email} assigned to tenant ${tenant.tenantName}`,
        data: {
          userId: user._id,
          tenantId: tenant.tenantId,
          tenantName: tenant.tenantName
        }
      });
    } catch (error) {
      console.error('Error assigning tenant to user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Remove tenant from user
router.delete(
  '/:id/remove-tenant/:tenantId',
  ensureAuthenticated,
  addUserPermissions,
  async (req, res) => {
    try {
      // Only default tenant users can remove tenant assignments
      if (!isDefaultTenantUser(req)) {
        return res.status(403).json({
          error:
            'Access denied. Only default tenant users can remove tenant assignments.'
        });
      }

      const { User, Tenant, UserTenant, UserRole } = getModels();
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const tenant = await Tenant.findOne({
        tenantId: req.params.tenantId
      });
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Check if user is assigned to this tenant
      const userTenant = await UserTenant.findOne({
        user: user._id,
        tenant: tenant._id
      });

      if (!userTenant) {
        return res.status(400).json({
          error: 'User is not assigned to this tenant'
        });
      }

      // Remove user from tenant
      await UserTenant.deleteOne({
        user: user._id,
        tenant: tenant._id
      });

      // Remove user roles for this tenant
      await UserRole.deleteMany({
        user: user._id,
        tenant: tenant._id
      });

      res.json({
        success: true,
        message: `User ${user.email} removed from tenant ${tenant.tenantName}`
      });
    } catch (error) {
      console.error('Error removing tenant from user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
