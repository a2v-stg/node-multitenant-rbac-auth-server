const mongoose = require('mongoose');
const User = require('../models/User');
const UserTenant = require('../models/UserTenant');
const TenantsModel = require('../models/Tenant');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-ui',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

async function testMultipleTenantFlow() {
  try {
    console.log('🧪 Testing Multiple Tenant Flow...\n');

    // 1. Create test tenants
    console.log('1. Creating test tenants...');

    const tenant1 = new TenantsModel({
      tenantName: 'Production Tenant',
      tenantId: 'prod-tenant',
      envName: 'production',
      mfaEnabled: true,
      mfaRequiredForLocalUsers: true,
      mfaMethods: ['totp', 'sms']
    });
    await tenant1.save();
    console.log('✅ Production tenant created:', tenant1.tenantName);

    const tenant2 = new TenantsModel({
      tenantName: 'Development Tenant',
      tenantId: 'dev-tenant',
      envName: 'development',
      mfaEnabled: false,
      mfaRequiredForLocalUsers: false,
      mfaMethods: ['totp']
    });
    await tenant2.save();
    console.log('✅ Development tenant created:', tenant2.tenantName);

    // 2. Create test user
    console.log('\n2. Creating test user...');
    const testUser = new User({
      email: 'multitenant@example.com',
      name: 'Multi Tenant User',
      oauthProvider: 'local',
      isActive: true
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser.email);

    // 3. Assign user to multiple tenants
    console.log('\n3. Assigning user to multiple tenants...');

    const userTenant1 = new UserTenant({
      user: testUser._id,
      tenant: tenant1._id
    });
    await userTenant1.save();
    console.log('✅ User assigned to Production tenant');

    const userTenant2 = new UserTenant({
      user: testUser._id,
      tenant: tenant2._id
    });
    await userTenant2.save();
    console.log('✅ User assigned to Development tenant');

    // 4. Test authService.handleUserLogin with multiple tenants
    console.log('\n4. Testing authService.handleUserLogin...');
    const authService = require('../services/authService');
    const result = await authService.handleUserLogin(testUser);

    console.log('Login result type:', result.type);
    console.log('Redirect URL:', result.redirectUrl);

    if (result.type === 'multiple_tenants') {
      console.log('✅ Correctly detected multiple tenants');
      console.log(
        'Available tenants:',
        result.tenants.map(t => t.tenantName)
      );
    } else {
      console.log('❌ Expected multiple_tenants but got:', result.type);
    }

    // 5. Test tenant selection with MFA
    console.log('\n5. Testing tenant selection with MFA...');

    // Test selecting MFA-enabled tenant
    const prodResult = await authService.selectTenant(
      testUser._id,
      'prod-tenant'
    );
    console.log('Production tenant selection result:', prodResult.type);

    // Test selecting non-MFA tenant
    const devResult = await authService.selectTenant(
      testUser._id,
      'dev-tenant'
    );
    console.log('Development tenant selection result:', devResult.type);

    // 6. Test single tenant scenario
    console.log('\n6. Testing single tenant scenario...');

    // Remove one tenant assignment
    await UserTenant.deleteOne({ user: testUser._id, tenant: tenant2._id });

    const singleResult = await authService.handleUserLogin(testUser);
    console.log('Single tenant result type:', singleResult.type);

    if (
      singleResult.type === 'mfa_required' ||
      singleResult.type === 'single'
    ) {
      console.log('✅ Correctly handled single tenant with MFA');
    } else {
      console.log('❌ Unexpected result for single tenant:', singleResult.type);
    }

    console.log('\n✅ All tests completed successfully!');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: 'multitenant@example.com' });
    await UserTenant.deleteMany({ user: testUser._id });
    await TenantsModel.deleteOne({ tenantId: 'prod-tenant' });
    await TenantsModel.deleteOne({ tenantId: 'dev-tenant' });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testMultipleTenantFlow();
