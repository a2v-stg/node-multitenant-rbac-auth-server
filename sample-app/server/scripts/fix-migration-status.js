const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the correct location
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function fixMigrationStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Import the admin-ui submodule components
    const adminUI = require('../../../src/server/app');
    
    // Initialize admin-ui submodule
    await adminUI.initApp({
      config: {},
      logger: console,
      mongoose: mongoose,
      models: {}
    });

    // Get the Migration model from context
    const { getContext } = require('../../../src/server/context');
    const context = getContext();
    const Migration = context.getModel('Migration');

    // Check all migrations
    const migrations = await Migration.find().sort({ version: 1 });
    console.log('\n=== Current Migration Records ===');
    migrations.forEach(migration => {
      console.log(`${migration.version} - ${migration.name} (${migration.status})`);
    });

    // Check if 1.8.0 exists and is marked as applied
    let migration18 = await Migration.findOne({ version: '1.8.0' });
    
    if (!migration18) {
      // Create the migration record
      migration18 = await Migration.create({
        version: '1.8.0',
        name: 'create-organization-model',
        description: 'Create Organization model and migrate organization-level MFA configuration',
        status: 'applied',
        appliedAt: new Date(),
        executionTime: 0
      });
      console.log('\n✅ Created migration record for 1.8.0');
    } else if (migration18.status !== 'applied') {
      // Update the status
      migration18.status = 'applied';
      migration18.appliedAt = new Date();
      await migration18.save();
      console.log('\n✅ Updated migration 1.8.0 status to applied');
    } else {
      console.log('\n✅ Migration 1.8.0 already exists and is applied');
    }

    // Check the current version
    const latestMigration = await Migration.findOne({ status: 'applied' }).sort({ version: -1 });
    if (latestMigration) {
      console.log(`\nCurrent version: ${latestMigration.version}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Migration status fixed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMigrationStatus(); 