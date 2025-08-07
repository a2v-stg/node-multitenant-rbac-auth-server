const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root directory
const envPath = path.join(__dirname, '../../../.env');
if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Load migrations
require('../migrations');

async function runMigrations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Get the migration service
    const migrationService = require('../services/migrationService');
    
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

      case 'create':
        if (!version || !process.argv[4]) {
          console.log('Usage: node migrate.js create <version> <name> [description]');
          process.exit(1);
        }
        const name = process.argv[4];
        const description = process.argv[5] || '';
        await migrationService.createMigration(version, name, description);
        break;

      case 'setup-organization':
        console.log('🔄 Setting up organization...');
        await setupOrganization();
        break;

      default:
        console.log('Usage:');
        console.log('  node migrate.js status                    - Show migration status');
        console.log('  node migrate.js migrate                   - Run pending migrations');
        console.log('  node migrate.js rollback                  - Rollback last migration');
        console.log('  node migrate.js rollback <version>        - Rollback to specific version');
        console.log('  node migrate.js reset                     - Reset all migrations (dev only)');
        console.log('  node migrate.js create <version> <name>   - Create new migration');
        console.log('  node migrate.js setup-organization        - Setup organization and migrate data');
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

async function setupOrganization() {
  try {
    // This function can be used to set up organization-specific data
    console.log('Setting up organization...');
    
    // Add any organization-specific setup logic here
    
    console.log('✅ Organization setup completed');
  } catch (error) {
    console.error('❌ Organization setup failed:', error);
    throw error;
  }
}

runMigrations(); 