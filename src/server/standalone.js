const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Initialize Sentry first
const { initSentry, captureError, setUser, setTags } = require('./config/sentry');

// Initialize Sentry
initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  enableTracing: process.env.SENTRY_TRACING_ENABLED === 'true'
});

// Import admin-ui submodule
const adminUI = require('./index');

const app = express();

// Configure CORS
app.use(
  cors({
    origin: [
      'http://localhost:3000', 
      process.env.CLIENT_BASE_URL || process.env.BASE_URL || 'http://localhost:3000',
      'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
async function connectToDatabase() {
  const transaction = require('./config/sentry').createTransaction('database.connection', 'db');

  try {
    mongoose.set('strictQuery', false);

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-ui', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    });

    await new Promise((resolve, reject) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
      }
    });

    console.log('✅ Connected to MongoDB');

    if (transaction) {
      transaction.setStatus('ok');
      transaction.finish();
    }

    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.log('Server will continue without database connection');

    if (transaction) {
      transaction.setStatus('internal_error');
      transaction.finish();
    }

    captureError(err, {
      context: 'database.connection',
      mongodbUri: process.env.MONGODB_URI ? 'configured' : 'default'
    });

    return false;
  }
}

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-ui',
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// Initialize the application
async function initializeApp() {
  const transaction = require('./config/sentry').createTransaction('app.initialization', 'app');

  try {
    // Connect to database first
    console.log('🔧 Connecting to database...');
    const dbConnected = await connectToDatabase();

    if (!dbConnected) {
      console.log('⚠️ Warning: Database not connected. Some features may not work.');
    } else {
      console.log('✅ Database connection established and ready');
    }

    // Check if client is already built, build only if necessary
    let clientDistPath;
    const expectedClientDistPath = path.join(__dirname, '..', 'client', 'dist');
    
    if (fs.existsSync(expectedClientDistPath) && fs.existsSync(path.join(expectedClientDistPath, 'index.html'))) {
      console.log('✅ Client already built, using existing build');
      clientDistPath = expectedClientDistPath;
    } else {
      // If client is not built, we can't serve static files.
      // This will cause a 404 for all non-API routes.
      // We can't proceed without a client build.
      console.error('❌ Client application not found at expected path. Please ensure client is built.');
      process.exit(1);
    }
    
    // Serve static files from the built client
    app.use(express.static(clientDistPath));
    
    // Initialize admin-ui submodule
    console.log('🔧 Initializing admin-ui submodule...');
    await adminUI.initApp({
      config: {
        // Add any config here
      },
      logger: require('./utils/logger'),
      mongoose,
      models: {}
    });

    // Get passport from admin-ui submodule
    const adminPassport = adminUI.getPassport();

    // Use passport from admin-ui submodule
    app.use(adminPassport.initialize());
    app.use(adminPassport.session());

    // Get middleware from admin-ui submodule
    const { ensureTenantSelected, errorHandler } = adminUI.getMiddleware();

    // Get routes from admin-ui submodule
    const adminRoutes = adminUI.getRoutes();

    // Create separate route handling for API vs UI routes
    // API routes get middleware, UI routes don't
    
    // Apply admin-ui routes (API routes) with middleware
    // Note: adminRoutes already have /api and /auth prefixes, so mount at root
    app.use(ensureTenantSelected, adminRoutes);
    
    console.log('✅ API routes mounted with middleware at root level');
    console.log('📋 Available API routes: /api/*, /auth/*');

    // Handle client-side routing - serve index.html for all non-API routes
    // This should come AFTER the API routes to avoid conflicts
    app.get('*', (req, res) => {
      // Define which routes are API endpoints vs UI routes
      const isApiRoute = req.path.startsWith('/api');
      
      // Only specific auth routes are API endpoints, others are UI routes
      const isAuthApiRoute = req.path.startsWith('/auth') && (
        req.path === '/auth/login' ||
        req.path === '/auth/logout' ||
        req.path.startsWith('/auth/mfa') ||
        req.path.startsWith('/auth/oauth') ||
        req.path === '/auth/callback' ||
        req.path === '/auth/verify' ||
        req.path === '/auth/select-tenant' ||  // This is an API endpoint!
        req.path === '/auth/tenant-selection'  // This is an API endpoint!
      );
      
      // Debug route classification (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Route classification: ${req.path} -> API: ${isApiRoute}, Auth API: ${isAuthApiRoute}`);
      }
      
      // Skip API routes - these should already be handled above
      if (isApiRoute || isAuthApiRoute) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      
      // For all other routes (UI routes only),
      // serve the client's index.html to enable client-side routing
      const indexPath = path.join(clientDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Client application not found');
      }
    });

    // Global error handler (must be last)
    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Admin UI Server started on http://localhost:${PORT}`);
      console.log(`📱 Client application served from: ${clientDistPath}`);
      console.log(`🔐 Login: http://localhost:${PORT}/login`);
      console.log(`⚙️  API: http://localhost:${PORT}/api`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    });

    if (transaction) {
      transaction.setStatus('ok');
      transaction.finish();
    }

  } catch (err) {
    console.error('❌ Failed to initialize application:', err);

    if (transaction) {
      transaction.setStatus('internal_error');
      transaction.finish();
    }

    captureError(err, { context: 'app.initialization' });
    process.exit(1);
  }
}

// Start the application
initializeApp().catch(err => {
  console.error('❌ Failed to initialize application:', err);
  captureError(err, { context: 'app.startup' });
  process.exit(1);
});
