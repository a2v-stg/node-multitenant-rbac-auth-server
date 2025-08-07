const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');

const UserTenantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
UserTenantSchema.index({ user: 1, tenant: 1 }, { unique: true });
UserTenantSchema.index({ user: 1 });
UserTenantSchema.index({ tenant: 1 });

module.exports = mongoose.model('UserTenant', UserTenantSchema);
