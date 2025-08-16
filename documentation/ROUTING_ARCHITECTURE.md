# Routing Architecture & Troubleshooting Guide

This document explains the routing architecture of the single-container application and how to troubleshoot routing issues.

## Architecture Overview

The application uses a **layered routing approach** that clearly separates API routes from UI routes:

```
┌─────────────────────────────────────────────────────────┐
│                    Express App                          │
├─────────────────────────────────────────────────────────┤
│ 1. Static Files (client/dist)                         │
│ 2. Test Routes (/test-routing)                         │
│ 3. API Routes (/api/*, /auth/*) + Middleware          │
│ 4. UI Routes (*) - Client-side routing                 │
│ 5. Error Handler                                       │
└─────────────────────────────────────────────────────────┘
```

## Route Structure & Prefixes

### Understanding Route Prefixes
The admin-ui routes are already configured with the correct prefixes in the `getRoutes()` function:

```javascript
// In src/server/index.js - routes are already prefixed
router.use('/auth', authRoutes);           // Creates /auth/* routes
router.use('/api/auth', authRoutes);       // Creates /api/auth/* routes  
router.use('/api', tenantRoutes);          // Creates /api/* routes
router.use('/api/users', userRoutes);      // Creates /api/users/* routes
router.use('/api/rbac', rbacRoutes);       // Creates /api/rbac/* routes
router.use('/api/settings', settingsRoutes); // Creates /api/settings/* routes
```

**Important**: When mounting these routes in standalone.js, mount at root level to avoid double prefixes.

## Route Priority & Middleware
```javascript
app.use(express.static(clientDistPath));
```
- Serves built Vue.js client files
- Handles CSS, JS, images, etc.
- **No middleware applied**

### 2. Test Routes
```javascript
app.get('/test-routing', (req, res) => { ... });
```
- Simple test endpoint for debugging
- **No middleware applied**
- Access: `http://localhost:3000/test-routing`

### 3. API Routes (With Middleware)
```javascript
app.use(ensureTenantSelected, adminRoutes);
```
- **Middleware applied**: `ensureTenantSelected`
- Handles all API endpoints
- Protected by tenant validation
- **Note**: Routes are already prefixed with `/api` and `/auth` in adminRoutes
- Examples: `/api/users`, `/api/tenant`, `/auth/login`

### 4. UI Routes (Client-side Routing)
```javascript
app.get('*', (req, res) => {
  // Define which routes are API endpoints vs UI routes
  const isApiRoute = req.path.startsWith('/api');
  const isAuthApiRoute = req.path.startsWith('/auth') && (
    req.path === '/auth/login' ||
    req.path === '/auth/logout' ||
    req.path.startsWith('/auth/mfa') ||
    req.path.startsWith('/auth/oauth')
  );
  
  if (isApiRoute || isAuthApiRoute) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve index.html for UI routes
  res.sendFile(path.join(clientDistPath, 'index.html'));
});
```
- **No middleware applied**
- **Smart route classification**: Distinguishes between API and UI auth routes
- Serves `index.html` for UI routes (including `/auth/select-tenant`)
- Enables Vue Router client-side routing
- Examples: `/dashboard`, `/login`, `/mfa-setup`, `/auth/select-tenant`

## Understanding the Tenant Selection Flow

### How Tenant Selection Works
The tenant selection process involves both UI and API routes:

1. **UI Route**: `/tenant-selection` (serves the tenant selection page)
2. **API Call**: When a tenant is clicked, frontend calls `/auth/select-tenant`
3. **API Response**: Returns JSON with redirect information
4. **Frontend Action**: Processes the response and navigates to the redirect URL

**Important**: `/auth/select-tenant` is an **API endpoint**, not a UI route. It must return JSON, not HTML.

## Why This Architecture?
The previous approach applied `ensureTenantSelected` to ALL routes:
```javascript
// ❌ WRONG - This blocks UI routes
app.use(ensureTenantSelected);  // Applied to everything
app.use('/', adminRoutes);
```

### Solution: Route-Specific Middleware
```javascript
// ✅ CORRECT - Middleware only on API routes
app.use('/api', ensureTenantSelected, adminRoutes);  // API routes get middleware
app.use('/auth', adminRoutes);                       // Auth routes get middleware
app.get('*', (req, res) => { ... });                // UI routes get NO middleware
```

## Testing Your Routes

### 1. Test API Routes
```bash
# Test API endpoint (should work)
curl http://localhost:3000/api/users

# Test auth endpoint (should work)
curl http://localhost:3000/auth/login
```

### 2. Test UI Routes
```bash
# Test test route (should work)
curl http://localhost:3000/test-routing

# Test UI route (should return HTML)
curl http://localhost:3000/dashboard
```

### 3. Test Client-Side Routing
```bash
# These should all return the same HTML (index.html)
curl http://localhost:3000/login
curl http://localhost:3000/dashboard
curl http://localhost:3000/mfa-setup
curl http://localhost:3000/tenant-selection
```

## Troubleshooting Common Issues

### Issue: "No tenant selected" on UI routes
**Cause**: Middleware is being applied to UI routes
**Solution**: Ensure middleware is only applied to API routes

