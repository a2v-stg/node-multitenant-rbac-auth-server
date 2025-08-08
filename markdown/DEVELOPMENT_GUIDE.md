# Development Guide

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- MongoDB 4.4 or higher
- Git for version control
- npm or yarn for package management

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd admin-ui
   npm install
   
   # Install dependencies for both client and server
   cd src/client && npm install
   cd ../server && npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env_sample .env
   # Edit .env with your local settings
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB
   mongod --dbpath /path/to/your/db
   
   # The application will auto-create collections
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

```
admin-ui/
├── src/
│   ├── client/                 # Vue.js frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable components
│   │   │   ├── views/         # Page components
│   │   │   ├── router/        # Vue Router config
│   │   │   ├── services/      # API services
│   │   │   └── utils/         # Utility functions
│   │   ├── package.json
│   │   └── vite.config.js
│   └── server/                # Node.js backend
│       ├── routes/            # Express routes
│       ├── middleware/        # Custom middleware
│       ├── models/           # Mongoose models
│       ├── services/         # Business logic
│       ├── config/           # Configuration files
│       ├── utils/            # Server utilities
│       └── migrations/       # Database migrations
├── sample-app/               # Reference implementation
├── markdown/                # Documentation
└── package.json            # Root package config
```

## Development Workflow

### Backend Development

#### 1. Adding New Routes

```javascript
// src/server/routes/newFeature.js
const express = require('express');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/endpoint', ensureAuthenticated, async (req, res) => {
  try {
    // Implementation
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### 2. Adding Middleware

```javascript
// src/server/middleware/customMiddleware.js
const customMiddleware = (req, res, next) => {
  // Middleware logic
  req.customData = processedData;
  next();
};

module.exports = { customMiddleware };
```

#### 3. Creating Models

```javascript
// src/server/models/NewModel.js
const mongoose = require('mongoose');

const newModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tenantId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes
newModelSchema.index({ tenantId: 1, name: 1 });

module.exports = mongoose.model('NewModel', newModelSchema);
```

### Frontend Development

#### 1. Creating Components

```vue
<!-- src/client/src/components/NewComponent.vue -->
<template>
  <div class="new-component">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'NewComponent',
  props: {
    title: String,
    description: String
  },
  data() {
    return {
      // Component state
    };
  },
  methods: {
    // Component methods
  }
};
</script>

<style scoped>
.new-component {
  /* Component styles */
}
</style>
```

#### 2. Adding Routes

```javascript
// src/client/src/router/index.js
import NewView from '../views/NewView.vue';

const routes = [
  {
    path: '/new-feature',
    name: 'NewFeature',
    component: NewView,
    meta: { 
      requiresAuth: true,
      requiresAdmin: false 
    }
  }
];
```

#### 3. API Services

```javascript
// src/client/src/services/newService.js
import axios from 'axios';

export const newService = {
  async getData() {
    const response = await axios.get('/api/new-endpoint');
    return response.data;
  },

  async createItem(data) {
    const response = await axios.post('/api/new-endpoint', data);
    return response.data;
  }
};
```

## Frontend Development

### Component Development

#### Creating New Components

```javascript
// src/client/src/components/NewComponent.vue
<template>
  <div class="new-component">
    <h3>{{ title }}</h3>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'NewComponent',
  props: {
    title: {
      type: String,
      default: 'Default Title'
    }
  }
}
</script>

<style scoped>
.new-component {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}
</style>
```

### Dependency Injection & Theming System

#### Overview

The sample-app implements a sophisticated dependency injection and theming system that ensures complete visual consistency across different implementations. This system allows the sample-app to provide its own components and styling to child components, even when they're from the admin submodule.

#### 1. Component Provider Setup

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
      sampleAppSidebar: AppSidebar,
      sampleAppHeader: AppHeader,
      sampleAppLayout: AppLayout,
      // Theme information
      sampleAppTheme: {
        primary: '#002e6d',
        secondary: '#b8252b',
        tertiary: '#66b3ff',
        light: '#f4f8fa',
        grey: '#e9f1f5'
      },
      // Context flag
      isSampleApp: true
    }
  }
}
</script>
```

#### 2. Theme-Aware Components

Components automatically adapt to the injected theme:

```javascript
// src/client/src/components/AppLayout.vue
<template>
  <div class="app-layout" :class="{ 'sample-app-theme': isSampleApp }">
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
    sampleAppSidebar: { default: null },
    sampleAppHeader: { default: null },
    isSampleApp: { default: false },
    sampleAppTheme: { default: null }
  },
  computed: {
    sidebarComponent() {
      return this.isSampleApp && this.sampleAppSidebar ? this.sampleAppSidebar : AppSidebar
    },
    headerComponent() {
      return this.isSampleApp && this.sampleAppHeader ? this.sampleAppHeader : AppHeader
    }
  }
}
</script>
```

