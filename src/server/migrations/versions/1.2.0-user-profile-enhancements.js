/**
 * Migration: 1.2.0 - User Profile Enhancements
 * Description: Add enhanced user profile fields for OAuth integration
 * Date: 2024-01-01
 */

module.exports = {
  version: '1.2.0',
  name: 'User Profile Enhancements',
  description: 'Add enhanced user profile fields for OAuth integration',

  up: async db => {
    const User = require('../../models/User');

    // Update existing users with new fields
    const usersToUpdate = await User.find({
      $or: [
        { oauthProvider: { $exists: false } },
        { isActive: { $exists: false } },
        { lastLogin: { $exists: false } }
      ]
    });

    for (const user of usersToUpdate) {
      const updates = {};

      if (!user.oauthProvider) {
        updates.oauthProvider = 'local';
      }

      if (!user.isActive) {
        updates.isActive = true;
      }

      if (!user.lastLogin) {
        updates.lastLogin = user.createdAt || new Date();
      }

      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
      }
    }
  },

  down: async db => {
    // Rollback user profile enhancements
    const User = require('../../models/User');

    await User.updateMany(
      {},
      {
        $unset: {
          oauthProvider: 1,
          isActive: 1,
          lastLogin: 1,
          name: 1,
          firstName: 1,
          lastName: 1,
          picture: 1,
          oauthId: 1,
          metadata: 1
        }
      }
    );
  }
};
