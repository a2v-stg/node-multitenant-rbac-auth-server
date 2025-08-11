module.exports = {
  auth: require('./authMiddleware'),
  errorHandler: require('./errorHandler'),
  rbac: require('./rbacMiddleware'),
  tenantValidation: require('./tenantValidation'),
  validation: require('./validation'),
  rateLimit: require('./rateLimit'),
  routeRateLimit: require('./routeRateLimit'),
  setupRateLimit: require('./setupRateLimit')
};