#### 3. SCSS Theming System

The sample-app features a comprehensive SCSS-based theming system:

```scss
// sample-app/client/src/assets/scss/sample-app-theme.scss
// Primary Color Scheme
$primary: #002e6d;      // Dark Blue
$secondary: #b8252b;    // Red
$tertiary: #66b3ff;     // Light Blue
$light: #f4f8fa;        // Light Gray
$grey: #e9f1f5;         // Medium Gray

// Global Sample App Styles
.sample-app-theme {
  font-family: 'Noto Sans', Avenir, Helvetica, Arial, sans-serif;
  color: $primary-font-color;
  background-color: #e2eaef;

  // Sidebar Styling
  .app-sidebar {
    background: $primary !important;
    border-right: 1px solid rgba(255, 255, 255, 0.1);

    .nav-link {
      color: $light !important;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
      }

      &.active {
        background: $secondary !important;
        border-left: 3px solid $secondary;
      }
    }
  }

  // Header Styling
  .app-header {
    background-color: $light !important;
    color: $primary !important;
    border-bottom: 2px solid $primary;
  }

  // Card Styling
  .card {
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
}
```

#### 4. Using the Theming System

To use the theming system in your components:

```javascript
// In your Vue component
export default {
  name: 'MyComponent',
  inject: {
    sampleAppTheme: { default: null },
    isSampleApp: { default: false }
  },
  computed: {
    themeColors() {
      return this.sampleAppTheme || {
        primary: '#007bff',
        secondary: '#6c757d'
      }
    }
  }
}
```

#### 5. Integration with Parent Applications

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

#### 6. Theme Customization

To customize the theme for your application:

```scss
// Override theme variables
:root {
  --sample-app-primary: #your-primary-color;
  --sample-app-secondary: #your-secondary-color;
  --sample-app-tertiary: #your-tertiary-color;
}

// Or extend the theme
.sample-app-theme {
  // Your custom styles
  .custom-component {
    background-color: var(--sample-app-primary);
    color: white;
  }
}
```

### Component Testing

#### Unit Testing Components

```javascript
// src/client/src/components/__tests__/NewComponent.test.js
import { mount } from '@vue/test-utils'
import NewComponent from '../NewComponent.vue'

describe('NewComponent', () => {
  test('renders title prop', () => {
    const wrapper = mount(NewComponent, {
      props: {
        title: 'Test Title'
      }
    })
    
    expect(wrapper.text()).toContain('Test Title')
  })
})
```

## Database Management

### Migrations

#### Creating Migrations

```javascript
// src/server/migrations/versions/1.3.0-add-new-feature.js
module.exports = {
  version: '1.3.0',
  description: 'Add new feature tables',
  
  async up(mongoose) {
    // Migration up logic
    const NewModel = mongoose.model('NewModel');
    await NewModel.createIndexes();
  },

  async down(mongoose) {
    // Migration rollback logic
    await mongoose.connection.dropCollection('newmodels');
  }
};
```

#### Running Migrations

```bash
# Run pending migrations
npm run migrate

# Create new migration
npm run create-migration -- "migration-name"

# Rollback last migration
npm run migrate:rollback
```

### Data Seeding

```javascript
// src/server/scripts/seed-data.js
const seedDevelopmentData = async () => {
  // Create default organization
  const org = new Organization({
    name: 'Development Org',
    settings: {
      mfaEnabled: false
    }
  });
  await org.save();

  // Create default tenant
  const tenant = new Tenant({
    tenantId: 'development',
    tenantName: 'Development Environment',
    organizationId: org._id,
    isDefault: true
  });
  await tenant.save();
};
```

## Testing

### Backend Testing

#### Unit Tests

```javascript
// src/server/tests/services/authService.test.js
const { authService } = require('../../services/authService');

describe('AuthService', () => {
  test('should hash password correctly', async () => {
    const password = 'testPassword123';
    const hash = await authService.hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
  });

  test('should verify password correctly', async () => {
    const password = 'testPassword123';
    const hash = await authService.hashPassword(password);
    const isValid = await authService.verifyPassword(password, hash);
    
    expect(isValid).toBe(true);
  });
});
```

#### Integration Tests

```javascript
// src/server/tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../app');

describe('Auth Endpoints', () => {
  test('POST /api/auth/login should authenticate user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Testing

#### Component Tests

```javascript
// src/client/src/components/__tests__/UserCard.test.js
import { mount } from '@vue/test-utils';
import UserCard from '../UserCard.vue';

describe('UserCard', () => {
  test('renders user information', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const wrapper = mount(UserCard, {
      props: { user }
    });

    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('john@example.com');
  });
});
```

### Running Tests

```bash
# Backend tests
cd src/server && npm test

# Frontend tests
cd src/client && npm test

# Test coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Debugging

### Server Debugging

#### Debug Configuration

