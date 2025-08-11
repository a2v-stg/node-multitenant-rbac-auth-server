/**
 * Migration: 1.0.0 - Initial Schema Setup
 * Description: Create initial database schema with users, tenants, and basic RBAC
 * Date: 2024-01-01
 */

module.exports = {
  version: '1.0.0',
  name: 'Initial Schema Setup',
  description:
    'Create initial database schema with users, tenants, and basic RBAC',

  up: async db => {
    // This migration is handled by the init script
    console.log('Initial schema setup completed via init script');
  },

  down: async db => {
    // Rollback would drop all collections
    console.log('Rollback not implemented for initial schema');
  }
};
