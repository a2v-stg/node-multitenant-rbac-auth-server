# Admin UI Submodule

This repository has been refactored to work as a submodule that can be imported by parent repositories. It provides a complete admin UI with authentication, authorization, MFA, and user management functionality.

## Structure

```
admin-ui/
├── src/
│   ├── client/            # Vue.js frontend
│   └── server/            # Node.js backend
├── sample-app/            # Example parent application
├── index.js               # Main entry point for submodule
└── package.json           # Submodule configuration
```

## Package Management & Cleanup

This repository has been consolidated to reduce redundancy and improve maintainability:

### Consolidated Package Structure

- **Root package.json**: Main workspace configuration with scripts to manage all sub-projects
- **src/client/package.json**: Vue.js frontend dependencies only
- **src/server/package.json**: Node.js backend dependencies only
- **sample-app/package.json**: Sample application workspace configuration

### Key Improvements

1. **Removed redundant scripts**: Consolidated duplicate scripts across package.json files
2. **Simplified dependencies**: Removed unnecessary dependencies and duplicates
3. **Clean package-lock.json management**: Only root package-lock.json is maintained
4. **Workspace-based structure**: Uses npm workspaces for better dependency management

### Available Scripts

#### Root Level (admin-ui/)
```bash
# Development (Single Container - Recommended)
npm run dev                   # Start standalone server (builds client + serves on port 3000)
npm run standalone            # Start standalone server
npm run standalone:start       # Start standalone server in production mode

# Development (Multi-Process - Legacy)
npm run dev:server            # Start server only in development
npm run dev:client            # Start client only in development

# Building
npm run build                 # Build client application
npm run build:client          # Build client application

# Testing
npm run test                  # Run tests for both client and server
npm run test:server           # Run server tests only
npm run test:client           # Run client tests only
npm run test:coverage         # Run tests with coverage

# Linting
npm run lint                  # Lint both client and server
npm run lint:fix              # Fix linting issues

# Installation
npm run install:all           # Install dependencies for all sub-projects

# Cleanup
npm run clean                 # Clean node_modules and package-lock.json
npm run clean:all             # Clean all including sample-app
npm run clean:lockfiles       # Remove all package-lock.json files (except submodules)
```

#### Client (src/client/)
```bash
npm run dev                   # Start Vite development server
npm run build                 # Build for production
npm run preview               # Preview production build
npm run lint                  # Lint code
npm run test                  # Run tests
```

#### Server (src/server/)
```bash
npm run dev                   # Start development server
npm run start                 # Start production server
npm run test                  # Run tests
npm run migrate               # Run database migrations
```

### Cleanup Commands

To clean up the entire project and start fresh:

```bash
# Clean all node_modules and package-lock.json files
npm run clean:all

# Remove all package-lock.json files (except submodules)
npm run clean:lockfiles

# Reinstall all dependencies
npm run install:all
```

## Quick Start

### Single Container Deployment (Recommended)

The application now supports running as a single container with both client and server on the same port:

```bash
# Install dependencies
npm run install:all

# Start the standalone server (builds client + serves everything on port 3000)
npm run dev

# Or use Docker
./deploy.sh full
```

**Benefits:**
- ✅ Single port (3000) for everything
- ✅ No need for `concurrently` or multiple processes
- ✅ Perfect for containerized deployments
- ✅ Built client served as static files
- ✅ Simplified deployment and management

See [SINGLE_CONTAINER_README.md](./documentation/SINGLE_CONTAINER_README.md) for detailed deployment instructions.

### As a Submodule

1. **Add to parent repository:**
   ```bash
   git submodule add <repository-url> admin-ui
   git submodule update --init --recursive
   ```

2. **Import in your application:**
   ```javascript
   const adminUI = require('./admin-ui');
   ```

3. **Use the functionality:**
   ```javascript
   // Access services
   const authService = adminUI.services.auth;
   const mfaService = adminUI.services.mfa;
   
   // Access models
   const User = adminUI.models.User;
   
   // Access routes
   const authRoutes = adminUI.routes.auth;
   ```

### Testing with Sample App

1. **Start the sample app from root directory:**
   ```bash
   # Install all dependencies (including sample-app)
   npm run install:all
   
   # Start sample-app in development mode
   npm run sample-app:dev
   ```

2. **Or start from sample-app directory:**
   ```bash
   cd sample-app
   npm run install:all
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000

**Note:** The sample-app uses module aliases to import from the admin-ui submodule. Make sure all dependencies are installed before starting.

## Usage as Submodule

### 1. Add as Git Submodule

```bash
# In your parent repository
git submodule add <repository-url> admin-ui
git submodule update --init --recursive
```

### 2. Import in Parent Repository

```javascript
// In your parent app.js or main file
const adminUI = require('./admin-ui');

// Access admin-ui components
const authService = adminUI.authService;
const mfaService = adminUI.mfaService;
const User = adminUI.models.User;
const authRoutes = adminUI.routes.auth;
```

### 3. Use in Express App

```javascript
const express = require('express');
const adminUI = require('./admin-ui');

