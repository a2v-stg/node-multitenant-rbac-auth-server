require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const TenantsModel = require('../models/Tenant');
const UserTenant = require('../models/UserTenant');
const authService = require('../services/authService');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testMfaSetupPersistence() {
  try {
    console.log('🧪 Testing MFA Setup Persistence...\n');

    // 1. Find a test user
    console.log('1. Finding test user...');
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found. Please create a test user first.');
      return;
    }
    console.log('✅ Found user:', user.email);

    // 2. Check current MFA status
    console.log('\n2. Checking current MFA status...');
    console.log('MFA Method:', user.mfaMethod);
    console.log('MFA Setup Completed:', user.mfaSetupCompleted);
    console.log('TOTP Secret:', user.totpSecret ? 'Set' : 'Not set');
    console.log('Phone Number:', user.phoneNumber || 'Not set');
    console.log('Has MFA Configured:', user.hasMfaConfigured());

    // 3. Check tenant MFA policy
    console.log('\n3. Checking tenant MFA policy...');
    const userTenants = await UserTenant.find({ user: user._id }).populate(
      'tenant'
    );
    if (userTenants.length > 0) {
      const tenant = userTenants[0].tenant;
      console.log('Tenant:', tenant.tenantName);
      console.log('MFA Enabled:', tenant.mfaEnabled);
      console.log(
        'MFA Required for Local Users:',
        tenant.mfaRequiredForLocalUsers
      );
      console.log('MFA Methods:', tenant.mfaMethods);
      console.log('MFA Grace Period:', tenant.mfaGracePeriod, 'days');
    }

    // 4. Test authService.isMfaRequired
    console.log('\n4. Testing MFA requirement logic...');
    if (userTenants.length > 0) {
      const tenant = userTenants[0].tenant;
      const mfaRequired = authService.isMfaRequired(user, tenant);
      console.log('MFA Required:', mfaRequired);
    }

    // 5. Test authService.handleUserLogin
    console.log('\n5. Testing login flow logic...');
    const loginResult = await authService.handleUserLogin(user);
    console.log('Login Result Type:', loginResult.type);
    console.log('Redirect URL:', loginResult.redirectUrl);

    // 6. Simulate MFA setup for TOTP
    console.log('\n6. Simulating TOTP MFA setup...');
    await authService.setupMfaForUser(
      user._id,
      'totp',
      'TEST_SECRET_123456789'
    );

    // 7. Reload user and check MFA status
    console.log('\n7. Checking MFA status after setup...');
    const updatedUser = await User.findById(user._id);
    console.log('MFA Method:', updatedUser.mfaMethod);
    console.log('MFA Setup Completed:', updatedUser.mfaSetupCompleted);
    console.log('TOTP Secret:', updatedUser.totpSecret ? 'Set' : 'Not set');
    console.log('Has MFA Configured:', updatedUser.hasMfaConfigured());

    // 8. Test login flow again
    console.log('\n8. Testing login flow after MFA setup...');
    const loginResultAfterSetup =
      await authService.handleUserLogin(updatedUser);
    console.log('Login Result Type:', loginResultAfterSetup.type);
    console.log('Redirect URL:', loginResultAfterSetup.redirectUrl);

    // 9. Test with different MFA methods
    console.log('\n9. Testing SMS MFA setup...');
    await authService.updateUserPhoneNumber(user._id, '+1234567890', '+1');
    await authService.setupMfaForUser(user._id, 'sms');

    const smsUser = await User.findById(user._id);
    console.log('MFA Method:', smsUser.mfaMethod);
    console.log('MFA Setup Completed:', smsUser.mfaSetupCompleted);
    console.log('Phone Number:', smsUser.phoneNumber);
    console.log('Has MFA Configured:', smsUser.hasMfaConfigured());

    console.log('\n✅ MFA Setup Persistence Test Completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testMfaSetupPersistence();
