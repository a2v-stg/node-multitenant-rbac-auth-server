const { getContext } = require('../context');
const { PREDEFINED_ROLES } = require('../config/permissions');

class RBACService {
  constructor() {
    this.context = null;
    this.models = null;
  }

  _getContext() {
    if (!this.context) {
      this.context = getContext();
    }
    return this.context;
  }

  _getModels() {
    if (!this.models) {
      const context = this._getContext();
      this.models = {
        UserRole: context.getModel('UserRole'),
        Role: context.getModel('Role'),
        User: context.getModel('User'),
        Tenant: context.getModel('Tenant')
      };
    }
    return this.models;
  }

  // Check if user has a specific permission in a tenant
  async hasPermission(userId, tenantId, permission) {
    try {
      const { UserRole } = this._getModels();
      const userRoles = await UserRole.find({
        user: userId,
        tenant: tenantId,
        isActive: true
      }).populate('role');

      for (const userRole of userRoles) {
        if (!userRole.isValid()) continue;

        const role = userRole.role;
        if (role && (await role.hasPermission(permission))) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // Get all permissions for a user in a tenant
  async getUserPermissions(userId, tenantId) {
    try {
      const { UserRole } = this._getModels();
      const userRoles = await UserRole.find({
        user: userId,
        tenant: tenantId,
        isActive: true
      }).populate('role');

      const permissions = new Set();

      for (const userRole of userRoles) {
        if (!userRole.isValid()) continue;

        const role = userRole.role;
        if (role) {
          const rolePermissions = await role.getAllPermissions();
          rolePermissions.forEach(permission => permissions.add(permission));
        }
      }

      return Array.from(permissions);
    } catch (error) {
      console.error('Get user permissions error:', error);
      return [];
    }
  }

  // Get all roles for a user in a tenant
  async getUserRoles(userId, tenantId) {
    try {
      const { UserRole } = this._getModels();
      const userRoles = await UserRole.find({
        user: userId,
        tenant: tenantId,
        isActive: true
      }).populate('role');

      return userRoles.filter(ur => ur.isValid()).map(ur => ur.role);
    } catch (error) {
      console.error('Get user roles error:', error);
      return [];
    }
  }

  // Assign a role to a user in a tenant
  async assignRole(userId, tenantId, roleId, assignedBy = null) {
    try {
      const { UserRole, Role } = this._getModels();
      // Check if role exists and belongs to tenant
      const role = await Role.findOne({ _id: roleId, tenant: tenantId });
      if (!role) {
        throw new Error('Role not found or does not belong to tenant');
      }

      // Check if assignment already exists
      const existingAssignment = await UserRole.findOne({
        user: userId,
        tenant: tenantId,
        role: roleId
      });

      if (existingAssignment) {
        // Update existing assignment
        existingAssignment.isActive = true;
        existingAssignment.assignedBy = assignedBy;
        existingAssignment.expiresAt = null;
        return await existingAssignment.save();
      } else {
        // Create new assignment
        return await UserRole.create({
          user: userId,
          tenant: tenantId,
          role: roleId,
          assignedBy
        });
      }
    } catch (error) {
      throw new Error(`Role assignment failed: ${error.message}`);
    }
  }

  // Remove a role from a user in a tenant
  async removeRole(userId, tenantId, roleId) {
    try {
      const { UserRole } = this._getModels();
      const result = await UserRole.updateOne(
        { user: userId, tenant: tenantId, role: roleId },
        { isActive: false }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Role assignment not found');
      }

      return true;
    } catch (error) {
      throw new Error(`Role removal failed: ${error.message}`);
    }
  }

  // Create a new role in a tenant
  async createRole(tenantId, roleData) {
    try {
      const { Role } = this._getModels();
      const role = new Role({
        ...roleData,
        tenant: tenantId
      });

      return await role.save();
    } catch (error) {
      throw new Error(`Role creation failed: ${error.message}`);
    }
  }

  // Get all roles in a tenant
  async getTenantRoles(tenantId) {
    try {
      const { Role } = this._getModels();
      return await Role.find({ tenant: tenantId, isActive: true });
    } catch (error) {
      console.error('Get tenant roles error:', error);
      return [];
    }
  }

  // Initialize default roles for a tenant
  async initializeTenantRoles(tenantId) {
    try {
      const { Role } = this._getModels();
      const existingRoles = await Role.find({ tenant: tenantId });
      if (existingRoles.length > 0) {
        return existingRoles; // Already initialized
      }

      const roles = [];
      for (const [key, roleData] of Object.entries(PREDEFINED_ROLES)) {
        const role = await this.createRole(tenantId, {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          isSystem: roleData.isSystem
        });
        roles.push(role);
      }

      return roles;
    } catch (error) {
      throw new Error(`Tenant role initialization failed: ${error.message}`);
    }
  }

  // Check if user has any of the specified permissions
  async hasAnyPermission(userId, tenantId, permissions) {
    const userPermissions = await this.getUserPermissions(userId, tenantId);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  // Check if user has all of the specified permissions
  async hasAllPermissions(userId, tenantId, permissions) {
    const userPermissions = await this.getUserPermissions(userId, tenantId);
    return permissions.every(permission =>
      userPermissions.includes(permission)
    );
  }

  // Get users with a specific role in a tenant
  async getUsersWithRole(tenantId, roleId) {
    try {
      const { UserRole } = this._getModels();
      const userRoles = await UserRole.find({
        tenant: tenantId,
        role: roleId,
        isActive: true
      }).populate('user');

      return userRoles.filter(ur => ur.isValid()).map(ur => ur.user);
    } catch (error) {
      console.error('Get users with role error:', error);
      return [];
    }
  }

  // Get role by ID
  async getRoleById(roleId) {
    try {
      const { Role } = this._getModels();
      return await Role.findById(roleId);
    } catch (error) {
      console.error('Get role by ID error:', error);
      return null;
    }
  }

  // Update a role
  async updateRole(roleId, roleData) {
    try {
      const { Role } = this._getModels();
      const role = await Role.findById(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      Object.assign(role, roleData);
      role.updatedAt = new Date();
      return await role.save();
    } catch (error) {
      throw new Error(`Role update failed: ${error.message}`);
    }
  }

  // Delete a role
  async deleteRole(roleId) {
    try {
      const { Role } = this._getModels();
      const result = await Role.findByIdAndDelete(roleId);
      if (!result) {
        throw new Error('Role not found');
      }
      return result;
    } catch (error) {
      throw new Error(`Role deletion failed: ${error.message}`);
    }
  }

  // Get all users in a tenant
  async getTenantUsers(tenantId) {
    try {
      const { User } = this._getModels();
      return await User.find({ tenant: tenantId, isActive: true }).select('-password');
    } catch (error) {
      console.error('Get tenant users error:', error);
      return [];
    }
  }
}

module.exports = new RBACService();
