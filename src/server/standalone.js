const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const MongoStore = require('connect-mongo');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Import admin-ui submodule
const adminUI = require('./index');

const app = express();

// Configure CORS
app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
async function connectToDatabase() {
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
      w: 'majority',
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
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.log('Server will continue without database connection');
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
      autoRemove: 'native',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Initialize the application
async function initializeApp() {
  // Connect to database first
  console.log('🔧 Connecting to database...');
  const dbConnected = await connectToDatabase();
  
  if (!dbConnected) {
    console.log('⚠️ Warning: Database not connected. Some features may not work.');
  } else {
    console.log('✅ Database connection established and ready');
  }

  // Initialize admin-ui submodule
  console.log('🔧 Initializing admin-ui submodule...');
  await adminUI.initApp({
    config: {
      // Add any config here
    },
    logger: require('./utils/logger'),
    mongoose: mongoose,
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

  // Add standalone dashboard route
  app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/auth/login');
    }
    
    // Get tenant info from session
    const tenant = req.session.tenantId ? { tenantId: req.session.tenantId } : null;
    
    res.render('dashboard', {
      user: req.user,
      tenant: tenant || { name: 'Default Tenant', tenantId: 'default' },
      userRoles: [],
      userPermissions: []
    });
  });

  // Add a simple home route that redirects to dashboard if authenticated
  app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard');
    } else {
      res.redirect('/auth/login');
    }
  });

  // Apply admin-ui routes
  app.use(ensureTenantSelected);
  app.use('/', adminRoutes);

  // Global error handler (must be last)
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Admin UI Submodule Server started on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`🔐 Login: http://localhost:${PORT}/login`);
    console.log(`⚙️  API: http://localhost:${PORT}/api`);
  });
}

// Start the application
initializeApp().catch(err => {
  console.error('❌ Failed to initialize application:', err);
  process.exit(1);
}); 