# Admin UI Sample App - How to Use Guide

This guide provides comprehensive instructions for setting up, configuring, and using the Admin UI Sample App with the FDE (Fraud Detection Engine) integration.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Features & Usage](#features--usage)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

## Overview

The Admin UI Sample App demonstrates the integration of the `admin-ui` submodule with a complete fraud detection system. It provides:

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

### Security Model

- **Authentication**: OAuth2 + Local authentication
- **Authorization**: Role-Based Access Control (RBAC)
- **Session Management**: Secure session cookies
- **Tenant Isolation**: Data segregation by `tenantId`
- **Permission Validation**: Middleware-based permission checking

---

## Need Help?

- Check the [Troubleshooting](#troubleshooting) section
- Review server logs for detailed error information
- Ensure all prerequisites are met
- Verify environment configuration matches your setup

For development questions, refer to the source code documentation and inline comments.