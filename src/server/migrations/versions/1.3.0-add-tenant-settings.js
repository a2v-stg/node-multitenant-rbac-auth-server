/**
 * Migration: 1.3.0 - Add Tenant Settings
 * Description: Add tenant configuration and settings fields
 * Date: 2024-01-01
 */

module.exports = {
  version: '1.3.0',
  name: 'Add Tenant Settings',
  description: 'Add tenant configuration and settings fields',

  up: async db => {
    const TenantsModel = require('../models/Tenant');

    // Add new fields to existing tenants
    await TenantsModel.updateMany(
      {},
      {
        $set: {
          settings: {},
          features: [],
          isActive: true,
        },
      }
    );
  },

  down: async db => {
    // Rollback tenant settings
    const TenantsModel = require('../models/Tenant');

    await TenantsModel.updateMany(
      {},
      {
        $unset: {
          settings: 1,
          features: 1,
          isActive: 1,
        },
      }
    );
  },
};
