const mongoose = require('mongoose');
const TenantsModel = require('../models/Tenant');
const User = require('../models/User');
const UserTenant = require('../models/UserTenant');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-ui',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

async function testTenantMfa() {
  try {
    console.log('🧪 Testing Tenant MFA Functionality...\n');

    // 1. Create a test tenant with MFA enabled
    console.log('1. Creating test tenant with MFA enabled...');
    const testTenant = new TenantsModel({
      tenantName: 'Test MFA Tenant',
      tenantId: 'test-mfa-tenant',
      envName: 'test',
      mfaEnabled: true,
      mfaRequiredForLocalUsers: true,
      mfaMethods: ['totp', 'sms'],
      mfaGracePeriod: 7
    });
    await testTenant.save();
    console.log('✅ Test tenant created:', testTenant.tenantName);

    // 2. Create a test user
    console.log('\n2. Creating test user...');
    const testUser = new User({
      email: 'test@example.com',
      name: 'Test User',
      oauthProvider: 'local'
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser.email);

    // 3. Associate user with tenant
    console.log('\n3. Associating user with tenant...');
    const userTenant = new UserTenant({
      user: testUser._id,
      tenant: testTenant._id
    });
    await userTenant.save();
    console.log('✅ User associated with tenant');

    // 4. Test MFA requirement logic
    console.log('\n4. Testing MFA requirement logic...');
    const authService = require('../services/authService');

    // Test with MFA enabled
    const mfaRequired = authService.isMfaRequired(testUser, testTenant);
    console.log('MFA Required:', mfaRequired);
    console.log('User has MFA configured:', testUser.hasMfaConfigured());

    // 5. Test with MFA disabled
    console.log('\n5. Testing with MFA disabled...');
    testTenant.mfaEnabled = false;
    testTenant.mfaRequiredForLocalUsers = false;
    await testTenant.save();

    const mfaRequiredDisabled = authService.isMfaRequired(testUser, testTenant);
    console.log('MFA Required (disabled):', mfaRequiredDisabled);

    // 6. Test OAuth user (should always skip MFA)
    console.log('\n6. Testing OAuth user...');
    const oauthUser = new User({
      email: 'oauth@example.com',
      name: 'OAuth User',
      oauthProvider: 'oauth2'
    });
    await oauthUser.save();

    const oauthMfaRequired = authService.isMfaRequired(oauthUser, testTenant);
    console.log('OAuth user MFA required:', oauthMfaRequired);

    // 7. Test grace period
    console.log('\n7. Testing grace period...');
    testTenant.mfaEnabled = true;
    testTenant.mfaRequiredForLocalUsers = true;
    testTenant.mfaGracePeriod = 7;
    await testTenant.save();

    // User created within grace period
    const newUser = new User({
      email: 'newuser@example.com',
      name: 'New User',
      oauthProvider: 'local',
      createdAt: new Date() // Current time
    });
    await newUser.save();

    const gracePeriodMfaRequired = authService.isMfaRequired(
      newUser,
      testTenant
    );
    console.log(
      'New user MFA required (within grace period):',
      gracePeriodMfaRequired
    );

    // 8. Test user with MFA configured
    console.log('\n8. Testing user with MFA configured...');
    testUser.mfaMethod = 'totp';
    testUser.totpSecret = 'test-secret';
    testUser.mfaSetupCompleted = true;
    await testUser.save();

    const configuredUserMfaRequired = authService.isMfaRequired(
      testUser,
      testTenant
    );
    console.log('Configured user MFA required:', configuredUserMfaRequired);
    console.log('User has MFA configured:', testUser.hasMfaConfigured());

    console.log('\n✅ All tests completed successfully!');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteMany({
      email: {
        $in: ['test@example.com', 'oauth@example.com', 'newuser@example.com']
      }
    });
    await UserTenant.deleteMany({ tenant: testTenant._id });
    await TenantsModel.deleteOne({ tenantId: 'test-mfa-tenant' });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testTenantMfa();
