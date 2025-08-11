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

async function debugLoginFlow() {
  try {
    console.log('🔍 Debugging Login Flow...\n');

    // 1. Check if default tenant exists
    console.log('1. Checking default tenant...');
    const defaultTenant = await TenantsModel.findOne({ tenantId: 'default' });
    if (defaultTenant) {
      console.log('✅ Default tenant found:', defaultTenant.tenantName);
    } else {
      console.log('❌ Default tenant not found - this will cause login issues');
    }

    // 2. Check for test users
    console.log('\n2. Checking test users...');
    const testUsers = await User.find({ email: { $regex: /test|admin/ } });
    console.log(
      'Found test users:',
      testUsers.map(u => u.email)
    );

    if (testUsers.length === 0) {
      console.log('❌ No test users found. Creating one...');
      const testUser = new User({
        email: 'test@example.com',
        name: 'Test User',
        oauthProvider: 'local',
        isActive: true
      });
      await testUser.save();
      console.log('✅ Test user created:', testUser.email);
    }

    // 3. Test authService.handleUserLogin
    console.log('\n3. Testing authService.handleUserLogin...');
    const authService = require('../services/authService');

    for (const user of testUsers) {
      console.log(`\nTesting login for user: ${user.email}`);

      try {
        const result = await authService.handleUserLogin(user);
        console.log('  Result type:', result.type);
        console.log('  Redirect URL:', result.redirectUrl);

        if (result.tenant) {
          console.log('  Selected tenant:', result.tenant.tenantName);
        }

        if (result.tenants) {
          console.log(
            '  Available tenants:',
            result.tenants.map(t => t.tenantName)
          );
        }
      } catch (error) {
        console.log('  ❌ Error:', error.message);
      }
    }

    // 4. Check user-tenant relationships
    console.log('\n4. Checking user-tenant relationships...');
    const userTenants = await UserTenant.find()
      .populate('user')
      .populate('tenant');
    console.log(
      'User-tenant relationships:',
      userTenants.map(ut => ({
        user: ut.user.email,
        tenant: ut.tenant.tenantName
      }))
    );

    // 5. Test tenant selection
    console.log('\n5. Testing tenant selection...');
    if (testUsers.length > 0 && defaultTenant) {
      const user = testUsers[0];
      try {
        const result = await authService.selectTenant(user._id, 'default');
        console.log('  Tenant selection result:', result.type);
        if (result.tenant) {
          console.log('  Selected tenant:', result.tenant.tenantName);
        }
      } catch (error) {
        console.log('  ❌ Tenant selection error:', error.message);
      }
    }

    console.log('\n✅ Debug completed!');
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the debug
debugLoginFlow();
