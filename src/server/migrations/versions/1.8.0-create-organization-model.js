'use strict';

module.exports = {
  version: '1.8.0',
  name: 'create-organization-model',
  description: 'Create Organization model and migrate organization-level MFA configuration',

  up: async (queryInterface, Sequelize) => {
    const mongoose = require('mongoose');
    const Tenant = require('../../models/Tenant');

    try {
      // Remove organization MFA fields from tenants (organization already created manually)
      const result = await Tenant.updateMany(
        {},
        {
          $unset: {
            organizationMfaEnabled: '',
            organizationMfaRequiredForLocalUsers: '',
            organizationMfaMethods: '',
            organizationMfaGracePeriod: ''
          }
        }
      );

      console.log(`✅ Removed organization MFA fields from ${result.modifiedCount} tenants`);
      console.log('✅ Organization model migration completed successfully');
    } catch (error) {
      console.error('❌ Error in organization model migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const mongoose = require('mongoose');
    const Tenant = require('../../models/Tenant');

    try {
      // Restore organization MFA fields to tenants with default values
      const result = await Tenant.updateMany(
        {},
        {
          $set: {
            organizationMfaEnabled: false,
            organizationMfaRequiredForLocalUsers: false,
            organizationMfaMethods: ['totp'],
            organizationMfaGracePeriod: 0
          }
        }
      );

      console.log(`✅ Restored organization MFA fields to ${result.modifiedCount} tenants`);
      console.log('✅ Organization model migration rolled back successfully');
    } catch (error) {
      console.error('❌ Error rolling back organization model migration:', error);
      throw error;
    }
  }
};