const app = express();

// Use admin-ui middleware
app.use(adminUI.middleware.authMiddleware);
app.use(adminUI.middleware.rbacMiddleware);

// Mount admin-ui routes
app.use('/api/auth', adminUI.routes.auth);
app.use('/api/users', adminUI.routes.user);
app.use('/api/tenants', adminUI.routes.tenant);

// Use admin-ui models
const User = adminUI.models.User;
```

### 4. Module Aliases

The submodule uses `module-alias` for clean imports:

```javascript
// In admin-ui code
const authService = require('@admin-ui/auth');
const User = require('@admin-ui/models/User');
const logger = require('@admin-ui/utils/logger');
```

## Sample App

The `sample-app/` directory demonstrates how to use this as a submodule:

```bash
cd sample-app
npm install
npm run dev
```

This will start a server that:
- Imports the admin-ui submodule
- Serves the admin-ui at `/admin-ui`
- Serves sample-app specific functionality at `/sample-app`
- Uses the stgcore-app-fde-engine only within sample-app

## Available Exports

### Services
- `authService` - Authentication service
- `mfaService` - Multi-factor authentication service
- `rbacService` - Role-based access control service

### Models
- `User` - User model
- `Role` - Role model
- `UserRole` - User-role relationship model
- `UserTenant` - User-tenant relationship model
- `Migration` - Database migration model

### Routes
- `auth` - Authentication routes
- `user` - User management routes
- `tenant` - Tenant management routes
- `rbac` - RBAC routes
- `blacklist` - Blacklist management routes

### Middleware
- `authMiddleware` - Authentication middleware
- `rbacMiddleware` - RBAC middleware
- `errorHandler` - Error handling middleware
- `validation` - Request validation middleware
- `tenantValidation` - Tenant validation middleware

### Utils
- `logger` - Logging utility

## Configuration

The submodule uses environment variables for configuration:

```env
MONGODB_URI=mongodb://localhost:27017/admin-ui
SESSION_SECRET=your-secret-key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## Development

### Running the Submodule Directly

```bash
npm install
npm run dev
```

### Running the Sample App

```bash
cd sample-app
npm install
npm run dev
```

## Overriding Functionality

Parent repositories can override admin-ui functionality:

```javascript
// In parent repository
const adminUI = require('./admin-ui');

// Override auth service
const customAuthService = {
  ...adminUI.authService,
  login: (req, res) => {
    // Custom login logic
  }
};

// Override routes
const customAuthRoutes = express.Router();
customAuthRoutes.use('/', adminUI.routes.auth);
customAuthRoutes.get('/custom-endpoint', (req, res) => {
  // Custom endpoint
});
```

## Module Aliases

The submodule uses consistent module aliases:

- `@admin-ui` - Root of admin-ui submodule
- `@admin-ui/client` - Client components
- `@admin-ui/server` - Server components
- `@admin-ui/auth` - Authentication service
- `@admin-ui/mfa` - MFA service
- `@admin-ui/rbac` - RBAC service
- `@admin-ui/middleware` - Middleware components
- `@admin-ui/models` - Database models
- `@admin-ui/routes` - API routes
- `@admin-ui/utils` - Utility functions

## Testing

```bash
# Test the submodule
npm test

# Test the sample app
cd sample-app
npm test
```

## Building

```bash
# Build the client
npm run build

# Build the sample app
cd sample-app
npm run build
```

## Cleanup Summary

### What Was Cleaned Up

1. **Consolidated package.json files**:
   - Removed redundant scripts across multiple package.json files
   - Simplified dependencies by removing duplicates
   - Consolidated module aliases to root level only

2. **Removed unnecessary files**:
   - Deleted package-lock.json files from subdirectories (src/client/, src/server/, sample-app/, etc.)
   - Kept only the root package-lock.json for workspace management

3. **Simplified scripts**:
   - Removed duplicate format scripts (using prettier directly)
   - Removed redundant test:watch scripts
   - Consolidated cleanup commands
   - Added comprehensive clean:lockfiles script

4. **Improved workspace structure**:
   - Maintained npm workspaces for better dependency management
   - Simplified module aliases to reduce complexity
   - Centralized script management at root level

### Recommendations for Future Maintenance

1. **Use workspace commands**: When adding new dependencies, use `npm install <package> -w <workspace>` to install in specific workspaces
2. **Keep package-lock.json at root only**: Don't commit package-lock.json files from subdirectories
3. **Use clean scripts**: Run `npm run clean:all` before major dependency updates
4. **Maintain script consistency**: Keep scripts consistent across workspaces and avoid duplication

### Migration Notes

If you're migrating from the old structure:

1. **Clean existing installations**:
   ```bash
   npm run clean:all
   npm run install:all
   ```

2. **Update your scripts**: Replace any references to old script names with the new consolidated ones

3. **Check module aliases**: Update any custom module aliases to use the simplified structure

## Quick Start
