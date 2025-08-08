# Admin UI Sample App - How to Use Guide

This guide provides comprehensive instructions for setting up, configuring, and using the Admin UI Sample App with the FDE (Fraud Detection Engine) integration. **The app now features a comprehensive dependency injection and theming system that ensures complete visual consistency.**

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Features & Usage](#features--usage)
- [Dependency Injection & Theming System](#dependency-injection--theming-system)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

## Overview

The Admin UI Sample App demonstrates the integration of the `admin-ui` submodule with a complete fraud detection system. It provides:

- **Complete Visual Consistency**: Comprehensive theming system with legacy design (Primary: #002e6d, Secondary: #b8252b)
- **Dependency Injection System**: Advanced component injection that ensures even submodule components use the correct theme
- **Dashboard**: Real-time statistics and analytics from FDE data
- **RBAC Management**: Role-Based Access Control with permissions
- **Settings Management**: Organization and system configuration
- **Tenant Management**: Multi-tenant support with tenant-specific data
- **User Management**: User profiles and access control
- **Core Data APIs**: Access to decisions, documents, events, errors, and security violations

## Prerequisites

- **Node.js** 18.x or higher
- **MongoDB** 4.4 or higher (running locally or remote)
- **Git** for cloning repositories
- **npm** or **yarn** for package management

## Installation & Setup

### 1. Environment Setup

Create a `.env` file in the sample-app root directory:

```bash
cp .env_sample .env
```

Configure your environment variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/fde_doc_db

# Session Configuration  
SESSION_SECRET=your-super-secret-session-key-here

# Server Configuration
NODE_ENV=development
PORT=3000

# OAuth Configuration (Optional)
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
OAUTH_PROVIDER=CLS
```

### 2. Install Dependencies

```bash
# Install sample-app dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies  
cd ../client && npm install
```

### 3. Database Setup

Ensure MongoDB is running and accessible at your `MONGODB_URI`. The application will automatically:

- Connect to the database
- Register FDE engine models
- Initialize the admin-ui submodule with proper context

## Configuration

### MongoDB Collections

The application expects the following collections with data:

- `decisionTree` - Decision records from FDE
- `documents` - Document processing records
- `event` - System events (singular, not plural)
- `error` - Error logs (singular, not plural)
- `blackList` - Blacklisted entities
- `securityViolation` - Security violations
- `retroreview` - Retrospective reviews

### Tenant Configuration

Each record should have a `tenantId` field for multi-tenant support:

```json
{
  "_id": "...",
  "tenantId": "default",
  "...": "other fields"
}
```

**Note**: The `blackList` collection may not have `tenantId` fields, which is expected.

## Running the Application

### Development Mode

Start both server and client in development mode:

```bash
npm run dev
```

This will start:
- **Server**: http://localhost:3000
- **Client**: http://localhost:3001 (or next available port)

### Production Mode

```bash
# Build client
cd client && npm run build

# Start server
cd ../server && npm start
```

## Features & Usage

### 1. Authentication & Login

- Navigate to http://localhost:3001
- Login using OAuth (if configured) or local authentication
- Select a tenant if multiple tenants are available

### 2. Dashboard

**URL**: `/dashboard`

The dashboard provides:
- **Real-time Statistics**: Document counts, decisions, events, errors
- **Recent Activity**: Last 7 days activity summary
- **Decision Analytics**: Breakdown of decision types
- **Tenant-specific Data**: All data filtered by selected tenant

### 3. RBAC Management

**URL**: `/rbac` 
**Requirements**: Admin permissions (`system:admin` or `roles:read`)

Features:
- **Permissions Management**: View all available system permissions
- **Role Management**: Create, edit, and delete custom roles
- **User Role Assignment**: Assign roles to users
- **Permission Categories**: Organized by functional areas

Available Permission Categories:
- User Management (`users:*`)
- Role Management (`roles:*`)
- Tenant Management (`tenant:*`)
- Dashboard Access (`dashboard:*`)
- Reports (`reports:*`)
- Settings (`settings:*`)
- System Administration (`system:*`)

### 4. Settings Management

**URL**: `/settings-app`
**Requirements**: Admin permissions (`settings:read`)

#### Organization Settings
- **MFA Configuration**: Enable/disable multi-factor authentication
- **Password Policies**: Set complexity requirements
- **Audit Logging**: Configure audit trail settings
- **Feature Flags**: Enable/disable application features

#### System Settings (Read-only)
- Environment information
- Application version
- Database connection status
- System health metrics

### 5. Tenant Management

**URL**: `/tenant-management`

Features:
- **Current Tenant Info**: View selected tenant details
- **Tenant Switching**: Switch between available tenants
- **Tenant Configuration**: View tenant-specific settings

### 6. Core Data Access

Navigate through the sidebar to access:

- **Decisions** (`/core-data`): View fraud detection decisions
- **Documents**: Document processing results
- **Events**: System events and activities
- **Errors**: Error logs and troubleshooting
- **Security Violations**: Security-related incidents

Each section provides:
- **Filtering**: By date, status, type, etc.
- **Search**: Text-based search capabilities
- **Pagination**: Efficient data browsing
- **Export**: Data export functionality (where applicable)

## Dependency Injection & Theming System

The Admin UI Sample App implements a sophisticated dependency injection and theming system that ensures complete visual consistency across different implementations. This system allows the sample-app to provide its own components and styling to child components, even when they're from the admin submodule.

### Overview

The theming system consists of three main components:

1. **ComponentProvider**: Provides sample-app components and theme to child components
2. **Theme System**: Comprehensive SCSS-based theming with legacy design
3. **Theme-Aware Components**: Components that automatically adapt to injected theme

### 1. Theme Configuration

#### Environment Variables

You can configure themes using environment variables:

```env
# Theme Configuration (Optional)
SAMPLE_APP_THEME=legacy
SAMPLE_APP_PRIMARY_COLOR=#002e6d
SAMPLE_APP_SECONDARY_COLOR=#b8252b
SAMPLE_APP_TERTIARY_COLOR=#66b3ff
SAMPLE_APP_LIGHT_COLOR=#f4f8fa
SAMPLE_APP_GREY_COLOR=#e9f1f5
```

#### Default Color Scheme

The sample-app uses a comprehensive color scheme based on the legacy design:

- **Primary**: #002e6d (Dark Blue) - Main brand color
- **Secondary**: #b8252b (Red) - Accent and active states
- **Tertiary**: #66b3ff (Light Blue) - Hover and interactive elements
- **Light**: #f4f8fa (Light Gray) - Backgrounds and subtle elements
- **Grey**: #e9f1f5 (Medium Gray) - Borders and dividers
- **Background**: #e2eaef (Light Blue-Gray) - Main application background

### 2. Component Provider Setup

The `ComponentProvider` is the core of the dependency injection system:

```javascript
// sample-app/client/src/components/ComponentProvider.vue
<template>
  <div class="sample-app-theme">
    <slot />
  </div>
</template>

<script>
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppLayout from './AppLayout.vue'
import '../assets/scss/sample-app-theme.scss'

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
</script>
```

### 3. Using the Theming System

#### In Your Components

To use the theming system in your components:

```javascript
// In your Vue component
export default {
  name: 'MyComponent',
  inject: {
    parentAppTheme: { default: null },
    isParentApp: { default: false }
  },
  computed: {
    themeColors() {
      return this.parentAppTheme || {
        primary: '#007bff',
        secondary: '#6c757d'
      }
    }
  }
}
```

#### Theme-Aware Components

Components automatically adapt to the injected theme:

```javascript
// src/client/src/components/AppLayout.vue
<template>
  <div class="app-layout" :class="{ 'sample-app-theme': isParentApp }">
    <component :is="sidebarComponent" />
    <div class="main-content">
      <component :is="headerComponent" />
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppLayout',
  inject: {
    parentAppSidebar: { default: null },
    parentAppHeader: { default: null },
    isParentApp: { default: false },
    parentAppTheme: { default: null }
  },
  computed: {
    sidebarComponent() {
      return this.isParentApp && this.parentAppSidebar ? this.parentAppSidebar : AppSidebar
    },
    headerComponent() {
      return this.isParentApp && this.parentAppHeader ? this.parentAppHeader : AppHeader
    }
  }
}
</script>
```

### 4. Customizing Themes

#### Overriding Theme Variables

You can customize the theme by overriding CSS variables:

```scss
// In your component or global styles
:root {
  --parent-app-primary: #your-primary-color;
  --parent-app-secondary: #your-secondary-color;
  --parent-app-tertiary: #your-tertiary-color;
  --parent-app-light: #your-light-color;
  --parent-app-grey: #your-grey-color;
}
```

#### Extending the Theme

You can extend the theme by adding custom styles:

```scss
// Extend the sample-app theme
.sample-app-theme {
  // Your custom styles
  .custom-component {
    background-color: var(--parent-app-primary);
    color: white;
  }
  
  .custom-button {
    background-color: var(--parent-app-secondary);
    border-color: var(--parent-app-secondary);
    
    &:hover {
      background-color: darken(var(--parent-app-secondary), 10%);
    }
  }
}
```

### 5. Integration with Parent Applications

#### Basic Integration

Parent applications can integrate the theming system:

```javascript
// In parent app's main.js
import { ComponentProvider } from '@admin-ui/components';
import '@admin-ui/assets/scss/sample-app-theme.scss';

// Wrap the application
const app = createApp(App);
app.component('ComponentProvider', ComponentProvider);
```

```vue
<!-- In parent app's App.vue -->
<template>
  <div id="app">
    <ComponentProvider>
      <router-view />
    </ComponentProvider>
  </div>
</template>
```

#### Advanced Integration

For more advanced integration, you can pass custom themes:

```javascript
// Custom theme configuration
const customTheme = {
  primary: '#1a365d',
  secondary: '#e53e3e',
  tertiary: '#3182ce',
  light: '#f7fafc',
  grey: '#e2e8f0'
};

// In your ComponentProvider
export default {
  provide() {
    return {
      parentAppTheme: customTheme,
      isParentApp: true
    }
  }
}
```

### 6. Theme System Architecture

#### File Structure

```
sample-app/client/src/
├── components/
│   ├── ComponentProvider.vue     # Dependency injection provider
│   ├── AppLayoutWrapper.vue      # Theme-aware layout wrapper
│   ├── AppSidebar.vue            # Sample-app sidebar
│   ├── AppHeader.vue             # Sample-app header
│   └── AppLayout.vue             # Sample-app layout
├── assets/
│   └── scss/
│       └── sample-app-theme.scss # Comprehensive theme
└── views/
    └── Sample.vue                # Demo page with theme examples
```

#### SCSS Theme Structure

```scss
// sample-app-theme.scss
$primary: #002e6d;
$secondary: #b8252b;
$tertiary: #66b3ff;
$light: #f4f8fa;
$grey: #e9f1f5;

.sample-app-theme {
  font-family: 'Noto Sans', Avenir, Helvetica, Arial, sans-serif;
  color: $primary-font-color;
  background-color: #e2eaef;

  // Component-specific styling
  .app-sidebar {
    background: $primary !important;
    .nav-link.active {
      background: $secondary !important;
    }
  }

  .app-header {
    background-color: $light !important;
    color: $primary !important;
  }

  .card {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
}
```

### 7. Best Practices

#### Theme Usage Guidelines

1. **Always use CSS variables** for theme colors to ensure consistency
2. **Test with different themes** to ensure your components work well
3. **Use semantic color names** (primary, secondary) rather than specific colors
4. **Provide fallbacks** for when theme variables are not available
5. **Document theme requirements** for your components

#### Component Development

```javascript
// Good: Use theme variables
export default {
  computed: {
    componentStyle() {
      return {
        backgroundColor: this.themeColors.primary,
        color: 'white'
      }
    }
  }
}

// Avoid: Hard-coded colors
export default {
  data() {
    return {
      style: {
        backgroundColor: '#002e6d', // Don't do this
        color: 'white'
      }
    }
  }
}
```

### 8. Troubleshooting Themes

#### Common Issues

1. **Theme not applying**: Ensure ComponentProvider is wrapping your application
2. **Colors not updating**: Check if CSS variables are properly defined
3. **Component not themed**: Verify the component is using the injected theme
4. **Styling conflicts**: Use `!important` sparingly and prefer CSS specificity

#### Debug Mode

Enable theme debugging:

```javascript
// In your component
console.log('Theme:', this.parentAppTheme);
console.log('Is Sample App:', this.isParentApp);
```

## API Documentation

### Authentication Endpoints

```
POST /api/auth/login          # User login
GET  /api/auth/me            # Current user info
POST /api/auth/logout        # User logout
GET  /api/auth/oauth         # OAuth login
```

### RBAC Endpoints

```
GET  /api/rbac/permissions   # List all permissions
GET  /api/rbac/roles        # List roles
POST /api/rbac/roles        # Create role
PUT  /api/rbac/roles/:id    # Update role
DELETE /api/rbac/roles/:id  # Delete role
```

### Settings Endpoints

```
GET  /api/settings          # Get all settings
PUT  /api/settings/organization # Update org settings
```

### Tenant Endpoints

```
GET  /api/current-tenant    # Get current tenant
POST /api/select-tenant     # Select tenant
```

### Core Data Endpoints

```
GET  /api/core/dashboard-stats     # Dashboard statistics
GET  /api/core/decisions          # Decision records
GET  /api/core/documents          # Document records
GET  /api/core/events             # Event records
GET  /api/core/errors             # Error records
GET  /api/core/blacklist          # Blacklist records
GET  /api/core/security-violations # Security violations
GET  /api/core/retro-reviews      # Retro reviews
```

All endpoints support:
- **Pagination**: `?page=1&limit=20`
- **Sorting**: `?sortBy=createdTime&sortOrder=desc`
- **Filtering**: Various filter parameters per endpoint

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

**Problem**: `MongoDB connection error`

**Solutions**:
- Verify MongoDB is running: `mongosh --eval "db.runCommand('ping')"`
- Check `MONGODB_URI` in `.env` file
- Ensure database permissions are correct

#### 2. Models Returning Zero Data

**Problem**: Dashboard shows zeros for all models except documents

**Solution**: 
- Check collection names in MongoDB (should be singular: `event`, `error`, not plural)
- Verify `tenantId` fields exist in collections
- Check server logs for model registration errors

#### 3. Authentication/Session Issues

**Problem**: Getting redirected to login or "Authentication required" errors

**Solutions**:
- Clear browser cookies and session storage
- Check session configuration in `.env`
- Verify OAuth configuration if using OAuth
- Restart the server after configuration changes

#### 4. RBAC/Settings Access Denied

**Problem**: Cannot access RBAC or Settings pages

**Solution**:
- Ensure user has required permissions (`system:admin`, `roles:read`, `settings:read`)
- Check user role assignments
- Verify permissions are correctly loaded

#### 5. Port Conflicts

**Problem**: `EADDRINUSE: address already in use`

**Solutions**:
- Kill existing processes: `pkill -f "nodemon app.js"`
- Change port in configuration
- Use different ports for client and server

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
DEBUG=admin-ui:*
```

### Health Check

Test system health:

```bash
# Test server
curl http://localhost:3000/api/health

# Test database connection
curl http://localhost:3000/api/core/dashboard-stats
```

## Architecture

### Project Structure

```
sample-app/
├── client/                 # Vue.js frontend
│   ├── src/
│   │   ├── components/     # Reusable Vue components
│   │   │   ├── ComponentProvider.vue  # Dependency injection provider
│   │   │   ├── AppLayoutWrapper.vue   # Theme-aware layout wrapper
│   │   │   ├── AppSidebar.vue         # Sample-app sidebar
│   │   │   ├── AppHeader.vue          # Sample-app header
│   │   │   └── AppLayout.vue          # Sample-app layout
│   │   ├── assets/         # Theme and styling assets
│   │   │   └── scss/       # SCSS theme system
│   │   │       └── sample-app-theme.scss  # Comprehensive theme
│   │   ├── views/         # Page components
│   │   ├── router/        # Vue Router configuration
│   │   └── main.js        # App entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API route handlers
│   ├── middleware/        # Custom middleware
│   ├── scripts/           # Utility scripts
│   └── app.js            # Server entry point
├── stgcore-app-fde-engine/ # FDE engine submodule
└── package.json
```

### Integration Points

1. **Admin UI Submodule**: Provides core RBAC, settings, and user management
2. **FDE Engine**: Supplies data models and business logic
3. **MongoDB**: Shared database instance across all components
4. **Session Management**: Unified authentication across submodules
5. **Dependency Injection System**: Provides theme-aware components and styling

### Data Flow

```
Client (Vue.js) 
    ↓ HTTP Requests
Sample App Server (Express.js)
    ↓ Route Delegation  
Admin UI Submodule
    ↓ Model Access
MongoDB Collections (FDE Data)
```

### Theme System Flow

```
ComponentProvider (Theme Provider)
    ↓ Theme Injection
Theme-Aware Components
    ↓ Dynamic Component Selection
Sample-App Components (with legacy styling)
    ↓ Fallback
Admin UI Components (default styling)
```

### Security Model

- **Authentication**: OAuth2 + Local authentication
- **Authorization**: Role-Based Access Control (RBAC)
- **Session Management**: Secure session cookies
- **Tenant Isolation**: Data segregation by `tenantId`
- **Permission Validation**: Middleware-based permission checking
- **Theme Security**: Secure theme injection with fallback support

---

## Need Help?

- Check the [Troubleshooting](#troubleshooting) section
- Review server logs for detailed error information
- Ensure all prerequisites are met
- Verify environment configuration matches your setup

For development questions, refer to the source code documentation and inline comments.