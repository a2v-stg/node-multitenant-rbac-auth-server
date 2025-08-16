# Admin UI Single Container Deployment

This document explains how to run the Admin UI application as a single container with both client and server components running on the same port.

## Overview

The application has been modified to run as a single container where:
- The Node.js server builds the Vue.js client during startup
- Both client and server run on the same port (default: 3000)
- No need for `concurrently` or multiple processes
- Perfect for containerized deployments (Docker, Kubernetes)

## Architecture Changes

### Before (Multi-process)
```
┌─────────────────┐    ┌─────────────────┐
│   Client (3001) │    │  Server (3000)  │
│   (Vue.js)      │◄──►│  (Node.js)      │
└─────────────────┘    └─────────────────┘
```

### After (Single Container)
```
┌─────────────────────────────────────────┐
│           Single Container              │
│  ┌─────────────────┐ ┌──────────────┐  │
│  │   Client (Built)│ │ Server (3000)│  │
│  │   (Static Files)│ │ (Node.js)    │  │
│  └─────────────────┘ └──────────────┘  │
└─────────────────────────────────────────┘
```

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Build and start everything:**
   ```bash
   ./deploy.sh full
   ```

2. **Or step by step:**
   ```bash
   # Build the image
   ./deploy.sh build
   
   # Start the application
   ./deploy.sh start
   ```

3. **Access your application:**
   - Main App: http://localhost:3000
   - Login: http://localhost:3000/login
   - Dashboard: http://localhost:3000/dashboard

### Option 2: Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t admin-ui .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e MONGODB_URI=mongodb://your-mongo-host:27017/admin-ui \
     -e SESSION_SECRET=your-secret-key \
     admin-ui
   ```

### Option 3: Local development

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start the standalone server:**
   ```bash
   npm run dev
   ```

## Deployment Scripts

The `deploy.sh` script provides several useful commands:

```bash
./deploy.sh build      # Build Docker image
./deploy.sh start      # Start containers
./deploy.sh stop       # Stop containers
./deploy.sh restart    # Restart containers
./deploy.sh logs       # Show logs
./deploy.sh clean      # Clean up everything
./deploy.sh full       # Build and start
./deploy.sh help       # Show help
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/admin-ui

# Session
SESSION_SECRET=your-secret-key-change-in-production

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_TRACING_ENABLED=false

# Port
PORT=3000

# Node Environment
NODE_ENV=production

# Client Base URL Configuration
# This is used for generating redirect URLs in the application
# Set this to your actual client URL in production
CLIENT_BASE_URL=http://localhost:3000
BASE_URL=http://localhost:3000
```

**Important**: The `CLIENT_BASE_URL` and `BASE_URL` environment variables are crucial for fixing redirect issues. They ensure that all redirects in the application point to the correct URL instead of hardcoded localhost:3001.

## How It Works

### 1. Client Build Process
During server startup, the `buildClient()` function:
- Checks if client dependencies are installed
- Runs `npm run build` in the client directory
- Verifies the build output (`dist` folder)
- Serves the built files as static assets

### 2. Static File Serving
The server serves the built client files:
```javascript
app.use(express.static(clientDistPath));
```

### 3. Client-Side Routing
All non-API routes serve the client's `index.html`:
```javascript
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});
```

### 4. API Routes
API routes (`/api/*`, `/auth/*`) are handled normally by the Express server.

## Benefits

✅ **Single Port**: Everything runs on one port (3000)  
✅ **No Concurrently**: Single process, easier to manage  
✅ **Container Ready**: Perfect for Docker/Kubernetes  
✅ **Production Ready**: Built client served as static files  
✅ **Simplified Deployment**: One container to rule them all  
✅ **Better Resource Usage**: No need for multiple processes  

## Troubleshooting

### Build Failures
If the client build fails:
1. Check that all dependencies are installed: `npm run install:all`
2. Verify Node.js version (18+ recommended)
3. Check the build logs in the server output

### Port Conflicts
If port 3000 is already in use:
1. Change the `PORT` environment variable
2. Update the Docker port mapping
3. Restart the application

### Database Connection Issues
1. Ensure MongoDB is running and accessible
2. Check the `MONGODB_URI` environment variable
3. Verify network connectivity

### Client Not Loading
1. Check that the client build completed successfully
2. Verify the `dist` folder exists in `src/client/`
3. Check server logs for build errors

### Redirect Issues (localhost:3001 errors)
If you're seeing redirects to localhost:3001 that fail:

1. **Set environment variables:**
   ```bash
   export CLIENT_BASE_URL=http://localhost:3000
   export BASE_URL=http://localhost:3000
   ```

2. **Or add to your .env file:**
   ```env
   CLIENT_BASE_URL=http://localhost:3000
   BASE_URL=http://localhost:3000
   ```

3. **For production, use your actual domain:**
   ```env
   CLIENT_BASE_URL=https://yourdomain.com
   BASE_URL=https://yourdomain.com
   ```

4. **Restart the application** after setting these variables

The application now dynamically generates redirect URLs based on these environment variables instead of using hardcoded localhost:3001.

## Migration from Multi-Process

If you're migrating from the old multi-process setup:

1. **Stop the old processes:**
   ```bash
   # Stop any running dev servers
   pkill -f "npm run dev"
   ```

2. **Update your scripts:**
   ```bash
   # Old way
   npm run dev  # This ran concurrently
   
   # New way
   npm run dev  # This runs standalone server
   ```

3. **Update your environment:**
   - Remove `concurrently` dependency
   - Update any proxy configurations
   - Ensure all routes point to port 3000

## Production Considerations

- **Environment Variables**: Always set `NODE_ENV=production`
- **Session Secret**: Use a strong, unique session secret
- **MongoDB**: Use a production MongoDB instance
- **Logging**: Configure proper logging for production
- **Monitoring**: Set up health checks and monitoring
- **SSL**: Use a reverse proxy (nginx) for SSL termination

## Support

For issues or questions:
1. Check the server logs: `./deploy.sh logs`
2. Verify the build process completed
3. Check environment variables
4. Ensure MongoDB is accessible 