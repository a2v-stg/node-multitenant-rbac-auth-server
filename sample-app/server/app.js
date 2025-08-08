// Register module aliases FIRST - before any other imports
require('module-alias/register');

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const MongoStore = require('connect-mongo');

// Load environment variables from the root directory FIRST
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Import admin-ui submodule
const adminUI = require('@admin-ui/server');

// Import FDE engine models
let fdeModels = {};
try {
  // Import FDE engine model schemas and register them with the current mongoose instance
  const decisionModel = require('../stgcore-app-fde-engine/src/shared/db/models/decisionModel');
  const documentsModel = require('../stgcore-app-fde-engine/src/shared/db/models/documentsModel');
  const eventModel = require('../stgcore-app-fde-engine/src/shared/db/models/eventModel');
  const errorModel = require('../stgcore-app-fde-engine/src/shared/db/models/errorModel');
  const blackListModel = require('../stgcore-app-fde-engine/src/shared/db/models/blackListModel');
  const securityViolationModel = require('../stgcore-app-fde-engine/src/shared/db/models/securityViolationModel');
  const retroReviewModel = require('../stgcore-app-fde-engine/src/shared/db/models/retroreviewModel');
  
  // Register models with the current mongoose instance and explicit collection names
  fdeModels = {
    DecisionModel: mongoose.model('decisionTree', decisionModel.schema, 'decisionTree'),
    DocumentsModel: mongoose.model('documents', documentsModel.schema, 'documents'),
    EventModel: mongoose.model('event', eventModel.schema, 'event'),
    ErrorModel: mongoose.model('error', errorModel.schema, 'error'),
    BlackListModel: mongoose.model('blackList', blackListModel.schema, 'blackList'),
    SecurityViolationModel: mongoose.model('securityViolation', securityViolationModel.schema, 'securityViolation'),
    RetroReviewModel: mongoose.model('retroreview', retroReviewModel.schema, 'retroreview')
  };
  
  console.log('✅ FDE engine models registered successfully');
} catch (error) {
  console.warn('⚠️ FDE engine models not available:', error.message);
}

const app = express();

// Configure CORS
app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// View engine setup - point to admin-ui views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../src/server/views'));

// Database connection with better error handling
async function connectToDatabase() {
  try {
    // Set mongoose options to handle connection better
    mongoose.set('strictQuery', false);
    
    // Wait for the connection to be established
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Increased timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority',
    });
    
    // Wait for the connection to be ready
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

// Session configuration with better security
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
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
  // Connect to database first and wait for it to be ready
  console.log('🔧 Connecting to database...');
  const dbConnected = await connectToDatabase();
  
  if (!dbConnected) {
    console.log('⚠️ Warning: Database not connected. Some features may not work.');
  } else {
    console.log('✅ Database connection established and ready');
  }

  // Initialize admin-ui submodule with dependencies
  console.log('🔧 Initializing admin-ui submodule with dependencies...');
  await adminUI.initApp({
    config: {
      // Add any config here
    },
    logger: require('@admin-ui/utils/logger'),
    mongoose: mongoose,
    models: {
      // Add any custom models here if needed
      ...fdeModels // Pass FDE engine models to admin-ui
    }
  });

  // Get passport from admin-ui submodule
  const adminPassport = adminUI.getPassport();
  
  // Use passport from admin-ui submodule
  app.use(adminPassport.initialize());
  app.use(adminPassport.session());

  // Sample-app specific routes
  app.get('/api/sample', (req, res) => {
    res.json({ message: 'This is a sample app using admin-ui submodule' });
  });

  app.get('/api/fde-engine', (req, res) => {
    res.json({ 
      message: 'FDE Engine is available',
      engine: 'Not loaded - commented out for now'
    });
  });

  // Core data API (app-specific)
  app.get('/api/core-data', (req, res) => {
    res.json({
      records: [
        { id: 1, name: 'Sample Document 1', type: 'document', status: 'active', createdBy: 'admin' },
        { id: 2, name: 'User Profile Data', type: 'user', status: 'active', createdBy: 'admin' },
        { id: 3, name: 'Transaction Log', type: 'transaction', status: 'pending', createdBy: 'user' },
        { id: 4, name: 'Monthly Report', type: 'report', status: 'inactive', createdBy: 'tenantadmin' }
      ]
    });
  });

  app.post('/api/core-data', (req, res) => {
    // Handle creating new core data records
    res.json({ message: 'Record created successfully', id: Date.now() });
  });

  app.put('/api/core-data/:id', (req, res) => {
    // Handle updating core data records
    res.json({ message: 'Record updated successfully', id: req.params.id });
  });

  app.delete('/api/core-data/:id', (req, res) => {
    // Handle deleting core data records
    res.json({ message: 'Record deleted successfully', id: req.params.id });
  });

  // Import and mount sample-app specific routes
  const parentAppRoutes = require('./routes');
  app.use('/api', parentAppRoutes);

  // Get middleware from admin-ui submodule
  const { ensureTenantSelected, errorHandler } = adminUI.getMiddleware();

  // Get routes from admin-ui submodule
  const adminRoutes = adminUI.getRoutes();

  // Apply admin-ui routes
  app.use(ensureTenantSelected);
  app.use('/', adminRoutes);

  // Global error handler (must be last)
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`Sample App Server started on http://localhost:${PORT}`)
  );
}

// Start the application
initializeApp().catch(err => {
  console.error('❌ Failed to initialize application:', err);
  process.exit(1);
}); 