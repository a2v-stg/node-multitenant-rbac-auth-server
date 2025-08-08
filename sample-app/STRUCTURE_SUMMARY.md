# Sample App Structure Summary

## What We've Accomplished

We have successfully restructured the project to better simulate how a real application would use the admin-ui as a submodule. Here's what we've implemented:

## New Project Structure

```
admin-ui/
├── src/                          # Admin UI submodule (simulated)
│   ├── client/                   # Admin UI client
│   │   ├── src/
│   │   │   ├── components/       # All admin-ui components
│   │   │   ├── views/           # All admin-ui views
│   │   │   ├── router/          # Admin-ui router
│   │   │   ├── utils/           # Admin-ui utilities
│   │   │   ├── stores/          # Admin-ui state management
│   │   │   ├── services/        # Admin-ui services
│   │   │   ├── App.vue          # Admin-ui main app
│   │   │   └── main.js          # Admin-ui entry point
│   │   ├── package.json         # Admin-ui client dependencies
│   │   └── vite.config.js       # Admin-ui client config
│   └── server/                   # Admin UI server
│       ├── app.js               # Admin-ui server app
│       ├── routes/              # Admin-ui routes
│       ├── services/            # Admin-ui services
│       ├── models/              # Admin-ui models
│       ├── middleware/          # Admin-ui middleware
│       ├── config/              # Admin-ui config
│       ├── utils/               # Admin-ui utilities
│       └── package.json         # Admin-ui server dependencies
├── sample-app/                   # Sample application
│   ├── client/                   # Sample app client
│   │   ├── src/                  # Sample app client source
│   │   │   ├── components/       # Sample app components (with dependency injection)
│   │   │   │   ├── ComponentProvider.vue  # Dependency injection provider
│   │   │   │   ├── AppLayoutWrapper.vue   # Theme-aware layout wrapper
│   │   │   │   ├── AppSidebar.vue         # Sample-app sidebar
│   │   │   │   ├── AppHeader.vue          # Sample-app header
│   │   │   │   └── AppLayout.vue          # Sample-app layout
│   │   │   ├── assets/           # Theme and styling assets
│   │   │   │   └── scss/         # SCSS theme system
│   │   │   │       └── sample-app-theme.scss  # Comprehensive theme
│   │   │   ├── views/           # Sample app views (references admin-ui)
│   │   │   ├── router/          # Sample app router (references admin-ui)
│   │   │   ├── utils/           # Sample app utilities (references admin-ui)
│   │   │   ├── stores/          # Sample app state (references admin-ui)
│   │   │   ├── services/        # Sample app services (references admin-ui)
│   │   │   ├── App.vue          # Sample app main app (with theme provider)
│   │   │   └── main.js          # Sample app entry point
│   │   ├── package.json          # Client dependencies
│   │   └── vite.config.js        # Vite configuration
│   ├── server/                   # Sample app server
│   │   ├── app.js                # Server application (references admin-ui)
│   │   ├── package.json          # Server dependencies
│   │   └── routes/               # Sample app routes
│   └── package.json              # Sample app orchestrator
├── .env                          # Environment variables (root)
└── package.json                  # Main package.json
```

## Key Features of the New Structure

### 1. **Simulated Submodule Structure**
- `src/` directory contains the admin-ui "submodule"
- `sample-app/` directory contains the sample application
- Clear separation between submodule and application code