```javascript
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/server/app.js",
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "admin-ui:*"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

#### Logging

```javascript
// src/server/utils/logger.js
const log4js = require('log4js');

log4js.configure({
  appenders: {
    console: { 
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p]: %m'
      }
    },
    errorFile: { 
      type: 'file', 
      filename: 'logs/error.log', 
      maxLogSize: 10485760, 
      backups: 15, 
      compress: true 
    },
    combinedFile: { 
      type: 'file', 
      filename: 'logs/combined.log', 
      maxLogSize: 10485760, 
      backups: 15, 
      compress: true 
    }
  },
  categories: {
    default: { 
      appenders: ['console', 'combinedFile'], 
      level: process.env.LOG_LEVEL || 'info' 
    },
    error: { 
      appenders: ['console', 'errorFile'], 
      level: 'error' 
    }
  }
});

const logger = log4js.getLogger();

module.exports = logger;
```

### Frontend Debugging

#### Vue DevTools

```javascript
// Enable Vue DevTools in development
if (process.env.NODE_ENV === 'development') {
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
}
```

#### Debug Utilities

```javascript
// src/client/src/utils/debug.js
export const debug = {
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', ...args);
    }
  },

  error: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', ...args);
    }
  }
};
```

## Performance Optimization

### Backend Optimization

#### Database Indexing

```javascript
// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ tenantId: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// Compound indexes
userSchema.index({ tenantId: 1, role: 1, isActive: 1 });
```

#### Query Optimization

```javascript
// Use projection to limit returned fields
const users = await User.find(
  { tenantId: req.tenantId },
  'name email isActive createdAt'
).limit(20);

// Use aggregation for complex queries
const stats = await User.aggregate([
  { $match: { tenantId: req.tenantId } },
  { $group: { _id: '$role', count: { $sum: 1 } } }
]);
```

#### Caching

```javascript
// Redis caching example
const redis = require('redis');
const client = redis.createClient();

const cacheGet = async (key) => {
  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
};

const cacheSet = async (key, data, ttl = 3600) => {
  await client.setex(key, ttl, JSON.stringify(data));
};
```

### Frontend Optimization

#### Code Splitting

```javascript
// src/client/src/router/index.js
const routes = [
  {
    path: '/admin',
    component: () => import('../views/AdminPanel.vue') // Lazy load
  }
];
```

#### Bundle Analysis

```bash
# Analyze bundle size
cd src/client && npm run build -- --analyze
```

## Deployment

### Development Deployment

```bash
# Start all services
npm run dev

# Start only server
npm run dev:server

# Start only client
npm run dev:client
```

### Production Build

```bash
# Build client
cd src/client && npm run build

# Start production server
cd src/server && npm start
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY src/server/package*.json ./src/server/
COPY src/client/package*.json ./src/client/

# Install dependencies
RUN npm install
RUN cd src/server && npm install
RUN cd src/client && npm install

# Copy source code
COPY . .

# Build client
RUN cd src/client && npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

### Environment Variables

```bash
# Production .env
NODE_ENV=production
MONGODB_URI=mongodb://prod-server:27017/admin_ui
REDIS_URL=redis://prod-redis:6379
SESSION_SECRET=production-secret-key
LOG_LEVEL=warn
```

## Troubleshooting

### Common Development Issues

#### 1. Module Resolution Errors

**Problem**: `Cannot find module '@admin-ui/...'`

**Solutions:**
- Check module-alias configuration in package.json
- Ensure paths are correctly mapped
- Restart development server

#### 2. Database Connection Issues

**Problem**: `MongooseError: Cannot connect to MongoDB`

**Solutions:**
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Ensure database permissions

#### 3. Authentication Issues

**Problem**: `Session not persisting` or `User logged out unexpectedly`

**Solutions:**
- Check session configuration
- Verify session store (MongoDB/Redis)
- Clear browser cookies and restart

#### 4. Build Errors

**Problem**: Frontend build fails

**Solutions:**
- Clear node_modules and reinstall
- Check for syntax errors
- Verify all imports are correct

### Debug Commands

```bash
# Check database connection
npm run db:check

# Verify environment configuration
npm run config:verify

# Test API endpoints
npm run api:test

# Clear all caches
npm run cache:clear
```

## Code Quality

### Linting

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-prettier'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
};
```

### Formatting

```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Git Hooks

```bash
# Install husky for git hooks
npm install --save-dev husky

# Pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"

# Pre-push hook
npx husky add .husky/pre-push "npm run test:coverage"
```

## Contributing

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation
5. Submit pull request
6. Code review and approval
7. Merge to main

### Commit Convention

```bash
# Commit message format
type(scope): description

# Examples
feat(auth): add MFA support
fix(api): resolve tenant filtering issue
docs(readme): update setup instructions
test(auth): add unit tests for login flow
```

---

This development guide provides the foundation for contributing to and extending the Admin UI system.