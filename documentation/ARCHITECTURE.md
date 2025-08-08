# Admin UI Architecture & Implementation Guide

## Overview

The Admin UI is designed as a reusable submodule that provides comprehensive user management, role-based access control (RBAC), and organizational settings functionality. It can be integrated into parent applications while maintaining clean separation of concerns. The system now features a comprehensive **dependency injection and theming system** that ensures complete visual consistency across different implementations.

## Architecture Design

### Submodule Structure

```
admin-ui/
├── src/
│   ├── client/          # Vue.js frontend components
│   │   ├── components/  # Reusable UI components
│   │   ├── views/       # Page components (Dashboard, RBAC, Settings)
│   │   ├── router/      # Vue Router configuration
│   │   ├── services/    # Frontend service layer
│   │   └── assets/      # Styling and theme assets
│   └── server/          # Node.js backend
│       ├── routes/      # API route handlers
│       ├── middleware/  # Authentication, RBAC, validation
│       ├── models/      # Database models (User, Role, Tenant, etc.)
│       ├── services/    # Business logic services
│       └── config/      # Configuration and permissions
├── sample-app/          # Reference implementation with theming system
└── package.json         # Main package configuration
```

### Dependency Injection & Theming System

#### 1. Component Provider Pattern

The sample-app implements a sophisticated dependency injection system that ensures complete visual consistency:

```javascript
// ComponentProvider.vue - Provides sample-app components and theme
export default {
  name: 'ComponentProvider',
  provide() {
    return {
      // Sample-app specific components
      parentAppSidebar: AppSidebar,
      parentAppHeader: AppHeader,
      parentAppLayout: AppLayout,
      // Theme information
      parentAppTheme: {
        primary: '#002e6d',
        secondary: '#b8252b',
        tertiary: '#66b3ff',
        light: '#f4f8fa',
        grey: '#e9f1f5'
      },
      // Context flag
      isParentApp: true
    }
  }
}
```

#### 2. Theme-Aware Components

Components automatically adapt to the injected theme:

```javascript
// AppLayout.vue - Adapts to sample-app theme when available
export default {
  inject: {
    parentAppSidebar: { default: null },
    parentAppHeader: { default: null },
    isParentApp: { default: false },
    parentAppTheme: { default: null }
  },
  computed: {
    sidebarComponent() {
      return this.isParentApp && this.parentAppSidebar ? this.parentAppSidebar : AppSidebar
    }
  }
}
```

#### 3. Comprehensive Theming System

The sample-app features a complete SCSS-based theming system:

```scss
// sample-app-theme.scss - Legacy design system
$primary: #002e6d;      // Dark Blue
$secondary: #b8252b;    // Red
$tertiary: #66b3ff;     // Light Blue
$light: #f4f8fa;        // Light Gray
$grey: #e9f1f5;         // Medium Gray

.sample-app-theme {
  font-family: 'Noto Sans', Avenir, Helvetica, Arial, sans-serif;
  color: $primary-font-color;
  background-color: #e2eaef;
  
  // Component-specific styling
  .app-sidebar { background: $primary; }
  .app-header { background-color: $light; }
  .card { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
}
```

### Integration Points

#### 1. Context-Based Model Sharing

The admin-ui uses a context pattern to share database models and connections:

```javascript
// Parent app initialization
const adminUI = require('@admin-ui');

await adminUI.initApp({
  config: { /* app config */ },
  logger: logger,
  mongoose: mongoose,
  models: {
    // Parent app can provide additional models
    ...customModels
  }
});
```

#### 2. Route Mounting

The admin-ui provides routes that can be mounted at any path:

```javascript
const adminRoutes = adminUI.getRoutes();
app.use('/', adminRoutes);  // Mount at root
app.use('/admin', adminRoutes);  // Or at /admin prefix
```

#### 3. Middleware Integration

Reusable middleware for authentication and authorization:

```javascript
const { authMiddleware, rbacMiddleware } = adminUI.getMiddleware();

// Use in parent app routes
app.get('/protected', authMiddleware.ensureAuthenticated, (req, res) => {
  // Protected route logic
});
```

#### 4. Theme Integration

The theming system can be integrated into parent applications:

```javascript
// Parent app can use the sample-app theme system
import { ComponentProvider } from '@admin-ui/components';
import '@admin-ui/assets/scss/sample-app-theme.scss';

// Wrap the application with theme provider
<ComponentProvider>
  <router-view />
</ComponentProvider>
```

## Core Components

### 1. Authentication System

**Features:**
- Local authentication with username/password
- OAuth2 integration (configurable providers)
- Session management with MongoDB store
- Multi-factor authentication (MFA) support

**Implementation:**
- Passport.js for authentication strategies
- bcrypt for password hashing
- express-session for session management
- speakeasy for TOTP generation

### 2. Role-Based Access Control (RBAC)

**Permission System:**
```javascript
const PERMISSIONS = {
  'users:read': 'View users',
  'users:create': 'Create users',
  'roles:manage': 'Manage roles',
  'settings:admin': 'Admin settings',
  // ... more permissions
};
```

**Role Management:**
- System roles (non-deletable): Admin, Manager, User
- Custom roles with configurable permissions
- User-role assignments with tenant context

### 3. Multi-Tenant Architecture

**Tenant Isolation:**
- Data segregation by `tenantId` field
- Tenant-specific configurations
- User access control per tenant
- Tenant selection interface

