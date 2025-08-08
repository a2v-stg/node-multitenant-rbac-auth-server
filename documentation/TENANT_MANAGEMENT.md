# Multi-Tenant Management Guide

## Overview

The Admin UI provides comprehensive multi-tenant functionality that allows organizations to segregate data, users, and configurations across different business units, environments, or customer segments. The system ensures complete data isolation while providing flexible tenant management capabilities.

## Tenant Architecture

### Data Isolation Model

**Tenant ID Based Segregation:**
- Every data record includes a `tenantId` field
- Middleware automatically filters queries by tenant context
- User access is controlled per tenant
- Complete logical separation of tenant data

```javascript
// Example data structure
{
  _id: ObjectId("..."),
  tenantId: "production",
  name: "Document ABC",
  // ... other fields
}
```

### Tenant Hierarchy

```
Organization
├── Tenant: Production
│   ├── Users: [user1, user2, user3]
│   ├── Roles: [Admin, Manager, User]
│   └── Data: [decisions, documents, events]
├── Tenant: Staging  
│   ├── Users: [user1, user4]
│   ├── Roles: [Admin, Developer]
│   └── Data: [test_decisions, test_documents]
└── Tenant: Development
    ├── Users: [user1, user5]
    ├── Roles: [Admin, Developer]
    └── Data: [dev_data]
```

## Tenant Configuration

### Tenant Model

```javascript
// Tenant Schema
{
  _id: ObjectId,
  tenantId: String,        // Unique identifier
  tenantName: String,      // Display name
  name: String,           // Short name
  isDefault: Boolean,     // Default tenant flag
  envName: String,        // Environment (prod, staging, dev)
  
  // MFA Configuration
  mfaEnabled: Boolean,
  mfaGracePeriod: Number,
  mfaMethods: [String],
  mfaRequiredForLocalUsers: Boolean,
  
  // Module Configuration
  allowedModules: [String],
  allowedSocureSubModules: [String],
  
  // API Configuration
  apiKey: String,
  sharedKey: String,
  callbackUrl: String,
  callbackEndpoint: String,
  callbackRetries: String,
  documentCallbackUrl: String,
  
  // Rules Engine
  rulesEngineAccessToken: String,
  rulesEngineHost: String,
  
  // Feature Settings
  selectedEvents: [String],
  subscribeEventsFrom: [String],
  topFaceSimilarity: Number,
  topImageSimilarity: Number,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Default Tenant

Every organization must have a default tenant:
- `isDefault: true`
- Fallback for users without specific tenant assignment
- Cannot be deleted
- Houses system-wide configurations

## User-Tenant Relationships

### User Tenant Assignment

```javascript
// UserTenant Junction Model
{
  _id: ObjectId,
  userId: ObjectId,       // Reference to User
  tenantId: String,       // Tenant identifier
  assignedAt: Date,       // Assignment timestamp
  assignedBy: ObjectId,   // Admin who assigned
  isActive: Boolean       // Assignment status
}
```

### Access Patterns

#### Single Tenant Users
- Direct access to assigned tenant
- Automatic tenant selection
- Simplified login flow

#### Multi-Tenant Users
- Tenant selection interface required
- User chooses active tenant per session
- Cross-tenant access with proper authorization

### Tenant Assignment Logic

```javascript
const assignUserToTenant = async (userId, tenantId, assignedBy) => {
  // Check if assignment already exists
  const existing = await UserTenant.findOne({ userId, tenantId });
  if (existing) {
    throw new Error('User already assigned to tenant');
  }
  
  // Create new assignment
  const assignment = new UserTenant({
    userId,
    tenantId,
    assignedBy,
    assignedAt: new Date(),
    isActive: true
  });
  
  await assignment.save();
  return assignment;
};
```

## Tenant Selection Flow

### Authentication Flow with Tenant Selection

```
1. User authenticates successfully
2. System queries user's tenant assignments
3. Multiple tenants found?
   ├─ Yes → Redirect to tenant selection page
   └─ No → Auto-select single tenant
4. User selects tenant (for multi-tenant users)
5. System validates tenant access
6. Check tenant-specific MFA requirements
7. MFA required? → Complete MFA flow
8. Set tenant context in session
9. Redirect to dashboard
```

### Tenant Selection Interface

**Frontend Component:**
```vue
<!-- TenantSelection.vue -->
<template>
  <div class="tenant-selection">
    <h2>Select Your Workspace</h2>
    <div class="tenant-grid">
      <div 
        v-for="tenant in availableTenants" 
        :key="tenant.tenantId"
        class="tenant-card"
        @click="selectTenant(tenant)"
      >
        <h3>{{ tenant.tenantName }}</h3>
        <p>{{ tenant.envName }}</p>
        <div class="tenant-features">
          <span v-if="tenant.mfaEnabled" class="mfa-badge">MFA Enabled</span>
          <span class="module-count">{{ tenant.allowedModules.length }} Modules</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