### 2. **Dependency Injection & Theming System**
- **ComponentProvider**: Provides sample-app components and theme to child components
- **Theme System**: Comprehensive SCSS-based theming with legacy design (Primary: #002e6d, Secondary: #b8252b)
- **Theme-Aware Components**: Components automatically adapt to injected theme
- **Visual Consistency**: Complete look and feel matching across all components

### 3. **Module Aliases for Easy References**
- Sample-app client references admin-ui components via `@admin-ui` aliases
- Sample-app server references admin-ui services via `@admin-ui` aliases
- Clean import paths that simulate real submodule usage

### 4. **Independent Application Structure**
- Sample-app has its own client and server directories
- Each can be developed and deployed independently
- References admin-ui functionality without copying code

### 5. **Root-Level Orchestration**
- Main `package.json` includes scripts for both admin-ui and sample-app
- `npm run sample-app:dev` - Runs sample-app in development mode
- `npm run sample-app:start` - Runs sample-app in production mode
- `npm run dev` - Runs admin-ui in development mode

## Dependency Injection & Theming System

### Overview

The sample-app implements a sophisticated dependency injection and theming system that ensures complete visual consistency across different implementations. This system allows the sample-app to provide its own components and styling to child components, even when they're from the admin submodule.

### Key Components

#### 1. ComponentProvider.vue
- **Purpose**: Provides sample-app components and theme to child components
- **Features**: 
  - Wraps entire application with `sample-app-theme` class
  - Provides sample-app components (AppSidebar, AppHeader, AppLayout)
  - Provides theme information and styling context
  - Sets `isSampleApp: true` flag for context awareness

#### 2. AppLayoutWrapper.vue
- **Purpose**: Dynamic layout wrapper that handles theme selection
- **Features**:
  - Falls back to admin layout when sample-app layout isn't available
  - Provides a clean interface for components to use
  - Applies theme class when in sample-app context

#### 3. sample-app-theme.scss
- **Purpose**: Comprehensive SCSS-based theming system
- **Features**:
  - Legacy color scheme (Primary: #002e6d, Secondary: #b8252b)
  - Component-specific styling
  - Responsive design
  - Accessibility compliance

### Color Scheme

The sample-app uses a comprehensive color scheme based on the legacy design:

- **Primary**: #002e6d (Dark Blue) - Main brand color
- **Secondary**: #b8252b (Red) - Accent and active states
- **Tertiary**: #66b3ff (Light Blue) - Hover and interactive elements
- **Light**: #f4f8fa (Light Gray) - Backgrounds and subtle elements
- **Grey**: #e9f1f5 (Medium Gray) - Borders and dividers
- **Background**: #e2eaef (Light Blue-Gray) - Main application background

## How It Works

### 1. **Client-Side Integration with Theming**
```javascript
// sample-app/client/src/main.js
import routes from '@admin-ui/router'  // References src/client/src/router
import './assets/scss/sample-app-theme.scss'  // Import theme system

// sample-app/client/src/App.vue
<template>
  <div id="app" class="sample-app-theme">
    <ComponentProvider>
      <router-view />
    </ComponentProvider>
  </div>
</template>
```

### 2. **Dependency Injection Pattern**
```javascript
// sample-app/client/src/components/ComponentProvider.vue
export default {
  name: 'ComponentProvider',
  provide() {
    return {
      sampleAppSidebar: AppSidebar,
      sampleAppHeader: AppHeader,
      sampleAppLayout: AppLayout,
      sampleAppTheme: {
        primary: '#002e6d',
        secondary: '#b8252b',
        tertiary: '#66b3ff',
        light: '#f4f8fa',
        grey: '#e9f1f5'
      },
      isSampleApp: true
    }
  }
}
```

### 3. **Theme-Aware Components**
```javascript
// src/client/src/components/AppLayout.vue
export default {
  inject: {
    sampleAppSidebar: { default: null },
    sampleAppHeader: { default: null },
    isSampleApp: { default: false },
    sampleAppTheme: { default: null }
  },
  computed: {
    sidebarComponent() {
      return this.isSampleApp && this.sampleAppSidebar ? this.sampleAppSidebar : AppSidebar
    }
  }
}
```

### 4. **Server-Side Integration**
```javascript
// sample-app/server/app.js
const { setupPassport } = require('@admin-ui/config/passport')  // References src/server/config/passport.js
const authRoutes = require('@admin-ui/routes/auth')  // References src/server/routes/auth.js
```

### 5. **Environment Configuration**
- Root `.env` file is used by both admin-ui and sample-app
- Sample-app server loads environment from root directory
- Consistent configuration across both applications

### 4. **Development Workflow**
```bash
# Run sample-app (client on 3001, server on 3000)
npm run sample-app:dev

# Run admin-ui (client on 3000, server on 3000)
npm run dev

# Install sample-app dependencies
npm run sample-app:install
```

## Benefits of This Structure

### 1. **Realistic Submodule Simulation**
- Mimics how a real application would use admin-ui as a submodule
- Clear separation between submodule and application code
- Easy to understand and maintain

### 2. **Independent Development**
- Sample-app can be developed independently
- Admin-ui can be updated without affecting sample-app
- Easy to test integration and compatibility

### 3. **Scalable Architecture**
- Easy to add more applications using the same pattern
- Each application can have its own customizations
- Shared functionality through admin-ui submodule

### 4. **Clear Documentation**
- Structure is self-documenting
- Easy to understand how to integrate admin-ui
- Clear examples of module aliases and imports

## Usage Examples

### Running the Sample App
```bash
# From root directory
npm run sample-app:dev

# From sample-app directory
cd sample-app
npm run dev
```

### Adding Custom Features
```vue
<!-- sample-app/client/src/views/CustomView.vue -->
<template>
  <AppLayout>
    <div class="custom-container">
      <!-- Your custom content -->
    </div>
  </AppLayout>
</template>

<script>
import AppLayout from '@admin-ui/components/AppLayout.vue'

export default {
  name: 'CustomView',
  components: {
    AppLayout,
  },
}
</script>
```

### Referencing Admin-UI Components
```javascript
// In sample-app/client/src/main.js
import routes from '@admin-ui/router'
import AppLayout from '@admin-ui/components/AppLayout.vue'
import DataTable from '@admin-ui/components/DataTable.vue'

// In sample-app/server/app.js
const authService = require('@admin-ui/auth')
const mfaService = require('@admin-ui/mfa')
const rbacService = require('@admin-ui/rbac')
```

## Conclusion

This new structure successfully demonstrates:

1. **How to use admin-ui as a submodule** in a real application
2. **Clean separation** between submodule and application code
3. **Easy integration** through module aliases
4. **Independent development** of both submodule and application
5. **Scalable architecture** for multiple applications

The sample-app now serves as a perfect reference implementation for how to integrate the admin-ui submodule into other projects while maintaining clean, maintainable code. 