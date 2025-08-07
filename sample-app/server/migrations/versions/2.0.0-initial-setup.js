const mongoose = require('mongoose');

/**
 * Migration: 2.0.0 - Initial Setup
 * Description: Initial setup for sample-app (using 2.x.x versioning to avoid conflicts with admin-ui migrations)
 * 
 * Versioning Strategy:
 * - Admin-ui migrations: 1.x.x (1.0.0, 1.1.0, 1.2.0, etc.)
 * - Sample-app migrations: 2.x.x (2.0.0, 2.1.0, 2.2.0, etc.)
 * - This prevents version conflicts when both systems share the same database
 */

module.exports = {
  version: '2.0.0',
  name: 'Initial Setup',
  description: 'Initial setup for sample-app (using 2.x.x versioning to avoid conflicts with admin-ui migrations)',

  async up(db) {
    console.log('Running migration: 2.0.0 - Initial Setup');
    
    // Create any initial collections or indexes needed for sample-app
    const collections = await db.listCollections().toArray();
    
    // Create a sample collection if it doesn't exist
    if (!collections.find(col => col.name === 'sample_data')) {
      await db.createCollection('sample_data');
      console.log('✅ Created sample_data collection');
    }
    
    // Create indexes for better performance
    const sampleDataCollection = db.collection('sample_data');
    await sampleDataCollection.createIndex({ createdAt: 1 });
    await sampleDataCollection.createIndex({ status: 1 });
    
    console.log('✅ Created indexes for sample_data collection');
  },

  async down(db) {
    console.log('Rolling back migration: 2.0.0 - Initial Setup');
    
    // Drop the sample collection
    const collections = await db.listCollections().toArray();
    if (collections.find(col => col.name === 'sample_data')) {
      await db.dropCollection('sample_data');
      console.log('✅ Dropped sample_data collection');
    }
  },
}; 