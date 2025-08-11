const mongoose = require('mongoose');
const dotenv = require('dotenv');
const migrationService = require('../services/migrationService');
const path = require('path');

// Load migrations
require('../migrations');

// Load environment variables from the root directory
const envPath = path.join(__dirname, '../../../.env');
if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function runMigrations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get command line arguments
    const command = process.argv[2];
    const version = process.argv[3];

    switch (command) {
    case 'status':
      await showStatus();
      break;

    case 'migrate':
      await migrationService.migrate();
      break;

    case 'rollback':
      if (version) {
        await migrationService.rollbackTo(version);
      } else {
        await migrationService.rollback();
      }
      break;

    case 'reset':
      await migrationService.reset();
      break;

    default:
      console.log('Usage:');
      console.log(
        '  node scripts/migrate.js status                    - Show migration status'
      );
      console.log(
        '  node scripts/migrate.js migrate                   - Run pending migrations'
      );
      console.log(
        '  node scripts/migrate.js rollback                  - Rollback last migration'
      );
      console.log(
        '  node scripts/migrate.js rollback <version>        - Rollback to specific version'
      );
      console.log(
        '  node scripts/migrate.js reset                     - Reset all migrations (dev only)'
      );
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function showStatus() {
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
