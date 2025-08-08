# Admin UI Server - Standalone Mode

This directory contains the Admin UI server that can run in two modes:

## 1. Submodule Mode (Default)
Used when the server is imported as a dependency in another application.

```bash
# From the root directory
npm run dev:server
# or
cd src/server && npm run dev
```

## 2. Standalone Mode (New Feature)
Run the server independently without requiring a parent application.

### Prerequisites
- MongoDB running (default: `mongodb://localhost:27017/admin-ui`)
- Node.js and npm installed

### Environment Variables
Create a `.env` file in the root directory with:

```env
MONGODB_URI=mongodb://localhost:27017/admin-ui
SESSION_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
```

### Running Standalone Server

#### Development Mode
```bash
# From the root directory
npm run standalone

# Or from the server directory
cd src/server && npm run standalone
```

#### Production Mode
```bash
# From the root directory
npm run standalone:prod

# Or from the server directory
cd src/server && npm run standalone:prod
```

### Access Points
Once the standalone server is running, you can access:

- **Dashboard**: http://localhost:3000/dashboard
- **Login**: http://localhost:3000/login
- **API**: http://localhost:3000/api
- **Tenant Selection**: http://localhost:3000/select-tenant

### Features Available in Standalone Mode
- ✅ User authentication and authorization
- ✅ Multi-factor authentication (MFA)
- ✅ Role-based access control (RBAC)
- ✅ Tenant management
- ✅ User management
- ✅ Blacklist management
- ✅ Settings management
- ✅ Database migrations
- ✅ Session management
- ✅ API endpoints

### Differences from Submodule Mode
- Runs independently without parent application dependencies
- Includes its own Express server setup
- Handles its own database connection
- Manages its own session configuration
- Includes CORS configuration for frontend integration

### Troubleshooting
1. **Database Connection Issues**: Ensure MongoDB is running and accessible
2. **Port Conflicts**: Change the PORT environment variable if 3000 is in use
3. **Session Issues**: Ensure SESSION_SECRET is set in your .env file
4. **CORS Issues**: Update the CORS configuration in `standalone.js` if needed

### Development
To modify the standalone server, edit the `standalone.js` file. The server uses the same core functionality as the submodule mode but with its own Express application setup. 