const mongoose = require('mongoose');

// Export all models
module.exports = {
  User: require('./User'),
  Role: require('./Role'),
  UserRole: require('./UserRole'),
  UserTenant: require('./UserTenant'),
  Tenant: require('./Tenant'),
  Organization: require('./Organization'),
  Migration: require('./Migration')
};

// Function to get models with specific mongoose instance
function getModelsWithConnection(mongooseInstance) {
  if (!mongooseInstance) {
    throw new Error('Mongoose instance is required');
  }

  // Check if models are already registered
  const modelNames = ['User', 'Role', 'UserRole', 'UserTenant', 'Tenant', 'Organization', 'Migration'];
  const existingModels = {};

  modelNames.forEach(name => {
    try {
      existingModels[name] = mongooseInstance.model(name);
    } catch (error) {
      // Model not registered yet, we'll create it
    }
  });

  // Create models that don't exist yet
  const models = {};

  if (!existingModels.User) {
    const UserSchema = require('./User').schema;
    models.User = mongooseInstance.model('User', UserSchema);
  } else {
    models.User = existingModels.User;
  }

  if (!existingModels.Role) {
    const RoleSchema = require('./Role').schema;
    models.Role = mongooseInstance.model('Role', RoleSchema);
  } else {
    models.Role = existingModels.Role;
  }

  if (!existingModels.UserRole) {
    const UserRoleSchema = require('./UserRole').schema;
    models.UserRole = mongooseInstance.model('UserRole', UserRoleSchema);
  } else {
    models.UserRole = existingModels.UserRole;
  }

  if (!existingModels.UserTenant) {
    const UserTenantSchema = require('./UserTenant').schema;
    models.UserTenant = mongooseInstance.model('UserTenant', UserTenantSchema);
  } else {
    models.UserTenant = existingModels.UserTenant;
  }

  if (!existingModels.Tenant) {
    const TenantSchema = require('./Tenant').schema;
    models.Tenant = mongooseInstance.model('Tenant', TenantSchema);
  } else {
    models.Tenant = existingModels.Tenant;
  }

  if (!existingModels.Organization) {
    const OrganizationSchema = require('./Organization').schema;
    models.Organization = mongooseInstance.model('Organization', OrganizationSchema);
  } else {
    models.Organization = existingModels.Organization;
  }

  if (!existingModels.Migration) {
    const MigrationSchema = require('./Migration').schema;
    models.Migration = mongooseInstance.model('Migration', MigrationSchema);
  } else {
    models.Migration = existingModels.Migration;
  }

  return models;
}

module.exports.getModelsWithConnection = getModelsWithConnection;
