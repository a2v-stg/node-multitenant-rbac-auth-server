const mongoose = require('mongoose');

const { Schema } = mongoose;

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Default Organization'
    },
    organizationId: {
      type: String,
      required: true,
      unique: true,
      default: 'default'
    },
    description: {
      type: String,
      default: 'Default organization configuration'
    },
    // Organization-level MFA configuration
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    mfaGracePeriod: {
      type: Number,
      default: 0
    },
    mfaMethods: {
      type: [String],
      default: ['totp']
    },
    mfaRequiredForLocalUsers: {
      type: Boolean,
      default: false
    },
    // Organization-level security settings
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 8
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireLowercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: false
      }
    },
    // Organization-level session settings
    sessionTimeout: {
      type: Number,
      default: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 15 * 60 * 1000 // 15 minutes in milliseconds
    },
    // Organization-level audit settings
    auditLogging: {
      enabled: {
        type: Boolean,
        default: true
      },
      retentionDays: {
        type: Number,
        default: 90
      }
    },
    // Organization-level features
    features: {
      mfa: {
        type: Boolean,
        default: true
      },
      sso: {
        type: Boolean,
        default: false
      },
      auditLogging: {
        type: Boolean,
        default: true
      },
      userManagement: {
        type: Boolean,
        default: true
      }
    },
    // Organization metadata
    contactEmail: {
      type: String
    },
    contactPhone: {
      type: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'organizations',
    timestamps: true
  }
);

// Indexes for better performance
organizationSchema.index({ organizationId: 1 }, { unique: true });
organizationSchema.index({ name: 1 });

// Pre-save middleware to update the updatedAt field
organizationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
organizationSchema.methods.enableMfa = function(methods = ['totp']) {
  this.mfaEnabled = true;
  this.mfaMethods = methods;
  return this.save();
};

organizationSchema.methods.disableMfa = function() {
  this.mfaEnabled = false;
  this.mfaRequiredForLocalUsers = false;
  return this.save();
};

organizationSchema.methods.updateMfaMethods = function(methods) {
  this.mfaMethods = methods;
  return this.save();
};

organizationSchema.methods.setMfaGracePeriod = function(days) {
  this.mfaGracePeriod = days;
  return this.save();
};

// Static methods
organizationSchema.statics.getDefault = function() {
  return this.findOne({ organizationId: 'default' });
};

organizationSchema.statics.createDefault = function() {
  return this.create({
    name: 'Default Organization',
    organizationId: 'default',
    description: 'Default organization configuration'
  });
};

module.exports = mongoose.model('Organization', organizationSchema); 