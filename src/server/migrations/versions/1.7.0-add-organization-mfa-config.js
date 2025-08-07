'use strict';

module.exports = {
  version: '1.7.0',
  name: 'add-organization-mfa-config',
  description: 'Add organization MFA configuration fields to tenants',
  
  up: async (queryInterface, Sequelize) => {
    const mongoose = require('mongoose');
    const Tenant = require('../../models/Tenant');

    try {
      // Add organization MFA fields to tenants collection
      await Tenant.updateMany(
        {},
        {
          $set: {
            organizationMfaEnabled: false,
            organizationMfaRequiredForLocalUsers: false,
            organizationMfaMethods: ['totp'],
            organizationMfaGracePeriod: 0,
          },
        }
      );

      console.log('✅ Added organization MFA fields to tenants');
    } catch (error) {
      console.error('❌ Error adding organization MFA fields to tenants:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const mongoose = require('mongoose');
    const Tenant = require('../../models/Tenant');

    try {
      // Remove organization MFA fields from tenants collection
      await Tenant.updateMany(
        {},
        {
          $unset: {
            organizationMfaEnabled: '',
            organizationMfaRequiredForLocalUsers: '',
            organizationMfaMethods: '',
            organizationMfaGracePeriod: '',
          },
        }
      );

      console.log('✅ Removed organization MFA fields from tenants');
    } catch (error) {
      console.error('❌ Error removing organization MFA fields from tenants:', error);
      throw error;
    }
  },
};
