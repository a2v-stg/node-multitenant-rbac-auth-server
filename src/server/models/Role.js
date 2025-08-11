const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tenants',
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    permissions: [
      {
        type: String,
        trim: true
      }
    ],
    parentRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for better performance
RoleSchema.index({ tenant: 1, name: 1 }, { unique: true });
RoleSchema.index({ tenant: 1, isActive: 1 });

// Method to get all permissions including inherited ones
RoleSchema.methods.getAllPermissions = async function () {
  const permissions = new Set(this.permissions);

  if (this.parentRole) {
    const parent = await mongoose.model('Role').findById(this.parentRole);
    if (parent) {
      const parentPermissions = await parent.getAllPermissions();
      parentPermissions.forEach(permission => permissions.add(permission));
    }
  }

  return Array.from(permissions);
};

// Method to check if role has a specific permission
RoleSchema.methods.hasPermission = async function (permission) {
  const allPermissions = await this.getAllPermissions();
  return allPermissions.includes(permission);
};

module.exports = mongoose.model('Role', RoleSchema);
