const mongoose = require('mongoose');

module.exports = {
  version: '1.9.0',
  name: 'Remove Authy dependencies',
  description: 'Remove authyId field and update mfaMethod enum to remove authy methods',

  async up(db) {
    console.log('Removing Authy dependencies...');

    const User = mongoose.model('User');

    // Remove authyId field from all users
    await User.updateMany(
      {},
      {
        $unset: {
          authyId: '',
        },
      }
    );

    // Update mfaMethod for users who had authy methods to default to totp
    await User.updateMany(
      {
        mfaMethod: { $in: ['authy_sms', 'authy_voice', 'authy_push'] }
      },
      {
        $set: {
          mfaMethod: 'totp',
          mfaSetupCompleted: false,
        },
      }
    );

    console.log('Authy dependencies removed successfully');
  },

  async down(db) {
    console.log('Restoring Authy dependencies...');

    const User = mongoose.model('User');

    // Add authyId field back to all users (set to null)
    await User.updateMany(
      {},
      {
        $set: {
          authyId: null,
        },
      }
    );

    console.log('Authy dependencies restored successfully');
  },
}; 