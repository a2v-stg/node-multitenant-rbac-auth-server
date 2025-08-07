const fs = require('fs');
const path = require('path');

// Load all migration files
const migrationsDir = path.join(__dirname, 'versions');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.js'))
  .sort();

// Load each migration
migrationFiles.forEach(file => {
  const migrationPath = path.join(migrationsDir, file);
  require(migrationPath);
});

module.exports = {
  migrationsDir,
  migrationFiles
}; 