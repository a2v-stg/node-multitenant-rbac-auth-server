/**
 * Migration: 1.1.0 - Add RBAC System
 * Description: Add Role-Based Access Control with roles, permissions, and user assignments
 * Date: 2024-01-01
 */

const rbacService = require('../../services/rbacService');

module.exports = {
  version: '1.1.0',
  name: 'Add RBAC System',
  description:
    'Add Role-Based Access Control with roles, permissions, and user assignments',

  up: async db => {
    const TenantsModel = require('../models/Tenant');
    const Role = require('../../models/Role');
    const UserRole = require('../../models/UserRole');
    const User = require('../../models/User');
    const UserTenant = require('../../models/UserTenant');

    // Get all tenants
    const tenants = await TenantsModel.find({});

    for (const tenant of tenants) {
      // Initialize RBAC roles for each tenant
      await rbacService.initializeTenantRoles(tenant._id);

      // Get users in this tenant
      const userTenants = await UserTenant.find({ tenant: tenant._id });

      for (const userTenant of userTenants) {
        // Check if user already has roles
        const existingRoles = await UserRole.find({
          user: userTenant.user,
          tenant: tenant._id,
        });

        if (existingRoles.length === 0) {
          // Assign default 'User' role
          const defaultRole = await Role.findOne({
            tenant: tenant._id,
            name: 'User',
          });

          if (defaultRole) {
            await rbacService.assignRole(
              userTenant.user,
              tenant._id,
              defaultRole._id
            );
          }
        }
      }
    }
  },

  down: async db => {
    // Rollback RBAC system
    const UserRole = require('../../models/UserRole');
    const Role = require('../../models/Role');

    await UserRole.deleteMany({});
    await Role.deleteMany({});
  },
};
