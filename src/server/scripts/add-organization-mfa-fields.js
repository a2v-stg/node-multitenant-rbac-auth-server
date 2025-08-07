const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the Tenant model
const Tenant = require('../models/Tenant');

async function addOrganizationMfaFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Add organization MFA fields to all tenants
    const result = await Tenant.updateMany(
      {},
      {
        $set: {
          organizationMfaEnabled: false,
          organizationMfaRequiredForLocalUsers: false,
          organizationMfaMethods: ['totp'],
          organizationMfaGracePeriod: 0,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} tenants with organization MFA fields`);

    // Verify the update
    const tenants = await Tenant.find({});
    console.log('\nTenants with organization MFA fields:');
    tenants.forEach(tenant => {
      console.log(`- ${tenant.tenantName} (${tenant.tenantId}):`);
      console.log(`  organizationMfaEnabled: ${tenant.organizationMfaEnabled}`);
      console.log(`  organizationMfaRequiredForLocalUsers: ${tenant.organizationMfaRequiredForLocalUsers}`);
      console.log(`  organizationMfaMethods: ${tenant.organizationMfaMethods}`);
      console.log(`  organizationMfaGracePeriod: ${tenant.organizationMfaGracePeriod}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Script completed successfully');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addOrganizationMfaFields(); 