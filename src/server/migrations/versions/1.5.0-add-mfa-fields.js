const mongoose = require('mongoose');

module.exports = {
  version: '1.5.0',
  name: 'Add MFA migrations',
  description: 'Add MFA fields to User model',

  async up(db) {
    console.log('Adding MFA fields to User model...');

    const User = mongoose.model('User');

    // Add MFA fields to all existing users
    await User.updateMany(
      {},
      {
        $set: {
          mfaEnabled: false,
          mfaMethod: 'totp',
          phoneNumber: null,
          countryCode: '+1',
          authyId: null,
          totpSecret: null,
          mfaSetupCompleted: false
        }
      }
    );

    console.log('MFA fields added successfully');
  },

  async down(db) {
    console.log('Removing MFA fields from User model...');

    const User = mongoose.model('User');

    // Remove MFA fields from all users
    await User.updateMany(
      {},
      {
        $unset: {
          mfaEnabled: '',
          mfaMethod: '',
          phoneNumber: '',
          countryCode: '',
          authyId: '',
          totpSecret: '',
          mfaSetupCompleted: ''
        }
      }
    );

    console.log('MFA fields removed successfully');
  }
};
