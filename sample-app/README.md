# Sample App - Admin UI Integration Demo

This sample-app demonstrates how to integrate and reuse the admin-ui submodule with minimal configuration while maintaining the exact same look, feel, and functionality. **The app now features a comprehensive dependency injection and theming system that ensures complete visual consistency.**

## New Project Structure

```
admin-ui/
├── src/                          # Admin UI submodule (simulated)
│   ├── client/                   # Admin UI client
│   └── server/                   # Admin UI server
├── sample-app/                   # Sample application
│   ├── client/                   # Sample app client
│   │   ├── src/                  # Sample app client source
│   │   │   ├── components/       # Sample app components
│   │   │   ├── assets/           # Theme and styling assets
│   │   │   │   └── scss/         # SCSS theme system
│   │   │   └── views/            # Sample app views
│   │   ├── package.json          # Client dependencies
│   │   └── vite.config.js        # Vite configuration
│   ├── server/                   # Sample app server
│   │   ├── app.js                # Server application
│   │   ├── package.json          # Server dependencies
│   │   └── routes/               # Sample app routes
│   └── package.json              # Sample app orchestrator
├── .env                          # Environment variables (root)
└── package.json                  # Main package.json
```

## Overview

The sample-app showcases the following key capabilities:

- **Complete Visual Consistency**: Comprehensive theming system with legacy design (Primary: #002e6d, Secondary: #b8252b)
- **Dependency Injection System**: Advanced component injection that ensures even submodule components use the correct theme
- **Identical UI/UX**: Uses the exact same components, layouts, and styling as the submodule
- **Full Functionality**: All features from the submodule are available (MFA, tenant management, user management, etc.)
- **Easy Customization**: Modular architecture allows for easy customization and extension
- **Minimal Code Changes**: Requires minimal configuration to get started

## Features

### Core Features (from submodule)
- ✅ Multi-tenant support with tenant switching
- ✅ MFA authentication (SMS, Voice, TOTP, Push Auth)
- ✅ User management and RBAC system
- ✅ Blacklist management
- ✅ Core data management
- ✅ Settings and user preferences
- ✅ Organization MFA configuration

### Sample App Specific Features
- ✅ **Dependency Injection System**: Component provider pattern for theme consistency
- ✅ **Comprehensive Theming**: Legacy design system with SCSS-based styling
- ✅ **Theme-Aware Components**: Components automatically adapt to injected theme
- ✅ **Visual Consistency**: Complete look and feel matching across all components
- ✅ Demo page showcasing integration
- ✅ Technical documentation
- ✅ Navigation examples
- ✅ Component usage examples

## Dependency Injection & Theming System

### Overview

The sample-app implements a sophisticated dependency injection and theming system that ensures complete visual consistency across different implementations. This system allows the sample-app to provide its own components and styling to child components, even when they're from the admin submodule.

### Key Components

#### 1. ComponentProvider
- **Purpose**: Provides sample-app components and theme to child components
- **Location**: `sample-app/client/src/components/ComponentProvider.vue`
- **Features**: 
  - Wraps entire application with `sample-app-theme` class
  - Provides sample-app components (AppSidebar, AppHeader, AppLayout)
  - Provides theme information and styling context
  - Sets `isSampleApp: true` flag for context awareness

#### 2. Theme System
- **Purpose**: Comprehensive SCSS-based theming system
- **Location**: `sample-app/client/src/assets/scss/sample-app-theme.scss`
- **Features**:
  - Legacy color scheme (Primary: #002e6d, Secondary: #b8252b)
  - Component-specific styling
  - Responsive design
  - Accessibility compliance

#### 3. Theme-Aware Components
- **Purpose**: Components that automatically adapt to injected theme
- **Examples**: AppLayout, AppSidebar, AppHeader
- **Features**: 
  - Dynamic component selection based on context
  - Fallback to admin components when needed
  - Consistent styling across all implementations

### Color Scheme

The sample-app uses a comprehensive color scheme based on the legacy design:

- **Primary**: #002e6d (Dark Blue) - Main brand color
- **Secondary**: #b8252b (Red) - Accent and active states
- **Tertiary**: #66b3ff (Light Blue) - Hover and interactive elements
- **Light**: #f4f8fa (Light Gray) - Backgrounds and subtle elements
- **Grey**: #e9f1f5 (Medium Gray) - Borders and dividers
- **Background**: #e2eaef (Light Blue-Gray) - Main application background

### Implementation Details

#### Component Provider Setup
```javascript
// ComponentProvider.vue
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

#### Theme-Aware Components
```javascript
// AppLayout.vue
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

#### SCSS Theming
```scss
// sample-app-theme.scss
.sample-app-theme {
  font-family: 'Noto Sans', Avenir, Helvetica, Arial, sans-serif;
  color: $primary-font-color;
  background-color: #e2eaef;

  .app-sidebar {
    background: $primary !important;
    .nav-link.active {
      background: $secondary !important;
    }
  }
}
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MongoDB running on localhost:27017

### Installation

1. **Install dependencies:**
   ```bash
   # From root directory
   npm run sample-app:install
   
   # Or manually
   cd sample-app
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. **Start the application:**
   ```bash
   # From root directory
   npm run sample-app:dev
   
   # Or from sample-app directory
   cd sample-app
   npm run dev
   ```

3. **Access the application:**
   - **Client**: http://localhost:3001 (Sample app frontend)
   - **Server**: http://localhost:3000 (Sample app backend)

### Configuration

The sample-app uses the same configuration as the submodule:

- **Environment Variables**: Located in root `.env` file
- **API Proxy**: Configured to proxy `/api` and `/auth` requests to `http://localhost:3000`
- **Port**: Client runs on port 3001, server on port 3000
- **Aliases**: Configured with module aliases for easy imports

## Technical Implementation

### Module Aliases

The sample-app uses module aliases to reference the admin-ui submodule:

```javascript
// Client aliases (sample-app/client/package.json)
"@admin-ui": "../../src",
"@admin-ui/client": "../../src/client",
"@admin-ui/components": "../../src/client/src/components",
"@admin-ui/views": "../../src/client/src/views",

// Server aliases (sample-app/server/package.json)
"@admin-ui": "../../src",
"@admin-ui/server": "../../src/server",
"@admin-ui/auth": "../../src/server/services/authService.js",
"@admin-ui/mfa": "../../src/server/services/mfaService.js",
```

### File References

The sample-app references files from the admin-ui submodule:

```javascript
// In sample-app/client/src/main.js
import routes from '@admin-ui/router'

// In sample-app/server/app.js
const { setupPassport } = require('@admin-ui/config/passport')
const authRoutes = require('@admin-ui/routes/auth')
```

## Development Workflow

### Running the Sample App

1. **Development mode:**
   ```bash
   npm run sample-app:dev
   ```

2. **Production mode:**
   ```bash
   npm run sample-app:start
   ```

3. **Build:**
   ```bash
   npm run sample-app:build
   ```

### Running the Admin UI Submodule

1. **Development mode:**
   ```bash
   npm run dev
   ```

2. **Production mode:**
   ```bash
   npm start
   ```

## Customization

### Adding Custom Features

1. **Create new views:**
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

2. **Add routes:**
   ```javascript
   // sample-app/client/src/router/index.js
   import CustomView from '../views/CustomView.vue'

   const routes = [
     // ... existing routes
     {
       path: '/custom',
       name: 'Custom',
       component: CustomView,
       meta: { requiresAuth: true },
     },
   ]
   ```

3. **Add navigation:**
   ```vue
   <!-- sample-app/client/src/components/AppSidebar.vue -->
   <li class="nav-item">
     <router-link to="/custom" class="nav-link" active-class="active">
       <i class="fas fa-custom me-2"></i>
       Custom Feature
     </router-link>
   </li>
   ```

### Styling Customizations

The sample-app inherits all styling from the submodule. You can customize by:

1. **Overriding styles:**
   ```vue
   <style scoped>
   /* Your custom styles */
   .custom-container {
     background-color: #your-color;
   }
   </style>
   ```

2. **Adding custom CSS:**
   ```css
   /* sample-app/client/src/assets/custom.css */
   .custom-class {
     /* Your custom styles */
   }
   ```

## Integration Benefits

### For Developers
- **Rapid Development**: Start with a fully functional admin interface
- **Consistent UX**: Maintain consistent user experience across applications
- **Reduced Maintenance**: Core functionality maintained in submodule
- **Easy Updates**: Submodule updates automatically available

### For Organizations
- **Standardization**: Consistent admin interfaces across projects
- **Cost Efficiency**: Reduced development time and maintenance costs
- **Quality Assurance**: Battle-tested components and functionality
- **Scalability**: Easy to scale across multiple projects

## Troubleshooting

### Common Issues

1. **Component not found:**
   - Ensure module aliases are properly configured
   - Check import paths in your components

2. **Styling issues:**
   - Verify Bootstrap and Font Awesome are properly imported
   - Check if custom styles are conflicting with submodule styles

3. **API errors:**
   - Ensure the backend server is running on port 3000
   - Check proxy configuration in `vite.config.js`

4. **Routing issues:**
   - Verify routes are properly configured in `src/router/index.js`
   - Check if components are properly imported

### Support

For issues related to:
- **Submodule functionality**: Check the main admin-ui documentation
- **Sample-app integration**: Check this README and the code examples
- **Custom features**: Review the customization section above

## License

This sample-app is part of the admin-ui project and follows the same licensing terms. 