### Session Management

```javascript
// Store tenant context in session
req.session.tenantId = selectedTenantId;
req.session.tenantName = selectedTenant.tenantName;
req.session.tenantConfig = selectedTenant.config;

// Middleware to validate tenant context
const validateTenantAccess = (req, res, next) => {
  if (!req.session.tenantId) {
    return res.status(401).json({ error: 'No tenant selected' });
  }
  
  // Add tenant filter to request
  req.tenantId = req.session.tenantId;
  next();
};
```

## Data Filtering & Isolation

### Automatic Tenant Filtering

**Middleware Implementation:**
```javascript
const addTenantFilter = (req, res, next) => {
  // Add tenant filter to all queries
  req.tenantFilter = { tenantId: req.session.tenantId };
  
  // Override query methods to include tenant filter
  const originalFind = req.model.find;
  req.model.find = function(filter = {}) {
    return originalFind.call(this, { ...filter, ...req.tenantFilter });
  };
  
  next();
};
```

### Query Patterns

```javascript
// Always include tenant filter
const getDecisions = async (req) => {
  const filter = {
    tenantId: req.session.tenantId,
    ...req.query.filters
  };
  
  return await DecisionModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(20);
};

// Aggregation with tenant context
const getDashboardStats = async (tenantId) => {
  return await DecisionModel.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: '$validation.decision',
        count: { $sum: 1 }
      }
    }
  ]);
};
```

## Tenant Administration

### Administrative Operations

#### 1. Create Tenant

```javascript
const createTenant = async (tenantData) => {
  // Validate tenant data
  const tenant = new Tenant({
    tenantId: generateTenantId(),
    tenantName: tenantData.name,
    envName: tenantData.environment,
    isDefault: false,
    
    // Default MFA settings
    mfaEnabled: true,
    mfaGracePeriod: 7,
    mfaMethods: ['totp'],
    mfaRequiredForLocalUsers: true,
    
    // Default modules
    allowedModules: ['dashboard', 'users', 'reports'],
    
    createdAt: new Date()
  });
  
  await tenant.save();
  return tenant;
};
```

#### 2. Update Tenant Configuration

```javascript
const updateTenantConfig = async (tenantId, updates) => {
  const tenant = await Tenant.findOne({ tenantId });
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  // Validate configuration changes
  if (updates.mfaMethods) {
    validateMfaMethods(updates.mfaMethods);
  }
  
  // Apply updates
  Object.assign(tenant, updates);
  tenant.updatedAt = new Date();
  
  await tenant.save();
  return tenant;
};
```

#### 3. Delete Tenant

```javascript
const deleteTenant = async (tenantId) => {
  const tenant = await Tenant.findOne({ tenantId });
  
  // Prevent deletion of default tenant
  if (tenant.isDefault) {
    throw new Error('Cannot delete default tenant');
  }
  
  // Check for active users
  const activeUsers = await UserTenant.countDocuments({ 
    tenantId, 
    isActive: true 
  });
  
  if (activeUsers > 0) {
    throw new Error('Cannot delete tenant with active users');
  }
  
  // Soft delete or archive tenant data
  await archiveTenantData(tenantId);
  await tenant.remove();
};
```

### User Assignment Management

#### Assign User to Tenant

```javascript
const assignUserToTenant = async (userId, tenantId, assignedBy) => {
  // Validate user exists
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  // Validate tenant exists
  const tenant = await Tenant.findOne({ tenantId });
  if (!tenant) throw new Error('Tenant not found');
  
  // Check existing assignment
  const existing = await UserTenant.findOne({ userId, tenantId });
  if (existing) {
    if (existing.isActive) {
      throw new Error('User already assigned to tenant');
    } else {
      // Reactivate existing assignment
      existing.isActive = true;
      existing.assignedAt = new Date();
      existing.assignedBy = assignedBy;
      await existing.save();
      return existing;
    }
  }
  
  // Create new assignment
  const assignment = new UserTenant({
    userId,
    tenantId,
    assignedBy,
    assignedAt: new Date(),
    isActive: true
  });
  
  await assignment.save();
  return assignment;
};
```