**Check your standalone.js:**
```javascript
// ✅ CORRECT
app.use('/api', ensureTenantSelected, adminRoutes);
app.use('/auth', adminRoutes);

// ❌ WRONG
app.use(ensureTenantSelected);  // Applied globally
app.use('/', adminRoutes);
```

### Issue: UI routes return 404
**Cause**: Client build failed or `dist` folder missing
**Solution**: Check client build process

**Debug steps:**
1. Check server logs for build errors
2. Verify `src/client/dist` folder exists
3. Check `index.html` exists in dist folder

### Issue: API routes return 404
**Cause**: Route middleware blocking, route not registered, or double prefix issue
**Solution**: Check API route registration and mounting

**Debug steps:**
1. Test with `/test-routing` endpoint
2. Check if `/api` routes are working
3. Verify middleware is applied correctly
4. **Check for double prefixes**: Ensure routes aren't mounted as `/api/api/users`

**Common double prefix issue:**
```javascript
// ❌ WRONG - Creates /api/api/users instead of /api/users
app.use('/api', ensureTenantSelected, adminRoutes);

// ✅ CORRECT - adminRoutes already have /api prefix
app.use(ensureTenantSelected, adminRoutes);
```

### Issue: CORS errors
**Cause**: CORS configuration not matching client URL
**Solution**: Update CORS configuration

**Check your .env:**
```env
CLIENT_BASE_URL=http://localhost:3000
BASE_URL=http://localhost:3000
```

### Issue: Auth routes returning 404 or 302
**Cause**: Route classification not distinguishing between API and UI auth routes
**Solution**: Ensure proper route classification

**Check your standalone.js:**
```javascript
// ✅ CORRECT - Smart route classification
const isAuthApiRoute = req.path.startsWith('/auth') && (
  req.path === '/auth/login' ||
  req.path === '/auth/logout' ||
  req.path.startsWith('/auth/mfa') ||
  req.path.startsWith('/auth/oauth')
);

// ❌ WRONG - All /auth routes treated as API
if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
  return res.status(404).json({ error: 'API endpoint not found' });
}
```

**Common UI auth routes that should serve index.html:**
- `/auth/select-tenant` ❌ (API route - returns JSON)
- `/auth/mfa-setup` ✅ (UI route)  
- `/auth/tenant-selection` ❌ (API route - returns JSON)
- `/auth/login` ❌ (API route)
- `/auth/logout` ❌ (API route)
- `/auth/mfa/*` ❌ (API route)
- `/auth/oauth/*` ❌ (API route)
- `/auth/callback` ❌ (API route)
- `/auth/verify` ❌ (API route)

## Environment Configuration

### Required Environment Variables
```env
# Base URLs for redirects
CLIENT_BASE_URL=http://localhost:3000
BASE_URL=http://localhost:3000

# For production
CLIENT_BASE_URL=https://yourdomain.com
BASE_URL=https://yourdomain.com
```

### Development vs Production
```env
# Development (Single Container)
CLIENT_BASE_URL=http://localhost:3000

# Development (Multi-Process - Legacy)
CLIENT_BASE_URL=http://localhost:3001

# Production
CLIENT_BASE_URL=https://yourdomain.com
```

## Debugging Commands

### 1. Check Route Registration
```bash
# Start server with debug logging
DEBUG=express:* npm run dev
```

### 2. Test Individual Routes
```bash
# Test API routes
curl -v http://localhost:3000/api/users

# Test UI routes
curl -v http://localhost:3000/dashboard

# Test test route
curl -v http://localhost:3000/test-routing
```

### 3. Check Middleware Application
```bash
# Look for middleware in server logs
npm run dev | grep -i "middleware\|route"
```

## Common Patterns

### Adding New API Routes
```javascript
// In your route file
router.get('/new-endpoint', (req, res) => {
  res.json({ message: 'New API endpoint' });
});

// Automatically gets middleware when mounted at /api
app.use('/api', ensureTenantSelected, adminRoutes);
```

### Adding New UI Routes
```javascript
// No changes needed! Just add to Vue Router
// The catch-all route will handle it automatically
```

### Excluding Routes from Middleware
```javascript
// If you need to exclude specific API routes from middleware
app.use('/api/public', publicRoutes);  // No middleware
app.use('/api', ensureTenantSelected, adminRoutes);  // With middleware
```

## Best Practices

1. **Always apply middleware to specific route prefixes**
2. **Never apply authentication/tenant middleware globally**
3. **Use the test route to verify basic routing works**
4. **Check environment variables for redirect issues**
5. **Monitor server logs for middleware conflicts**

## Still Having Issues?

If you're still experiencing routing problems:

1. **Check the test route**: `http://localhost:3000/test-routing`
2. **Verify environment variables**: Set `CLIENT_BASE_URL` and `BASE_URL`
3. **Check server logs**: Look for middleware or routing errors
4. **Verify client build**: Ensure `dist` folder exists and contains `index.html`
5. **Test API vs UI routes separately**: Use curl to isolate the issue

The routing architecture is designed to be simple and reliable. If you follow these patterns, routing should work correctly! 🚀 