/**
 * Migration Index
 *
 * This file provides backward compatibility for the old migration system.
 * New migrations should be created as individual files in the versions/ directory.
 */

const migrationService = require('../services/migrationService');
const migrationLoader = require('./loader');

// Load migrations from files
migrationLoader.loadMigrations();

// Export the migration service for backward compatibility
module.exports = migrationService;