#### Remove User from Tenant

```javascript
const removeUserFromTenant = async (userId, tenantId) => {
  const assignment = await UserTenant.findOne({ userId, tenantId });
  if (!assignment) {
    throw new Error('User not assigned to tenant');
  }
  
  // Check if it's the user's only tenant
  const userTenants = await UserTenant.countDocuments({ 
    userId, 
    isActive: true 
  });
  
  if (userTenants === 1) {
    throw new Error('Cannot remove user from their only tenant');
  }
  
  // Soft delete assignment
  assignment.isActive = false;
  assignment.removedAt = new Date();
  await assignment.save();
};
```

## Tenant-Specific Features

### Module Access Control

```javascript
// Check if user can access module in current tenant
const canAccessModule = (user, module, tenantId) => {
  const tenant = user.tenants.find(t => t.tenantId === tenantId);
  if (!tenant) return false;
  
  return tenant.allowedModules.includes(module);
};

// Middleware for module access
const requireModule = (moduleName) => {
  return (req, res, next) => {
    if (!canAccessModule(req.user, moduleName, req.session.tenantId)) {
      return res.status(403).json({ error: 'Module access denied' });
    }
    next();
  };
};
```

### Environment-Specific Configuration

```javascript
// Get configuration based on tenant environment
const getTenantConfig = (tenant) => {
  const baseConfig = {
    apiTimeout: 30000,
    maxFileSize: '10MB',
    enableDebug: false
  };
  
  const envConfigs = {
    development: {
      ...baseConfig,
      enableDebug: true,
      apiTimeout: 60000
    },
    staging: {
      ...baseConfig,
      enableDebug: true
    },
    production: {
      ...baseConfig,
      maxFileSize: '5MB'
    }
  };
  
  return envConfigs[tenant.envName] || baseConfig;
};
```

## Security Considerations

### Cross-Tenant Security

1. **Data Isolation**: Ensure all queries include tenant filters
2. **Access Control**: Validate user permissions per tenant
3. **Session Security**: Secure tenant context in sessions
4. **API Security**: Validate tenant access on all endpoints

### Security Middleware

```javascript
const ensureTenantSecurity = (req, res, next) => {
  // Validate tenant session
  if (!req.session.tenantId) {
    return res.status(401).json({ error: 'No tenant context' });
  }
  
  // Validate user has access to tenant
  const hasAccess = req.user.tenants.some(
    t => t.tenantId === req.session.tenantId && t.isActive
  );
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  
  next();
};
```

## API Reference

### Tenant Management Endpoints

```javascript
// Get current tenant
GET /api/current-tenant

// Select tenant
POST /api/select-tenant
{
  tenantId: "production"
}

// Get user's tenants
GET /api/user/tenants

// Get tenant configuration (admin)
GET /api/admin/tenants/:tenantId

// Update tenant configuration (admin)
PUT /api/admin/tenants/:tenantId
{
  mfaEnabled: true,
  allowedModules: ["dashboard", "reports"]
}

// Assign user to tenant (admin)
POST /api/admin/tenants/:tenantId/users
{
  userId: "user_id"
}

// Remove user from tenant (admin)
DELETE /api/admin/tenants/:tenantId/users/:userId
```

## Troubleshooting

### Common Issues

#### 1. User Cannot Access Tenant

**Possible Causes:**
- User not assigned to tenant
- Assignment is inactive
- Session has wrong tenant context

**Solutions:**
- Verify user-tenant assignments
- Check assignment status
- Clear and re-establish session

#### 2. Data Not Filtered by Tenant

**Possible Causes:**
- Missing tenant filter in queries
- Middleware not applied
- Direct database access

**Solutions:**
- Ensure all queries include tenantId
- Apply tenant middleware to all routes
- Use centralized query methods

#### 3. Cross-Tenant Data Leakage

**Possible Causes:**
- Missing tenant validation
- Improper session handling
- Admin operations without checks

**Solutions:**
- Add tenant validation middleware
- Implement proper session management
- Add tenant checks to admin operations

### Debug Tools

```javascript
// Debug tenant context
const debugTenantContext = (req, res, next) => {
  console.log('Tenant Debug:', {
    sessionTenantId: req.session.tenantId,
    userTenants: req.user?.tenants?.map(t => t.tenantId),
    requestPath: req.path,
    hasValidContext: !!req.session.tenantId
  });
  next();
};
```

---

This multi-tenant system provides complete data isolation and flexible tenant management while maintaining security and usability across different organizational structures.