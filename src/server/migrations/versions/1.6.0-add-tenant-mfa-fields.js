'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const mongoose = require('mongoose');
    const { getContext } = require('../../context');

    try {
      // Get the Tenant model from context
      const context = getContext();
      const Tenant = context.getModel('Tenant');

      // Add MFA fields to tenants collection
      await Tenant.updateMany(
        {},
        {
          $set: {
            mfaEnabled: false,
            mfaRequiredForLocalUsers: false,
            mfaMethods: ['totp'],
            mfaGracePeriod: 0
          }
        }
      );

      console.log('✅ Added MFA fields to tenants');
    } catch (error) {
      console.error('❌ Error adding MFA fields to tenants:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const mongoose = require('mongoose');
    const { getContext } = require('../../context');

    try {
      // Get the Tenant model from context
      const context = getContext();
      const Tenant = context.getModel('Tenant');

      // Remove MFA fields from tenants collection
      await Tenant.updateMany(
        {},
        {
          $unset: {
            mfaEnabled: '',
            mfaRequiredForLocalUsers: '',
            mfaMethods: '',
            mfaGracePeriod: ''
          }
        }
      );

      console.log('✅ Removed MFA fields from tenants');
    } catch (error) {
      console.error('❌ Error removing MFA fields from tenants:', error);
      throw error;
    }
  }
};
