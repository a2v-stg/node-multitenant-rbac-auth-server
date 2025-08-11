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
    useUnifiedTopology: true
  }
);

async function assignUserToTenant() {
  try {
    console.log('🔧 Assigning user to default tenant...\n');

    // Get user and tenant
    const user = await User.findOne({ email: 'local@email.com' });
    const tenant = await TenantsModel.findOne({ tenantId: 'default' });

    if (!user) {
      console.log('❌ Local user not found');
      return;
    }

    if (!tenant) {
      console.log('❌ Default tenant not found');
      return;
    }

    console.log(`👤 User: ${user.email}`);
    console.log(`🏢 Tenant: ${tenant.tenantName} (${tenant.tenantId})`);

    // Check if user-tenant relationship already exists
    let userTenant = await UserTenant.findOne({
      user: user._id,
      tenant: tenant._id
    });

    if (!userTenant) {
      // Create user-tenant relationship
      userTenant = new UserTenant({
        user: user._id,
        tenant: tenant._id
      });
      await userTenant.save();
      console.log('✅ Created user-tenant relationship');
    } else {
      console.log('✅ User-tenant relationship already exists');
    }

    // Get default role (User role)
    const userRole = await Role.findOne({
      name: 'User',
      tenant: tenant._id
    });

    if (userRole) {
      // Check if user-role relationship already exists
      let userRoleRel = await UserRole.findOne({
        user: user._id,
        role: userRole._id,
        tenant: tenant._id
      });

      if (!userRoleRel) {
        // Create user-role relationship
        userRoleRel = new UserRole({
          user: user._id,
          role: userRole._id,
          tenant: tenant._id
        });
        await userRoleRel.save();
        console.log('✅ Assigned User role to user');
      } else {
        console.log('✅ User role already assigned');
      }
    }

    console.log('\n✅ User assignment complete!');
    console.log('🧪 You can now test local login with:');
    console.log('   - Username: local@email.com');
    console.log('   - Password: password123');
  } catch (error) {
    console.error('❌ Error assigning user to tenant:', error);
  } finally {
    mongoose.connection.close();
  }
}

assignUserToTenant();
