# Sentry Implementation Guide

This document outlines the Sentry tracing implementation across all components of the admin-ui system.

## Overview

Sentry has been integrated into the following components:
- `src/server` - Main server component
- `src/client` - Main client component  
- `sample-app/server` - Sample application server
- `sample-app/client` - Sample application client

## Features Implemented

### 1. Error Tracking
- Automatic error capture and reporting
- Context-aware error logging with additional metadata
- Environment-specific error filtering
- User context tracking

### 2. Performance Monitoring
- Transaction tracking for key operations
- Span tracking for sub-operations
- API request/response monitoring
- Route navigation tracking

### 3. User Context
- User identification and tracking
- Tenant context tracking
- Session management integration

## Configuration

### Environment Variables

#### Server Components
```bash
# Required
SENTRY_DSN=your-sentry-dsn-here

# Optional
SENTRY_TRACING_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_DEBUG=false
NODE_ENV=development
```

#### Client Components
```bash
# Required
VITE_SENTRY_DSN=your-sentry-dsn-here

# Optional
VITE_SENTRY_TRACING_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_DEBUG=false
```

## Component-Specific Implementation

### 1. Server Components (`src/server` & `sample-app/server`)

#### Configuration File
- Location: `config/sentry.js`
- Provides centralized Sentry configuration
- Includes error filtering and environment-specific settings

#### Key Features
- Database connection tracking
- Application initialization monitoring
- Route handling with transaction tracking
- Error capture with context

#### Usage Example
```javascript
const { initSentry, captureError, createTransaction } = require('./config/sentry');

// Initialize Sentry
initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  enableTracing: process.env.SENTRY_TRACING_ENABLED === 'true'
});

// Create transaction for operations
const transaction = createTransaction('operation.name', 'db');
try {
  // Your operation here
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  captureError(error, { context: 'operation.context' });
} finally {
  transaction.finish();
}
```

### 2. Client Components (`src/client` & `sample-app/client`)

#### Configuration File
- Location: `src/config/sentry.js`
- Provides Vue.js specific Sentry configuration
- Includes router instrumentation

#### Key Features
- Vue.js integration with automatic error capture
- Router navigation tracking
- API request/response monitoring
- User context management

#### Usage Example
```javascript
import { initSentry, captureError, createTransaction } from './config/sentry';

// Initialize Sentry with Vue app
initSentry(app, {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE || 'development',
  enableTracing: import.meta.env.VITE_SENTRY_TRACING_ENABLED === 'true'
});

// Create transaction for operations
const transaction = createTransaction('client.operation', 'ui');
try {
  // Your operation here
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  captureError(error, { context: 'client.operation' });
} finally {
  transaction.finish();
}
```

## Transaction Types

### Server Transactions
- `database.connection` - Database connection operations
- `app.initialization` - Application startup
- `admin-ui.initApp` - Admin UI initialization
- `admin-ui.getRoutes` - Route generation
- `admin-ui.getMiddleware` - Middleware setup
- `admin-ui.getPassport` - Passport configuration
- `sample-app.database.connection` - Sample app database connection

### Client Transactions
- `api.{method}` - API requests (GET, POST, PUT, DELETE)
- `navigation.{route}` - Route navigation
- `client.operation` - Client-side operations
- `sample-app.api.{method}` - Sample app API requests
- `sample-app.navigation.{route}` - Sample app route navigation

## Error Context

### Server Error Context
- `database.connection` - Database connection errors
- `app.initialization` - Application startup errors
- `admin-ui.initApp` - Admin UI initialization errors
- `fde-models.registration` - FDE model registration errors
- `sample-app.database.connection` - Sample app database errors

### Client Error Context
- `axios.request` - API request errors
- `axios.response` - API response errors
- `router.auth-check` - Authentication check errors
- `router.beforeEach` - Route navigation errors
- `sample-app.axios.request` - Sample app API request errors
- `sample-app.axios.response` - Sample app API response errors
- `sample-app.router.auth-check` - Sample app authentication errors

## Performance Monitoring

### Transaction Sampling
- Default sampling rate: 10% (0.1)
- Configurable via environment variables
- Environment-specific sampling rates

### Span Tracking
- Automatic span creation for sub-operations
- Manual span creation for custom operations
- Span context propagation

## User Context Management

### Automatic User Tracking
- User authentication status
- User ID, email, username
- Tenant ID for multi-tenant applications

### Manual User Context
```javascript
// Set user context
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
  tenantId: user.tenantId
});

// Clear user context
clearUser();
```

## Error Filtering

### Development Environment
- Errors are filtered out by default in development
- Can be enabled with `SENTRY_DEBUG=true`
- Debug mode enabled for detailed logging

### Production Environment
- All errors are captured and reported
- Performance monitoring enabled
- Full transaction tracking

## Integration Points

### 1. Express.js Middleware
- Automatic error capture in Express routes
- Request/response monitoring
- Session context tracking

### 2. Vue.js Integration
- Automatic Vue error capture
- Router navigation tracking
- Component error boundaries

### 3. Axios Interceptors
- API request/response monitoring
- Automatic error capture
- Transaction tracking for HTTP requests

### 4. Database Operations
- Connection monitoring
- Query performance tracking
- Error capture for database operations

## Monitoring and Alerting

### Sentry Dashboard
- Real-time error monitoring
- Performance metrics
- User session tracking
- Release tracking

### Key Metrics
- Error rates by environment
- Performance bottlenecks
- User experience metrics
- API response times

## Best Practices

### 1. Error Handling
- Always capture errors with context
- Use appropriate error levels
- Include relevant metadata

### 2. Performance Monitoring
- Create transactions for key operations
- Use spans for sub-operations
- Monitor critical user paths

### 3. User Context
- Set user context on authentication
- Clear context on logout
- Include tenant information

### 4. Environment Management
- Use environment-specific configurations
- Filter errors in development
- Enable full monitoring in production

## Troubleshooting

### Common Issues

1. **Sentry not initialized**
   - Check DSN configuration
   - Verify environment variables
   - Check console for initialization messages

2. **Errors not being captured**
   - Verify Sentry client is initialized
   - Check error filtering settings
   - Ensure proper error context

3. **Performance data not showing**
   - Verify tracing is enabled
   - Check sampling rates
   - Ensure transactions are properly finished

### Debug Mode
Enable debug mode for detailed logging:
```bash
# Server
SENTRY_DEBUG=true

# Client
VITE_SENTRY_DEBUG=true
```

## Security Considerations

1. **DSN Security**
   - Keep DSN private and secure
   - Use environment variables
   - Don't commit DSN to version control

2. **Data Privacy**
   - Filter sensitive information
   - Use appropriate sampling rates
   - Respect user privacy settings

3. **Error Context**
   - Avoid logging sensitive data
   - Use appropriate error levels
   - Sanitize error messages

## Future Enhancements

1. **Advanced Filtering**
   - Custom error filters
   - Environment-specific rules
   - User-based filtering

2. **Performance Optimization**
   - Custom performance metrics
   - Business-specific transactions
   - Advanced span tracking

3. **Integration Extensions**
   - Additional framework support
   - Custom integrations
   - Third-party service integration 