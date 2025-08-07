const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createContext, initContext } = require('../context');

// Load environment variables
dotenv.config();

async function setupOrganization() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-ui', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create context
    const context = createContext({ 
      config: {}, 
      logger: console, 
      mongoose, 
      models: {} 
    });
    initContext(context);

    // Get the models from context
    const Organization = context.getModel('Organization');
    const Tenant = context.getModel('Tenant');

    // Create default organization if it doesn't exist
    let organization = await Organization.findOne({ organizationId: 'default' });
    if (!organization) {
      organization = await Organization.create({
        name: 'Default Organization',
        organizationId: 'default',
        description: 'Default organization configuration',
        mfaEnabled: true,
        mfaRequiredForLocalUsers: true,
        mfaMethods: ['totp'],
        mfaGracePeriod: 0
      });
      console.log('✅ Created default organization with MFA enabled');
    } else {
      console.log('✅ Default organization already exists');
    }

    // Migrate organization MFA settings from tenants if they exist
    const tenants = await Tenant.find({});
    let migratedCount = 0;

    for (const tenant of tenants) {
      // Check if tenant has organization MFA fields
      if (tenant.organizationMfaEnabled !== undefined || 
          tenant.organizationMfaRequiredForLocalUsers !== undefined ||
          tenant.organizationMfaMethods !== undefined ||
          tenant.organizationMfaGracePeriod !== undefined) {
        
        // Update organization with tenant's organization MFA settings
        const updates = {};
        
        if (tenant.organizationMfaEnabled !== undefined) {
          updates.mfaEnabled = tenant.organizationMfaEnabled;
        }
        if (tenant.organizationMfaRequiredForLocalUsers !== undefined) {
          updates.mfaRequiredForLocalUsers = tenant.organizationMfaRequiredForLocalUsers;
        }
        if (tenant.organizationMfaMethods !== undefined) {
          updates.mfaMethods = tenant.organizationMfaMethods;
        }
        if (tenant.organizationMfaGracePeriod !== undefined) {
          updates.mfaGracePeriod = tenant.organizationMfaGracePeriod;
        }

        if (Object.keys(updates).length > 0) {
          await Organization.updateOne(
            { organizationId: 'default' },
            { $set: updates }
          );
          migratedCount++;
        }
      }
    }

    if (migratedCount > 0) {
      console.log(`✅ Migrated organization MFA settings from ${migratedCount} tenants`);
    }

    // Remove organization MFA fields from tenants
    const result = await Tenant.updateMany(
      {},
      {
        $unset: {
          organizationMfaEnabled: '',
          organizationMfaRequiredForLocalUsers: '',
          organizationMfaMethods: '',
          organizationMfaGracePeriod: '',
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Removed organization MFA fields from ${result.modifiedCount} tenants`);
    }

    // Verify the setup
    const finalOrganization = await Organization.findOne({ organizationId: 'default' });
    console.log('\nOrganization configuration:');
    console.log(`- Name: ${finalOrganization.name}`);
    console.log(`- Organization ID: ${finalOrganization.organizationId}`);
    console.log(`- MFA Enabled: ${finalOrganization.mfaEnabled}`);
    console.log(`- MFA Required for Local Users: ${finalOrganization.mfaRequiredForLocalUsers}`);
    console.log(`- MFA Methods: ${finalOrganization.mfaMethods}`);
    console.log(`- MFA Grace Period: ${finalOrganization.mfaGracePeriod} days`);

    await mongoose.connection.close();
    console.log('\n✅ Organization setup completed successfully');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupOrganization(); 