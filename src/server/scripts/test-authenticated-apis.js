const mongoose = require('mongoose');
const User = require('../models/User');
const TenantsModel = require('../models/Tenant');
const UserTenant = require('../models/UserTenant');
const UserRole = require('../models/UserRole');
const Role = require('../models/Role');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function testAuthenticatedAPIs() {
  try {
    console.log('🧪 Testing authenticated APIs...\n');

    // Get the user and tenant
    const user = await User.findOne({ email: 'risk_reviewer@example.com' });
    const tenant = await TenantsModel.findOne({ tenantId: 'default' });

    if (!user || !tenant) {
      console.log('❌ User or tenant not found');
      return;
    }

    console.log(`👤 User: ${user.email}`);
    console.log(`🏢 Tenant: ${tenant.tenantName} (${tenant.tenantId})`);

    // Simulate the API logic for /auth/current-user
    console.log('\n🔍 Testing /auth/current-user logic...');

    // Get user roles and permissions
    const userRoles = await UserRole.find({
      user: user._id,
      tenant: tenant._id,
    }).populate('role');

    const userPermissions = userRoles.flatMap(ur => ur.role.permissions || []);

    const currentUserData = {
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        oauthProvider: user.oauthProvider,
      },
      tenant: {
        _id: tenant._id,
        tenantName: tenant.tenantName,
        tenantId: tenant.tenantId,
        envName: tenant.envName,
      },
      userRoles: userRoles.map(ur => ur.role),
      userPermissions: [...new Set(userPermissions)], // Remove duplicates
    };

    console.log(
      '✅ Current user data:',
      JSON.stringify(currentUserData, null, 2)
    );

    // Simulate the API logic for /auth/available-tenants
    console.log('\n🔍 Testing /auth/available-tenants logic...');

    const userTenants = await UserTenant.find({ user: user._id }).populate(
      'tenant'
    );
    const availableTenants = userTenants.map(ut => ({
      tenantName: ut.tenant.tenantName,
      tenantId: ut.tenant.tenantId,
      envName: ut.tenant.envName,
    }));

    console.log(
      '✅ Available tenants:',
      JSON.stringify(availableTenants, null, 2)
    );

    // Simulate the API logic for /api/users/roles
    console.log('\n🔍 Testing /api/users/roles logic...');

    const roles = await Role.find({ tenant: tenant._id }).sort({ name: 1 });
    console.log('✅ Available roles:', JSON.stringify(roles, null, 2));

    console.log('\n✅ All API logic tests complete!');
  } catch (error) {
    console.error('❌ Error testing APIs:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAuthenticatedAPIs();
