const mongoose = require('mongoose');
const TenantsModel = require('../models/Tenant');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-ui',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

async function checkDefaultTenant() {
  try {
    console.log('🔍 Checking for default tenant...\n');

    // Check if default tenant exists
    const defaultTenant = await TenantsModel.findOne({ tenantId: 'default' });

    if (defaultTenant) {
      console.log('✅ Default tenant found:');
      console.log('  - Name:', defaultTenant.tenantName);
      console.log('  - ID:', defaultTenant.tenantId);
      console.log('  - Environment:', defaultTenant.envName);
      console.log('  - MFA Enabled:', defaultTenant.mfaEnabled);
      console.log('  - MFA Required:', defaultTenant.mfaRequiredForLocalUsers);
    } else {
      console.log('❌ Default tenant not found. Creating one...');

      const newDefaultTenant = new TenantsModel({
        tenantName: 'Default Tenant',
        tenantId: 'default',
        envName: 'default',
        allowedModules: [
          'watch-list',
          'socure',
          'doc-check',
          'lira-watch-list',
          'etran-watch-list',
          'do-not-pay',
          'doc-copilot-check'
        ],
        mfaEnabled: false,
        mfaRequiredForLocalUsers: false,
        mfaMethods: ['totp'],
        mfaGracePeriod: 0
      });

      await newDefaultTenant.save();
      console.log('✅ Default tenant created successfully');
      console.log('  - Name:', newDefaultTenant.tenantName);
      console.log('  - ID:', newDefaultTenant.tenantId);
    }

    // List all tenants
    console.log('\n📋 All tenants:');
    const allTenants = await TenantsModel.find().sort({ tenantName: 1 });
    allTenants.forEach(tenant => {
      console.log(
        `  - ${tenant.tenantName} (${tenant.tenantId}) - ${tenant.envName}`
      );
    });

    console.log('\n✅ Default tenant check completed!');
  } catch (error) {
    console.error('❌ Error checking default tenant:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkDefaultTenant();
