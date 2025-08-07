const fs = require('fs');
const path = require('path');

class MigrationLoader {
  constructor() {
    this.migrations = new Map();
    this.migrationsDir = path.join(__dirname, 'versions');
  }

  loadMigrations() {
    if (!fs.existsSync(this.migrationsDir)) {
      console.warn(`Migrations directory not found: ${this.migrationsDir}`);
      return this.migrations;
    }

    const migrationFiles = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    migrationFiles.forEach(file => {
      const migrationPath = path.join(this.migrationsDir, file);
      const migration = require(migrationPath);
      
      if (migration.version && migration.name) {
        this.migrations.set(migration.version, migration);
      }
    });

    return this.migrations;
  }

  getSortedMigrations() {
    const migrations = Array.from(this.migrations.values());
    return migrations.sort((a, b) => {
      return this.compareVersions(a.version, b.version);
    });
  }

  compareVersions(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart < bPart) return -1;
      if (aPart > bPart) return 1;
    }
    
    return 0;
  }
}

module.exports = new MigrationLoader(); 