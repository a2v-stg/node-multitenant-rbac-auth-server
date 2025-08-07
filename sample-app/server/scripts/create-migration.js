const path = require('path');
const fs = require('fs');

// Get command line arguments
const version = process.argv[2];
const name = process.argv[3];
const description = process.argv[4] || '';

if (!version || !name) {
  console.log('Usage: node create-migration.js <version> <name> [description]');
  console.log('');
  console.log('Versioning Strategy:');
  console.log('  - Sample-app uses 2.x.x versioning to avoid conflicts with admin-ui migrations (1.x.x)');
  console.log('  - Admin-ui migrations: 1.0.0, 1.1.0, 1.2.0, etc.');
  console.log('  - Sample-app migrations: 2.0.0, 2.1.0, 2.2.0, etc.');
  console.log('');
  console.log('Examples:');
  console.log('  node create-migration.js 2.1.0 "Add user preferences"');
  console.log('  node create-migration.js 2.2.0 "Update schema" "Update user schema with new fields"');
  process.exit(1);
}

// Validate version format for sample-app (should start with 2.x.x)
if (!version.match(/^2\.\d+\.\d+$/)) {
  console.error('❌ Error: Sample-app migrations should use 2.x.x versioning to avoid conflicts with admin-ui migrations');
  console.error('   Admin-ui uses 1.x.x, sample-app uses 2.x.x');
  console.error(`   Please use a version like 2.1.0, 2.2.0, etc. instead of ${version}`);
  process.exit(1);
}

// Create migrations directory if it doesn't exist
const migrationsDir = path.join(__dirname, '../migrations/versions');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Generate filename
const filename = `${version}-${name.toLowerCase().replace(/\s+/g, '-')}.js`;
const filepath = path.join(migrationsDir, filename);

// Check if file already exists
if (fs.existsSync(filepath)) {
  console.error(`❌ Migration file already exists: ${filepath}`);
  process.exit(1);
}

// Migration template
const template = `const mongoose = require('mongoose');

module.exports = {
  version: '${version}',
  name: '${name}',
  description: '${description}',

  async up(db) {
    console.log('Running migration: ${version} - ${name}');
    // Add your migration logic here
  },

  async down(db) {
    console.log('Rolling back migration: ${version} - ${name}');
    // Add your rollback logic here
  },
};
`;

// Write the migration file
fs.writeFileSync(filepath, template);

console.log(`✅ Created migration: ${filepath}`);
console.log('');
console.log('Next steps:');
console.log(`1. Edit the migration file: ${filepath}`);
console.log('2. Add your migration logic in the up() function');
console.log('3. Add your rollback logic in the down() function');
console.log('4. Run the migration: npm run migrate'); 