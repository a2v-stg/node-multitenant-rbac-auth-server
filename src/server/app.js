// This file is kept for backward compatibility
// The new dependency injection pattern is implemented in index.js

const { initApp, getRoutes, getMiddleware, getPassport } = require('./index');

module.exports = {
  initApp,
  getRoutes,
  getMiddleware,
  getPassport
};
