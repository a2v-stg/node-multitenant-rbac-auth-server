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

async function testAPIWithSession() {
  try {
    console.log('🧪 Testing API with simulated session...\n');

    // Get the user
    const user = await User.findOne({ email: 'risk_reviewer@example.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Get the default tenant
    const tenant = await TenantsModel.findOne({ tenantId: 'default' });
    if (!tenant) {
      console.log('❌ Default tenant not found');
      return;
    }

    console.log(`👤 User: ${user.email}`);
    console.log(`🏢 Tenant: ${tenant.tenantName} (${tenant.tenantId})`);

    // Simulate the API logic
    console.log('\n🔍 Testing user listing logic...');

    // Get users for current tenant
    const userTenants = await UserTenant.find({ tenant: tenant._id }).populate(
      'user'
    );

    console.log(`📋 Found ${userTenants.length} user-tenant relationships`);

    // Get roles for each user
    const users = await Promise.all(
      userTenants.map(async ut => {
        const userRoles = await UserRole.find({
          user: ut.user._id,
          tenant: tenant._id,
        }).populate('role');

        console.log(`   - ${ut.user.email}: ${userRoles.length} roles`);

        return {
          _id: ut.user._id,
          email: ut.user.email,
          fullName: ut.user.fullName,
          isActive: ut.user.isActive,
          lastLogin: ut.user.lastLogin,
          oauthProvider: ut.user.oauthProvider,
          roles: userRoles.map(ur => ur.role),
          createdAt: ut.user.createdAt,
        };
      })
    );

    console.log(`\n✅ Successfully processed ${users.length} users`);
    console.log('📊 Sample user data:', JSON.stringify(users[0], null, 2));

    console.log('\n✅ API logic test complete!');
  } catch (error) {
    console.error('❌ Error testing API:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAPIWithSession();
