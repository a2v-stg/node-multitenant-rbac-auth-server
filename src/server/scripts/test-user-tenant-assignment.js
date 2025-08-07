const mongoose = require('mongoose');
const User = require('../models/User');
const UserTenant = require('../models/UserTenant');
const TenantsModel = require('../models/Tenant');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-ui',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function testUserTenantAssignment() {
  try {
    console.log('🧪 Testing User Tenant Assignment...\n');

    // 1. Create test tenants
    console.log('1. Creating test tenants...');
    const tenant1 = new TenantsModel({
      tenantName: 'Test Tenant 1',
      tenantId: 'test-tenant-1',
      envName: 'test1',
    });
    await tenant1.save();
    console.log('✅ Test tenant 1 created:', tenant1.tenantName);

    const tenant2 = new TenantsModel({
      tenantName: 'Test Tenant 2',
      tenantId: 'test-tenant-2',
      envName: 'test2',
    });
    await tenant2.save();
    console.log('✅ Test tenant 2 created:', tenant2.tenantName);

    // 2. Create test user
    console.log('\n2. Creating test user...');
    const testUser = new User({
      email: 'testuser@example.com',
      name: 'Test User',
      oauthProvider: 'local',
      isActive: true,
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser.email);

    // 3. Test tenant assignment
    console.log('\n3. Testing tenant assignment...');
    const userTenant1 = new UserTenant({
      user: testUser._id,
      tenant: tenant1._id,
    });
    await userTenant1.save();
    console.log('✅ User assigned to tenant 1');

    const userTenant2 = new UserTenant({
      user: testUser._id,
      tenant: tenant2._id,
    });
    await userTenant2.save();
    console.log('✅ User assigned to tenant 2');

    // 4. Verify user has access to both tenants
    console.log('\n4. Verifying user tenant access...');
    const userTenants = await UserTenant.find({ user: testUser._id }).populate(
      'tenant'
    );
    console.log(
      'User tenants:',
      userTenants.map(ut => ut.tenant.tenantName)
    );

    // 5. Test user retrieval with tenants
    console.log('\n5. Testing user retrieval with tenants...');
    const userWithTenants = await User.findById(testUser._id);
    const userTenantRelations = await UserTenant.find({
      user: testUser._id,
    }).populate('tenant');
    const tenants = userTenantRelations.map(ut => ut.tenant);

    console.log('User:', userWithTenants.email);
    console.log(
      'Tenants:',
      tenants.map(t => t.tenantName)
    );

    // 6. Test tenant removal
    console.log('\n6. Testing tenant removal...');
    await UserTenant.deleteOne({ user: testUser._id, tenant: tenant2._id });
    console.log('✅ User removed from tenant 2');

    const remainingTenants = await UserTenant.find({
      user: testUser._id,
    }).populate('tenant');
    console.log(
      'Remaining tenants:',
      remainingTenants.map(ut => ut.tenant.tenantName)
    );

    console.log('\n✅ All tests completed successfully!');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: 'testuser@example.com' });
    await UserTenant.deleteMany({ user: testUser._id });
    await TenantsModel.deleteOne({ tenantId: 'test-tenant-1' });
    await TenantsModel.deleteOne({ tenantId: 'test-tenant-2' });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testUserTenantAssignment();