**Implementation:**
```javascript
// Middleware ensures tenant context
const validateTenantAccess = (req, res, next) => {
  if (!req.session.tenantId) {
    return res.status(401).json({ error: 'No tenant selected' });
  }
  req.tenantId = req.session.tenantId;
  next();
};
```

### 4. Settings Management

**Organization Settings:**
- MFA configuration
- Password policies  
- Audit logging settings
- Feature flags

**System Settings:**
- Environment information
- Database status
- Application metadata

## Database Models

### Core Models

```javascript
// User Model
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  profile: {
    firstName: String,
    lastName: String,
    avatar: String
  },
  mfa: {
    enabled: Boolean,
    secret: String,
    methods: [String]
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Role Model
{
  _id: ObjectId,
  name: String,
  description: String,
  permissions: [String],
  isSystemRole: Boolean,
  tenantId: String,
  createdAt: Date
}

// Tenant Model  
{
  _id: ObjectId,
  name: String,
  tenantId: String,
  isDefault: Boolean,
  settings: {
    mfaEnabled: Boolean,
    mfaMethods: [String],
    passwordPolicy: Object
  },
  createdAt: Date
}
```

### Relationships

- **User ↔ Tenant**: Many-to-many via UserTenant junction table
- **User ↔ Role**: Many-to-many via UserRole junction table  
- **Role ↔ Tenant**: Roles are scoped to tenants
- **Settings ↔ Organization**: One-to-one relationship

## API Design

### RESTful Endpoints

```
# Authentication
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout

# RBAC Management
GET  /api/rbac/permissions
GET  /api/rbac/roles
POST /api/rbac/roles
PUT  /api/rbac/roles/:id

# User Management
GET  /api/users
POST /api/users
PUT  /api/users/:id

# Tenant Management
GET  /api/current-tenant
POST /api/select-tenant

# Settings
GET  /api/settings
PUT  /api/settings/organization
```

### Response Format

```javascript
// Success Response
{
  success: true,
  data: { /* response data */ },
  pagination: { /* pagination info */ } // for list endpoints
}

// Error Response
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE" // optional
}
```

## Security Implementation

### 1. Authentication Security

- **Password Security**: bcrypt with 12 rounds
- **Session Security**: Secure cookies, CSRF protection
- **MFA Support**: TOTP, SMS, Voice, Authy integration

### 2. Authorization Security

- **Permission-based**: Granular permission checking
- **Role-based**: Hierarchical role system
- **Tenant isolation**: Data segregation by tenant

### 3. Input Validation

- **Schema validation**: Joi validation middleware
- **SQL injection**: MongoDB query sanitization
- **XSS protection**: Input sanitization and output encoding

## Performance Considerations

### 1. Database Optimization

- **Indexing**: Proper indexes on frequently queried fields
- **Connection pooling**: MongoDB connection pool management
- **Query optimization**: Efficient queries with proper filtering

### 2. Caching Strategy

- **Session caching**: Redis session store for production
- **Static assets**: CDN for static file serving
- **API response caching**: Cache frequently accessed data

### 3. Frontend Optimization

- **Code splitting**: Lazy loading of Vue components
- **Bundle optimization**: Tree shaking and minification
- **Asset optimization**: Image compression and optimization

## Development Guidelines

### 1. Code Organization

- **Modular structure**: Clear separation of concerns
- **Service layer**: Business logic in dedicated services
- **Middleware pattern**: Reusable middleware components

### 2. Error Handling

- **Centralized error handling**: Global error middleware
- **Logging**: Structured logging with log4js
- **Monitoring**: Health check endpoints

### 3. Testing Strategy

- **Unit tests**: Jest for backend services
- **Integration tests**: API endpoint testing
- **Frontend tests**: Vue Test Utils for components

## Deployment Architecture

### Development Environment

```
┌─────────────────┐    ┌─────────────────┐
│   Vue.js App    │    │   Express API   │
│   Port 3001     │◄──►│   Port 3000     │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   MongoDB       │
                    │   Port 27017    │
                    └─────────────────┘
```

### Production Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │◄──►│   Node.js App   │◄──►│   MongoDB       │
│   (Nginx)       │    │   (PM2)         │    │   Replica Set   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Redis Cache   │
                    │   (Sessions)    │
                    └─────────────────┘
```

## Configuration Management

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/admin_ui
REDIS_URL=redis://localhost:6379

# Security
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret

# OAuth (Optional)
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret

# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

### Feature Flags

```javascript
const features = {
  mfaEnabled: process.env.MFA_ENABLED === 'true',
  oauthEnabled: process.env.OAUTH_ENABLED === 'true',
  auditLogging: process.env.AUDIT_LOGGING === 'true',
  adminDashboard: process.env.ADMIN_DASHBOARD === 'true'
};
```

## Migration Strategy

### Database Migrations

The system includes a migration framework for database schema changes:

```javascript
// migrations/1.0.0-initial-schema.js
module.exports = {
  version: '1.0.0',
  description: 'Initial schema setup',
  up: async (mongoose) => {
    // Migration logic
  },
  down: async (mongoose) => {
    // Rollback logic  
  }
};
```

### Upgrade Path

1. **Version compatibility**: Semantic versioning for breaking changes
2. **Data migration**: Automated migration scripts
3. **Configuration updates**: Environment variable documentation
4. **API versioning**: Backward compatibility maintenance

---

This architecture provides a solid foundation for scalable, secure, and maintainable admin functionality that can be easily integrated into any Node.js application.