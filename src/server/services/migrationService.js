const { getContext, createContext, initContext } = require('../context');
const mongoose = require('mongoose');
const migrationLoader = require('../migrations/loader');

class MigrationService {
  constructor() {
    this.migrations = new Map();
    this.currentVersion = '1.0.0';
    this.context = null;
    this.models = null;
  }

  _getContext() {
    if (!this.context) {
      try {
        this.context = getContext();
      } catch (error) {
        // Context not initialized, create a default one
        this.context = createContext({
          config: {},
          logger: console,
          mongoose,
          models: {}
        });
        initContext(this.context);
      }
    }
    return this.context;
  }

  _getModels() {
    if (!this.models) {
      const context = this._getContext();
      this.models = {
        Migration: context.getModel('Migration')
      };
    }
    return this.models;
  }

  // Load migrations from files
  async loadMigrations() {
    this.migrations = migrationLoader.loadMigrations();
    return this.migrations;
  }

  // Register a migration (for backward compatibility)
  register(version, name, description, upFunction, downFunction) {
    this.migrations.set(version, {
      version,
      name,
      description,
      up: upFunction,
      down: downFunction
    });
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

      // Create migration record
      const { Migration } = this._getModels();
      const migrationRecord = new Migration({
        version: migration.version,
        name: migration.name,
        description: migration.description,
        status: 'pending'
      });
      await migrationRecord.save();

      // Run the migration
      await migration.up(mongoose.connection.db);

      // Update record as successful
      migrationRecord.status = 'applied';
      migrationRecord.executionTime = Date.now() - startTime;
      await migrationRecord.save();

      console.log(`✓ Migration ${migration.version} completed successfully`);
    } catch (error) {
      console.error(`✗ Migration ${migration.version} failed:`, error.message);

      // Update record as failed
      const { Migration } = this._getModels();
      const migrationRecord = await Migration.findOne({
        version: migration.version
      });
      if (migrationRecord) {
        migrationRecord.status = 'failed';
        migrationRecord.error = error.message;
        migrationRecord.executionTime = Date.now() - startTime;
        await migrationRecord.save();
      }

      throw error;
    }
  }

  // Rollback last migration
  async rollback() {
    // Load migrations from files
    await this.loadMigrations();

    const applied = await this.getAppliedMigrations();

    if (applied.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const lastMigration = applied[applied.length - 1];
    const migration = this.migrations.get(lastMigration.version);

    if (!migration || !migration.down) {
      console.log(
        `Cannot rollback migration ${lastMigration.version} - no down function`
      );
      return;
    }

    console.log(
      `Rolling back migration: ${lastMigration.version} - ${lastMigration.name}`
    );

    try {
      await migration.down(mongoose.connection.db);

      // Update migration record
      lastMigration.status = 'rolled_back';
      await lastMigration.save();

      console.log(
        `✓ Rollback of ${lastMigration.version} completed successfully`
      );
    } catch (error) {
      console.error(
        `✗ Rollback of ${lastMigration.version} failed:`,
        error.message
      );
      throw error;
    }
  }

  // Rollback to specific version
  async rollbackTo(version) {
    // Load migrations from files
    await this.loadMigrations();

    const applied = await this.getAppliedMigrations();
    const targetIndex = applied.findIndex(m => m.version === version);

    if (targetIndex === -1) {
      console.log(`Version ${version} not found in applied migrations`);
      return;
    }

    const toRollback = applied.slice(targetIndex + 1).reverse();

    console.log(
      `Rolling back ${toRollback.length} migrations to version ${version}`
    );

    for (const migrationRecord of toRollback) {
      const migration = this.migrations.get(migrationRecord.version);

      if (!migration || !migration.down) {
        console.log(
          `Cannot rollback migration ${migrationRecord.version} - no down function`
        );
        continue;
      }

      try {
        await migration.down(mongoose.connection.db);
        migrationRecord.status = 'rolled_back';
        await migrationRecord.save();
        console.log(`✓ Rolled back ${migrationRecord.version}`);
      } catch (error) {
        console.error(
          `✗ Failed to rollback ${migrationRecord.version}:`,
          error.message
        );
        throw error;
      }
    }
  }

  // Get migration status
  async getStatus() {
    // Load migrations from files
    await this.loadMigrations();

    const applied = await this.getAppliedMigrations();
    const pending = await this.getPendingMigrations();

    return {
      currentVersion:
        applied.length > 0 ? applied[applied.length - 1].version : 'none',
      appliedCount: applied.length,
      pendingCount: pending.length,
      applied,
      pending
    };
  }

  // Reset all migrations (for development)
  async reset() {
    console.log('Resetting all migrations...');
    const { Migration } = this._getModels();
    await Migration.deleteMany({});
    console.log('All migration records cleared');
  }

  // Create a new migration
  async createMigration(version, name, description) {
    return migrationLoader.createMigration(version, name, description);
  }
}

module.exports = new MigrationService();
