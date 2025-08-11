const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: false
    },
    name: {
      type: String,
      trim: true
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    picture: {
      type: String,
      trim: true
    },
    oauthProvider: {
      type: String,
      enum: ['local', 'oauth2'],
      default: 'local'
    },
    oauthId: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    // MFA Configuration (user-level storage, tenant-controlled)
    mfaMethod: {
      type: String,
      enum: ['totp', 'sms', 'voice', 'email'],
      default: 'totp'
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    countryCode: {
      type: String,
      default: '+1',
      trim: true
    },
    totpSecret: {
      type: String,
      trim: true
    },
    mfaSetupCompleted: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// Add indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ oauthId: 1 });
UserSchema.index({ oauthProvider: 1 });
UserSchema.index({ mfaSetupCompleted: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || this.email;
});

// Virtual to check if MFA is required for this user (depends on tenant policy)
UserSchema.virtual('requiresMfa').get(function () {
  // This will be determined by tenant policy, not user preference
  // OAuth users always skip MFA
  return this.oauthProvider === 'local';
});

// Method to update user info from OAuth profile
UserSchema.methods.updateFromOAuthProfile = function (profileData) {
  this.name = profileData.name || this.name;
  this.firstName =
    profileData.given_name || profileData.first_name || this.firstName;
  this.lastName =
    profileData.family_name || profileData.last_name || this.lastName;
  this.picture = profileData.picture || profileData.avatar_url || this.picture;
  this.oauthProvider = 'oauth2';
  this.oauthId = profileData.sub || profileData.id || this.oauthId;
  this.lastLogin = new Date();
  this.metadata = { ...this.metadata, ...profileData };
  return this.save();
};

// Method to setup MFA for user
UserSchema.methods.setupMfa = function (method, secret = null) {
  this.mfaMethod = method;
  this.mfaSetupCompleted = true;

  if (method === 'totp' && secret) {
    this.totpSecret = secret;
  }

  return this.save();
};

// Method to update phone number for SMS/Voice MFA
UserSchema.methods.updatePhoneNumber = function (
  phoneNumber,
  countryCode = '+1'
) {
  this.phoneNumber = phoneNumber;
  this.countryCode = countryCode;
  return this.save();
};

// Method to check if user has MFA configured
UserSchema.methods.hasMfaConfigured = function () {
  if (this.mfaMethod === 'totp') {
    return this.totpSecret && this.mfaSetupCompleted;
  } else if (this.mfaMethod === 'sms' || this.mfaMethod === 'voice') {
    return this.phoneNumber && this.mfaSetupCompleted;
  } else if (this.mfaMethod === 'email') {
    return this.email && this.mfaSetupCompleted;
  }
  return false;
};

module.exports = mongoose.model('User', UserSchema);
