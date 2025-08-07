const mongoose = require('mongoose');
const User = require('../models/User');
const TenantsModel = require('../models/Tenant');
const UserTenant = require('../models/UserTenant');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');

    // Check users
    const users = await User.find({});
    console.log(`📋 Users (${users.length}):`);
    users.forEach(user => {
      console.log(
        `   - ${user.email} (${user.fullName}) - Active: ${user.isActive}`
      );
    });

    // Check tenants
    const tenants = await TenantsModel.find({});
    console.log(`\n🏢 Tenants (${tenants.length}):`);
    tenants.forEach(tenant => {
      console.log(
        `   - ${tenant.tenantName} (${tenant.tenantId}) - ${tenant.envName}`
      );
    });

    // Check user-tenant relationships
    const userTenants = await UserTenant.find({})
      .populate('user')
      .populate('tenant');
    console.log(`\n👥 User-Tenant Relationships (${userTenants.length}):`);
    userTenants.forEach(ut => {
      console.log(
        `   - ${ut.user.email} → ${ut.tenant.tenantName} (${ut.tenant.tenantId})`
      );
    });

    // Check roles
    const roles = await Role.find({});
    console.log(`\n🎭 Roles (${roles.length}):`);
    roles.forEach(role => {
      console.log(`   - ${role.name} (${role.description})`);
    });

    // Check user roles
    const userRoles = await UserRole.find({})
      .populate('user')
      .populate('role')
      .populate('tenant');
    console.log(`\n🔐 User Roles (${userRoles.length}):`);
    userRoles.forEach(ur => {
      console.log(
        `   - ${ur.user.email} → ${ur.role.name} (${ur.tenant.tenantName})`
      );
    });

    console.log('\n✅ User check complete!');
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
