const mongoose = require('mongoose');

const UserRoleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tenants',
      required: true
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for better performance
UserRoleSchema.index({ user: 1, tenant: 1, role: 1 }, { unique: true });
UserRoleSchema.index({ user: 1, tenant: 1, isActive: 1 });
UserRoleSchema.index({ tenant: 1, role: 1 });

// Method to check if role assignment is still valid
UserRoleSchema.methods.isValid = function () {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
};

module.exports = mongoose.model('UserRole', UserRoleSchema);
