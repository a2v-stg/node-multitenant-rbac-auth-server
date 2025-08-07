const fs = require('fs');
const path = require('path');

/**
 * Migration Loader
 * Automatically discovers and loads migration files from the versions directory
 */

class MigrationLoader {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'versions');
    this.migrations = new Map();
  }

  /**
   * Load all migration files from the versions directory
   */
  loadMigrations() {
    try {
      // Check if versions directory exists
      if (!fs.existsSync(this.migrationsPath)) {
        console.log('No migrations directory found');
        return this.migrations;
      }

      // Read all files in the versions directory
      const files = fs.readdirSync(this.migrationsPath);

      // Filter for .js files and sort by version
      const migrationFiles = files
        .filter(file => file.endsWith('.js'))
        .sort((a, b) => {
          const versionA = a.split('-')[0];
          const versionB = b.split('-')[0];
          return this.compareVersions(versionA, versionB);
        });

      // Load each migration file
      for (const file of migrationFiles) {
        const migrationPath = path.join(this.migrationsPath, file);
        const migration = require(migrationPath);

        if (this.validateMigration(migration)) {
          this.migrations.set(migration.version, migration);
          console.log(
            `Loaded migration: ${migration.version} - ${migration.name}`
          );
        } else {
          console.warn(`Invalid migration file: ${file}`);
        }
      }

      console.log(`Loaded ${this.migrations.size} migrations`);
      return this.migrations;
    } catch (error) {
      console.error('Error loading migrations:', error);
      return this.migrations;
    }
  }

  /**
   * Validate migration object structure
   */
  validateMigration(migration) {
    const requiredFields = ['version', 'name', 'description', 'up', 'down'];

    for (const field of requiredFields) {
      if (!migration.hasOwnProperty(field)) {
        console.error(`Migration missing required field: ${field}`);
        return false;
      }
    }

    if (
      typeof migration.up !== 'function' ||
      typeof migration.down !== 'function'
    ) {
      console.error('Migration up and down must be functions');
      return false;
    }

    return true;
  }

  /**
   * Compare semantic versions
   */
  compareVersions(a, b) {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i] || 0;
      const partB = partsB[i] || 0;

      if (partA < partB) return -1;
      if (partA > partB) return 1;
    }

    return 0;
  }

  /**
   * Get all loaded migrations
   */
  getMigrations() {
    return Array.from(this.migrations.values());
  }

  /**
   * Get migration by version
   */
  getMigration(version) {
    return this.migrations.get(version);
  }

  /**
   * Get sorted migrations
   */
  getSortedMigrations() {
    return this.getMigrations().sort((a, b) =>
      this.compareVersions(a.version, b.version)
    );
  }

  /**
   * Create a new migration file
   */
  createMigration(version, name, description) {
    const fileName = `${version}-${name.toLowerCase().replace(/\s+/g, '-')}.js`;
    const filePath = path.join(this.migrationsPath, fileName);

    const template = `/**
 * Migration: ${version} - ${name}
 * Description: ${description}
 * Date: ${new Date().toISOString().split('T')[0]}
 */

module.exports = {
    version: '${version}',
    name: '${name}',
    description: '${description}',
    
    up: async (db) => {
        // TODO: Implement migration logic
        console.log('Running migration: ${version} - ${name}');
    },
    
    down: async (db) => {
        // TODO: Implement rollback logic
        console.log('Rolling back migration: ${version} - ${name}');
    }
};
`;

    fs.writeFileSync(filePath, template);
    console.log(`Created migration file: ${fileName}`);
    return filePath;
  }
}

module.exports = new MigrationLoader();
