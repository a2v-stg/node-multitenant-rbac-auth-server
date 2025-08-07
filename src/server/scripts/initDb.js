const mongoose = require('mongoose');
const dotenv = require('dotenv');
const rbacService = require('../services/rbacService');
const migrationService = require('../services/migrationService');

// Load migrations
require('../migrations');

dotenv.config();

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create indexes
    const User = require('../models/User');
    const TenantsModel = require('../models/Tenant');
    const UserTenant = require('../models/UserTenant');
    const Role = require('../models/Role');
    const UserRole = require('../models/UserRole');
    const Migration = require('../models/Migration');

    // Ensure indexes are created
    await User.createIndexes();
    await TenantsModel.createIndexes();
    await UserTenant.createIndexes();
    await Role.createIndexes();
    await UserRole.createIndexes();
    await Migration.createIndexes();

    console.log('Database indexes created successfully');

    // Run migrations
    console.log('Running database migrations...');
    await migrationService.migrate();

    // Create default tenant if it doesn't exist
    const defaultTenant = await TenantsModel.findOne({ tenantId: 'default' });
    let tenant;
    if (!defaultTenant) {
      tenant = await TenantsModel.create({
        tenantName: 'Default Tenant',
        tenantId: 'default',
        envName: 'production',
        apiKey: 'default-api-key-12345',
        sharedKey: 'default-shared-key-67890',
        callbackUrl: 'https://default-tenant.com/callback',
        callbackRetries: '3',
        allowedModules: [
          'document_verification',
          'identity_verification',
          'risk_assessment',
          'fraud_detection',
        ],
        allowedSocureSubModules: [
          'socure_identity',
          'socure_risk',
          'socure_fraud',
        ],
        rulesEngineHost: 'https://rules-engine.default-tenant.com',
        rulesEngineAccessToken: 'default-rules-token-12345',
        callbackEndpoint: 'https://default-tenant.com/api/callback',
        subscribeEventsFrom: [
          'document_events',
          'identity_events',
          'risk_events',
        ],
        selectedEvents: [
          'validation_started',
          'validation_completed',
          'validation_failed',
        ],
        documentCallbackUrl: 'https://default-tenant.com/document-callback',
        topFaceSimilarity: 0.85,
        topImageSimilarity: 0.8,
      });
      console.log('Default tenant created');
    } else {
      tenant = defaultTenant;
    }

    // Initialize RBAC roles for the default tenant
    console.log('Initializing RBAC roles for default tenant...');
    const roles = await rbacService.initializeTenantRoles(tenant._id);
    console.log(`Created ${roles.length} default roles`);

    // Update existing users to have default values for new fields
    const usersToUpdate = await User.find({
      $or: [
        { oauthProvider: { $exists: false } },
        { isActive: { $exists: false } },
        { lastLogin: { $exists: false } },
      ],
    });

    if (usersToUpdate.length > 0) {
      console.log(
        `Updating ${usersToUpdate.length} existing users with new schema fields...`
      );

      for (const user of usersToUpdate) {
        const updates = {};

        if (!user.oauthProvider) {
          updates.oauthProvider = 'local';
        }

        if (!user.isActive) {
          updates.isActive = true;
        }

        if (!user.lastLogin) {
          updates.lastLogin = user.createdAt || new Date();
        }

        if (Object.keys(updates).length > 0) {
          await User.updateOne({ _id: user._id }, { $set: updates });
        }
      }

      console.log('User schema migration completed');
    }

    // Assign default roles to existing users who don't have roles
    console.log('Assigning default roles to existing users...');
    const usersWithoutRoles = await User.find({});

    for (const user of usersWithoutRoles) {
      const userTenants = await UserTenant.find({ user: user._id });

      for (const userTenant of userTenants) {
        const existingRoles = await UserRole.find({
          user: user._id,
          tenant: userTenant.tenant,
        });

        if (existingRoles.length === 0) {
          // Get the default 'User' role for this tenant
          const defaultRole = await Role.findOne({
            tenant: userTenant.tenant,
            name: 'User',
          });

          if (defaultRole) {
            await rbacService.assignRole(
              user._id,
              userTenant.tenant,
              defaultRole._id
            );
            console.log(
              `Assigned default role to user ${user.email} in tenant ${userTenant.tenant}`
            );
          }
        }
      }
    }

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
