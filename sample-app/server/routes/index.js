const express = require('express');
const router = express.Router();

// Import sample-app specific routes
const coreRoutes = require('./core');

// Mount sample-app routes
router.use('/core', coreRoutes);

// Sample app health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Sample App is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 