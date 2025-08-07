const path = require('path');

module.exports = {
  // Main app
  app: require('./app.js'),
  
  // Sample app specific services
  services: {
    // Add sample-app specific services here
  },
  
  // Sample app specific middleware
  middleware: {
    // Add sample-app specific middleware here
  },
  
  // Sample app specific models
  models: {
    // Add sample-app specific models here
  },
  
  // Sample app specific routes
  routes: {
    core: require('./routes/core')
  },
  
  // Sample app specific configuration
  config: {
    // Add sample-app specific config here
  },
  
  // Sample app specific utils
  utils: {
    // Add sample-app specific utils here
  },
  
  // Sample app specific scripts
  scripts: {
    // Add sample-app specific scripts here
  },
  
  // Paths
  paths: {
    views: path.join(__dirname, 'views'),
    scripts: path.join(__dirname, 'scripts'),
    migrations: path.join(__dirname, 'migrations'),
    tests: path.join(__dirname, 'tests')
  }
}; 