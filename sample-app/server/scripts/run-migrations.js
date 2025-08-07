const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the correct location
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runMigrations() {
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

    // Get the migration service from admin-ui
    const migrationService = require('../../../src/server/services/migrationService');
    
    // Get command line arguments
    const command = process.argv[2];
    const version = process.argv[3];

    switch (command) {
      case 'status':
        await showStatus(migrationService);
        break;

      case 'migrate':
        console.log('🔄 Running migrations...');
        await migrationService.migrate();
        break;

      case 'rollback':
        if (version) {
          console.log(`🔄 Rolling back to version ${version}...`);
          await migrationService.rollbackTo(version);
        } else {
          console.log('🔄 Rolling back last migration...');
          await migrationService.rollback();
        }
        break;

      case 'reset':
        console.log('🔄 Resetting all migrations...');
        await migrationService.reset();
        break;

      default:
        console.log('Usage:');
        console.log('  node run-migrations.js status                    - Show migration status');
        console.log('  node run-migrations.js migrate                   - Run pending migrations');
        console.log('  node run-migrations.js rollback                  - Rollback last migration');
        console.log('  node run-migrations.js rollback <version>        - Rollback to specific version');
        console.log('  node run-migrations.js reset                     - Reset all migrations (dev only)');
    }

    await mongoose.connection.close();
    console.log('✅ Migration process completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function showStatus(migrationService) {
  const status = await migrationService.getStatus();

  console.log('\n=== Migration Status ===');
  console.log(`Current Version: ${status.currentVersion}`);
  console.log(`Applied Migrations: ${status.appliedCount}`);
  console.log(`Pending Migrations: ${status.pendingCount}`);

  if (status.applied.length > 0) {
    console.log('\nApplied Migrations:');
    status.applied.forEach(migration => {
      console.log(
        `  ✓ ${migration.version} - ${migration.name} (${new Date(migration.appliedAt).toLocaleString()})`
      );
    });
  }

  if (status.pending.length > 0) {
    console.log('\nPending Migrations:');
    status.pending.forEach(migration => {
      console.log(`  ⏳ ${migration.version} - ${migration.name}`);
    });
  }

  console.log('\n');
}

runMigrations(); 