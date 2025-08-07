#!/usr/bin/env node

const migrationService = require('../services/migrationService');

async function createMigration() {
  try {
    const version = process.argv[2];
    const name = process.argv[3];
    const description = process.argv[4];

    if (!version || !name || !description) {
      console.log(
        'Usage: node scripts/create-migration.js <version> <name> <description>'
      );
      console.log(
        'Example: node scripts/create-migration.js 1.5.0 "Add User Preferences" "Add user preference settings"'
      );
      process.exit(1);
    }

    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      console.error('Version must be in format: x.y.z (e.g., 1.5.0)');
      process.exit(1);
    }

    console.log(`Creating migration: ${version} - ${name}`);
    console.log(`Description: ${description}`);

    const filePath = await migrationService.createMigration(
      version,
      name,
      description
    );

    console.log(`\n✓ Migration file created: ${filePath}`);
    console.log('\nNext steps:');
    console.log('1. Edit the migration file to implement your logic');
    console.log('2. Test the migration: npm run migrate:status');
    console.log('3. Run the migration: npm run migrate');
  } catch (error) {
    console.error('Failed to create migration:', error.message);
    process.exit(1);
  }
}

createMigration();
