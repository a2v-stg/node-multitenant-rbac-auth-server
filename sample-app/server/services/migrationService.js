const mongoose = require('mongoose');
const migrationLoader = require('../migrations/loader');

class MigrationService {
  constructor() {
    this.migrations = new Map();
    this.currentVersion = '2.0.0';
  }

  _getModels() {
    // Try to get models from admin-ui first, then fallback to local
    try {
      const adminUI = require('../../../../src/server');
      if (adminUI && adminUI.getContext) {
        const context = adminUI.getContext();
        return {
          Migration: context.getModel('Migration'),
        };
      }
    } catch (error) {
      // Fallback to local models
    }

    // Local models fallback
    let Migration;
    try {
      Migration = mongoose.model('Migration');
    } catch (error) {
      // Model doesn't exist, create it
      Migration = mongoose.model('Migration', new mongoose.Schema({
        version: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        description: String,
        appliedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['applied', 'failed'], default: 'applied' },
      }));
    }

    return { Migration };
  }

  // Load migrations from files
  async loadMigrations() {
    this.migrations = migrationLoader.loadMigrations();
    return this.migrations;
  }

  // Get all registered migrations
  getRegisteredMigrations() {
    return migrationLoader.getSortedMigrations();
  }

  // Get applied migrations from database
  async getAppliedMigrations() {
    try {
      const { Migration } = this._getModels();
      return await Migration.find({ status: 'applied' }).sort({ version: 1 });
    } catch (error) {
      console.error('Error fetching applied migrations:', error);
      return [];
    }
  }

  // Get pending migrations
  async getPendingMigrations() {
    const applied = await this.getAppliedMigrations();
    const appliedVersions = new Set(applied.map(m => m.version));

    return this.getRegisteredMigrations().filter(
      migration => !appliedVersions.has(migration.version)
    );
  }

  // Run all pending migrations
  async migrate() {
    // Load migrations from files
    await this.loadMigrations();

    const pending = await this.getPendingMigrations();

    if (pending.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Running ${pending.length} pending migrations...`);

    for (const migration of pending) {
      await this.runMigration(migration);
    }

    console.log('All migrations completed');
  }

  // Run a specific migration
  async runMigration(migration) {
    const startTime = Date.now();

    try {
      console.log(
        `Running migration: ${migration.version} - ${migration.name}`
      );

      // Run the migration
      await migration.up(mongoose.connection.db);

      // Record the migration
      const { Migration } = this._getModels();
      await Migration.create({
        version: migration.version,
        name: migration.name,
        description: migration.description,
        appliedAt: new Date(),
        status: 'applied',
      });

      const duration = Date.now() - startTime;
      console.log(
        `✓ Completed migration: ${migration.version} - ${migration.name} (${duration}ms)`
      );
    } catch (error) {
      console.error(
        `✗ Failed migration: ${migration.version} - ${migration.name}`,
        error
      );

      // Record the failed migration
      const { Migration } = this._getModels();
      await Migration.create({
        version: migration.version,
        name: migration.name,
        description: migration.description,
        appliedAt: new Date(),
        status: 'failed',
      });

      throw error;
    }
  }

  // Rollback last migration
  async rollback() {
    const { Migration } = this._getModels();
    const lastMigration = await Migration.findOne({ status: 'applied' })
      .sort({ appliedAt: -1 });

    if (!lastMigration) {
      console.log('No migrations to rollback');
      return;
    }

    await this.rollbackTo(lastMigration.version);
  }

  // Rollback to specific version
  async rollbackTo(version) {
    const { Migration } = this._getModels();
    const migrationsToRollback = await Migration.find({
      version: { $gte: version },
      status: 'applied',
    }).sort({ version: -1 });

    if (migrationsToRollback.length === 0) {
      console.log(`No migrations to rollback to version ${version}`);
      return;
    }

    console.log(`Rolling back ${migrationsToRollback.length} migrations...`);

    for (const migrationRecord of migrationsToRollback) {
      const migration = this.migrations.get(migrationRecord.version);
      if (migration && migration.down) {
        try {
          console.log(
            `Rolling back migration: ${migration.version} - ${migration.name}`
          );
          await migration.down(mongoose.connection.db);
          await Migration.deleteOne({ _id: migrationRecord._id });
          console.log(
            `✓ Rolled back migration: ${migration.version} - ${migration.name}`
          );
        } catch (error) {
          console.error(
            `✗ Failed to rollback migration: ${migration.version} - ${migration.name}`,
            error
          );
          throw error;
        }
      } else {
        console.log(
          `Skipping rollback for migration: ${migrationRecord.version} (no down function)`
        );
        await Migration.deleteOne({ _id: migrationRecord._id });
      }
    }
  }

  // Get migration status
  async getStatus() {
    const applied = await this.getAppliedMigrations();
    const pending = await this.getPendingMigrations();
    const currentVersion = applied.length > 0 
      ? applied[applied.length - 1].version 
      : '2.0.0';

    return {
      currentVersion,
      appliedCount: applied.length,
      pendingCount: pending.length,
      applied: applied,
      pending: pending,
    };
  }

  // Reset all migrations (dev only)
  async reset() {
    const { Migration } = this._getModels();
    await Migration.deleteMany({});
    console.log('All migrations reset');
  }

  // Create a new migration
  async createMigration(version, name, description) {
    const template = `const mongoose = require('mongoose');

module.exports = {
  version: '${version}',
  name: '${name}',
  description: '${description || ''}',

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

    const fs = require('fs');
    const path = require('path');
    const migrationsDir = path.join(__dirname, '../migrations/versions');
    const filename = `${version}-${name.toLowerCase().replace(/\s+/g, '-')}.js`;
    const filepath = path.join(migrationsDir, filename);

    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    fs.writeFileSync(filepath, template);
    console.log(`Created migration: ${filepath}`);
  }
}

module.exports = new MigrationService(); 