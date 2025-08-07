# Sample-App Migration Versioning Update

## Overview

This document summarizes the changes made to implement a separate versioning scheme for sample-app migrations to avoid conflicts with admin-ui migrations.

## Problem Solved

**Issue**: Both sample-app and admin-ui migration systems were using the same semver versioning scheme (1.x.x), which could cause conflicts when:
- Both systems share the same MongoDB database
- Both systems use the same `migrations` collection for tracking
- Both systems try to create migrations with the same version numbers

**Solution**: Implemented separate versioning schemes:
- **Admin-ui migrations**: `1.x.x` (1.0.0, 1.1.0, 1.2.0, etc.)
- **Sample-app migrations**: `2.x.x` (2.0.0, 2.1.0, 2.2.0, etc.)

## Changes Made

### 1. Updated Migration File
- **File**: `sample-app/server/migrations/versions/2.0.0-initial-setup.js`
- **Changes**:
  - Renamed from `1.0.0-initial-setup.js` to `2.0.0-initial-setup.js`
  - Updated version from `'1.0.0'` to `'2.0.0'`
  - Added comprehensive documentation about versioning strategy
  - Updated description to reflect 2.x.x versioning

### 2. Updated Migration Service
- **File**: `sample-app/server/services/migrationService.js`
- **Changes**:
  - Updated `currentVersion` from `'1.0.0'` to `'2.0.0'`
  - Service already had smart integration with admin-ui models

### 3. Enhanced Migration Creation Script
- **File**: `sample-app/server/scripts/create-migration.js`
- **Changes**:
  - Added validation to ensure sample-app migrations use 2.x.x versions
  - Added helpful error messages and examples
  - Added documentation about versioning strategy

### 4. Updated Documentation
- **File**: `MIGRATION_SYSTEM_SUMMARY.md`
- **Changes**:
  - Updated sample-app migration examples to use 2.x.x versions
  - Added explanation of versioning strategy

- **File**: `sample-app/server/migrations/README.md`
- **Changes**:
  - Created comprehensive documentation for sample-app migration system
  - Documented versioning strategy, usage, and best practices
  - Added troubleshooting section

## Versioning Strategy

### Migration Versioning Rules

1. **Admin-ui migrations**: Must use `1.x.x` versions
   - Examples: `1.0.0`, `1.1.0`, `1.2.0`, `1.9.0`, etc.

2. **Sample-app migrations**: Must use `2.x.x` versions
   - Examples: `2.0.0`, `2.1.0`, `2.2.0`, `2.10.0`, etc.

3. **Future submodules**: Can use `3.x.x`, `4.x.x`, etc.

### Benefits

- **No conflicts**: Different version ranges prevent collisions
- **Clear separation**: Easy to distinguish between systems
- **Future-proof**: Room for additional submodules
- **Backward compatible**: Existing admin-ui migrations unchanged

## Usage Examples

### Creating New Sample-App Migrations
```bash
cd sample-app/server
node scripts/create-migration.js 2.1.0 "Add user preferences"
node scripts/create-migration.js 2.2.0 "Update schema" "Update user schema with new fields"
```

### Running Migrations
```bash
cd sample-app/server
npm run migrate:status    # Check status
npm run migrate          # Run pending migrations
npm run migrate:rollback # Rollback last migration
```

### Validation
The migration creation script now validates version numbers:
```bash
# ✅ Valid (sample-app)
node scripts/create-migration.js 2.1.0 "New feature"

# ❌ Invalid (will show error)
node scripts/create-migration.js 1.1.0 "New feature"
```

## Integration Notes

### Database Sharing
Both systems can safely share:
- Same MongoDB database
- Same `migrations` collection
- Same models (when available)

### Migration Tracking
- Admin-ui migrations: Tracked as `1.x.x` versions
- Sample-app migrations: Tracked as `2.x.x` versions
- No conflicts in the `migrations` collection

### Model Access
Sample-app migrations can:
- Access admin-ui models when available
- Fall back to local models when needed
- Use the same database connection

## Testing

To test the new versioning system:

1. **Check current status**:
   ```bash
   cd sample-app/server
   npm run migrate:status
   ```

2. **Create a test migration**:
   ```bash
   node scripts/create-migration.js 2.1.0 "Test migration"
   ```

3. **Run migrations**:
   ```bash
   npm run migrate
   ```

4. **Verify no conflicts**:
   - Check that admin-ui migrations (1.x.x) are unaffected
   - Verify sample-app migrations (2.x.x) work correctly
   - Confirm both systems can coexist in the same database

## Future Considerations

1. **Additional submodules**: Use `3.x.x`, `4.x.x`, etc. for new submodules
2. **Documentation**: Keep migration documentation updated
3. **Validation**: Ensure all new migrations follow the versioning rules
4. **Testing**: Test migrations in development before production

## Conclusion

The migration versioning update successfully resolves potential conflicts between sample-app and admin-ui migrations while maintaining full functionality and backward compatibility. The new 2.x.x versioning scheme provides a clear separation and future-proof solution for the migration system. 