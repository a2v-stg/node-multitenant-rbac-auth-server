// Define all available permissions
const PERMISSIONS = {
  // User management
  'users:read': 'View users',
  'users:create': 'Create users',
  'users:update': 'Update users',
  'users:delete': 'Delete users',

  // Role management
  'roles:read': 'View roles',
  'roles:create': 'Create roles',
  'roles:update': 'Update roles',
  'roles:delete': 'Delete roles',
  'roles:assign': 'Assign roles to users',

  // Tenant management
  'tenant:read': 'View tenant information',
  'tenant:update': 'Update tenant settings',
  'tenant:delete': 'Delete tenant',

  // Dashboard access
  'dashboard:read': 'Access dashboard',
  'dashboard:admin': 'Admin dashboard access',

  // Reports and analytics
  'reports:read': 'View reports',
  'reports:create': 'Create reports',
  'reports:export': 'Export reports',

  // Settings
  'settings:read': 'View settings',
  'settings:update': 'Update settings',

  // System administration
  'system:admin': 'System administration',
  'system:audit': 'View audit logs'
};

// Predefined roles with their permissions
const PREDEFINED_ROLES = {
  super_admin: {
    name: 'Super Administrator',
    description: 'Full system access',
    permissions: Object.keys(PERMISSIONS),
    isSystem: true
  },
  tenant_admin: {
    name: 'Tenant Administrator',
    description: 'Full tenant access',
    permissions: [
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'roles:read',
      'roles:create',
      'roles:update',
      'roles:delete',
      'roles:assign',
      'tenant:read',
      'tenant:update',
      'dashboard:read',
      'dashboard:admin',
      'reports:read',
      'reports:create',
      'reports:export',
      'settings:read',
      'settings:update'
    ],
    isSystem: true
  },
  manager: {
    name: 'Manager',
    description: 'Team management access',
    permissions: [
      'users:read',
      'users:create',
      'users:update',
      'dashboard:read',
      'reports:read',
      'reports:create',
      'settings:read'
    ],
    isSystem: true
  },
  user: {
    name: 'User',
    description: 'Basic user access',
    permissions: ['dashboard:read', 'reports:read'],
    isSystem: true
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access',
    permissions: ['dashboard:read', 'reports:read'],
    isSystem: true
  }
};

// Helper functions
const permissionHelpers = {
  // Get all available permissions
  getAllPermissions: () => PERMISSIONS,

  // Get predefined roles
  getPredefinedRoles: () => PREDEFINED_ROLES,

  // Check if permission exists
  isValidPermission: permission =>
    Object.keys(PERMISSIONS).includes(permission),

  // Get permission description
  getPermissionDescription: permission =>
    PERMISSIONS[permission] || 'Unknown permission',

  // Group permissions by category
  getPermissionsByCategory: () => {
    const categories = {};
    Object.keys(PERMISSIONS).forEach(permission => {
      const category = permission.split(':')[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        key: permission,
        description: PERMISSIONS[permission]
      });
    });
    return categories;
  }
};

module.exports = {
  PERMISSIONS,
  PREDEFINED_ROLES,
  permissionHelpers
};
