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

async function debugMultipleTenantFlow() {
  try {
    console.log('🔍 Debugging Multiple Tenant Flow...\n');

    // 1. Find the test user
    console.log('1. Finding test user...');
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    console.log('✅ Found user:', user.email);

    // 2. Check user's tenants
    console.log('\n2. Checking user tenants...');
    const userTenants = await UserTenant.find({ user: user._id }).populate(
      'tenant'
    );
    console.log('Number of tenants:', userTenants.length);

    userTenants.forEach((ut, index) => {
      console.log(`Tenant ${index + 1}:`, {
        tenantId: ut.tenant.tenantId,
        tenantName: ut.tenant.tenantName,
        mfaEnabled: ut.tenant.mfaEnabled,
        mfaRequiredForLocalUsers: ut.tenant.mfaRequiredForLocalUsers,
      });
    });

    // 3. Test authService.handleUserLogin
    console.log('\n3. Testing authService.handleUserLogin...');
    const loginResult = await authService.handleUserLogin(user);
    console.log('Login Result Type:', loginResult.type);
    console.log('Redirect URL:', loginResult.redirectUrl);

    if (loginResult.type === 'multiple_tenants') {
      console.log('Number of tenants in result:', loginResult.tenants.length);
      loginResult.tenants.forEach((tenant, index) => {
        console.log(`Tenant ${index + 1}:`, {
          tenantId: tenant.tenantId,
          tenantName: tenant.tenantName,
          mfaEnabled: tenant.mfaEnabled,
          mfaRequiredForLocalUsers: tenant.mfaRequiredForLocalUsers,
        });
      });
    }

    // 4. Test authService.selectTenant for each tenant
    console.log('\n4. Testing tenant selection for each tenant...');
    for (const ut of userTenants) {
      console.log(`\nTesting tenant: ${ut.tenant.tenantName}`);
      try {
        const selectResult = await authService.selectTenant(
          user._id,
          ut.tenant.tenantId
        );
        console.log('Select Result Type:', selectResult.type);
        console.log('Redirect URL:', selectResult.redirectUrl);
      } catch (error) {
        console.log('Error selecting tenant:', error.message);
      }
    }

    // 5. Check if we need to create additional tenants for testing
    console.log('\n5. Checking if we need additional tenants...');
    if (userTenants.length === 1) {
      console.log(
        'User has only one tenant. Creating a second tenant for testing...'
      );

      // Create a second tenant
      const secondTenant = new TenantsModel({
        tenantId: 'test-tenant',
        tenantName: 'Test Tenant',
        envName: 'test',
        allowedModules: ['watch-list', 'socure', 'doc-check'],
        mfaEnabled: true,
        mfaRequiredForLocalUsers: true,
        mfaMethods: ['totp', 'sms', 'voice'],
        mfaGracePeriod: 0,
      });

      await secondTenant.save();
      console.log('✅ Created second tenant:', secondTenant.tenantName);

      // Assign user to second tenant
      const userTenant2 = new UserTenant({
        user: user._id,
        tenant: secondTenant._id,
      });

      await userTenant2.save();
      console.log('✅ Assigned user to second tenant');

      // Test login flow again
      console.log('\n6. Testing login flow with multiple tenants...');
      const loginResult2 = await authService.handleUserLogin(user);
      console.log('Login Result Type:', loginResult2.type);
      console.log('Redirect URL:', loginResult2.redirectUrl);
    }

    console.log('\n✅ Multiple Tenant Flow Debug Completed!');
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the debug
debugMultipleTenantFlow();
