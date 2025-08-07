# Sample-App Migration System

## Overview

The sample-app has its own migration system that operates independently from the main admin-ui migrations. This system uses a different versioning scheme to avoid conflicts when both systems share the same database.

## Versioning Strategy

### Migration Versioning

- **Admin-ui migrations**: `1.x.x` (1.0.0, 1.1.0, 1.2.0, etc.)
- **Sample-app migrations**: `2.x.x` (2.0.0, 2.1.0, 2.2.0, etc.)

This separation prevents version conflicts when both systems share the same MongoDB database and migration tracking collection.

### Current Migrations

```
sample-app/server/migrations/versions/
├── 2.0.0-initial-setup.js  # Initial sample-app setup
```

## Usage

### Check Migration Status
```bash
cd sample-app/server
npm run migrate:status
```

### Run Migrations
```bash
cd sample-app/server
npm run migrate
```

### Create New Migration
```bash
cd sample-app/server
node scripts/create-migration.js 2.1.0 "Add new feature"
```

### Rollback Migrations
```bash
cd sample-app/server
npm run migrate:rollback        # Rollback last migration
npm run migrate:rollback 2.0.0  # Rollback to specific version
```

## Migration File Format

```javascript
const mongoose = require('mongoose');

/**
 * Migration: 2.x.x - Migration Name
 * Description: Brief description of what this migration does
 */

module.exports = {
  version: '2.1.0',  // Must start with 2.x.x
  name: 'Migration Name',
  description: 'Detailed description of the migration',

  async up(db) {
    console.log('Running migration: 2.1.0 - Migration Name');
    // Add your migration logic here
  },

  async down(db) {
    console.log('Rolling back migration: 2.1.0 - Migration Name');
    // Add your rollback logic here
  },
};
```

## Integration with Admin-UI

The sample-app migration system is designed to work alongside the admin-ui migrations:

1. **Shared Database**: Both systems can share the same MongoDB database
2. **Shared Migration Collection**: Both systems use the same `migrations` collection for tracking
3. **Version Separation**: Different version ranges prevent conflicts
4. **Model Access**: Sample-app migrations can access admin-ui models when available

## Best Practices

1. **Always use 2.x.x versioning** for sample-app migrations
2. **Include descriptive names** and descriptions
3. **Test migrations** before deploying to production
4. **Document breaking changes** in migration descriptions
5. **Use semantic versioning** (2.1.0, 2.2.0, etc.)

## Troubleshooting

### Version Conflicts
If you encounter version conflicts, ensure:
- Sample-app migrations use 2.x.x versions
- Admin-ui migrations use 1.x.x versions
- No duplicate version numbers within each system

### Migration Failures
- Check the migration logs for detailed error messages
- Ensure the database connection is working
- Verify that required collections/models exist

### Rollback Issues
- Some migrations may not support rollback (check the `down` function)
- Always backup your database before running migrations
- Test rollbacks in a development environment first 