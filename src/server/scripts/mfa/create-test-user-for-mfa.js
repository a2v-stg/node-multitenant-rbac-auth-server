require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const TenantsModel = require('../models/Tenant');
const UserTenant = require('../models/UserTenant');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createTestUser() {
  try {
    console.log('🧪 Creating test user for MFA testing...\n');

    // 1. Check if test user already exists
    console.log('1. Checking if test user exists...');
    let user = await User.findOne({ email: 'test@example.com' });

    if (user) {
      console.log('✅ Test user already exists:', user.email);
    } else {
      // 2. Create test user
      console.log('2. Creating new test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);

      user = new User({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        oauthProvider: 'local',
        isActive: true
      });

      await user.save();
      console.log('✅ Test user created:', user.email);
    }

    // 3. Check if default tenant exists
    console.log('\n3. Checking default tenant...');
    let tenant = await TenantsModel.findOne({ tenantId: 'default' });

    if (!tenant) {
      console.log('4. Creating default tenant...');
      tenant = new TenantsModel({
        tenantId: 'default',
        tenantName: 'Default Tenant',
        envName: 'default',
        allowedModules: [
          'watch-list',
          'socure',
          'doc-check',
          'lira-watch-list',
          'etran-watch-list',
          'do-not-pay',
          'doc-copilot-check'
        ],
        mfaEnabled: true,
        mfaRequiredForLocalUsers: true,
        mfaMethods: ['totp', 'sms', 'voice'],
        mfaGracePeriod: 7
      });

      await tenant.save();
      console.log('✅ Default tenant created');
    } else {
      console.log('✅ Default tenant exists');
    }

    // 4. Check user-tenant relationship
    console.log('\n5. Checking user-tenant relationship...');
    let userTenant = await UserTenant.findOne({
      user: user._id,
      tenant: tenant._id
    });

    if (!userTenant) {
      console.log('6. Creating user-tenant relationship...');
      userTenant = new UserTenant({
        user: user._id,
        tenant: tenant._id
      });

      await userTenant.save();
      console.log('✅ User-tenant relationship created');
    } else {
      console.log('✅ User-tenant relationship exists');
    }

    // 5. Display final status
    console.log('\n7. Final status:');
    console.log('User:', user.email);
    console.log('User MFA Method:', user.mfaMethod);
    console.log('User MFA Setup Completed:', user.mfaSetupCompleted);
    console.log('Tenant:', tenant.tenantName);
    console.log('Tenant MFA Enabled:', tenant.mfaEnabled);
    console.log(
      'Tenant MFA Required for Local Users:',
      tenant.mfaRequiredForLocalUsers
    );

    console.log('\n✅ Test user setup completed!');
    console.log('You can now login with:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the function
createTestUser();
