const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the correct location
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function markMigrationComplete() {
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

    // Check if migration 1.8.0 already exists
    let migration = await Migration.findOne({ version: '1.8.0' });
    
    if (!migration) {
      // Create the migration record
      migration = await Migration.create({
        version: '1.8.0',
        name: 'create-organization-model',
        description: 'Create Organization model and migrate organization-level MFA configuration',
        status: 'applied',
        appliedAt: new Date(),
        executionTime: 0
      });
      console.log('✅ Created migration record for 1.8.0');
    } else {
      console.log('✅ Migration 1.8.0 already exists');
    }

    await mongoose.connection.close();
    console.log('\n✅ Migration 1.8.0 marked as completed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

markMigrationComplete(); 