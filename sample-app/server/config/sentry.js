const Sentry = require('@sentry/node');

/**
 * Initialize Sentry for sample-app server-side error tracking and performance monitoring
 * @param {Object} options - Configuration options
 * @param {string} options.dsn - Sentry DSN
 * @param {string} options.environment - Environment name (development, staging, production)
 * @param {boolean} options.enableTracing - Whether to enable performance tracing
 */
function initSentry(options = {}) {
  const {
    dsn = process.env.SENTRY_DSN,
    environment = process.env.NODE_ENV || 'development',
    enableTracing = process.env.SENTRY_TRACING_ENABLED === 'true',
    tracesSampleRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1
  } = options;

  if (!dsn) {
    console.warn('⚠️ Sentry DSN not provided. Sentry will not be initialized.');
    return;
  }

  // Initialize Sentry
  Sentry.init({
    dsn,
    environment,
    
    // Performance monitoring
    tracesSampleRate: enableTracing ? tracesSampleRate : 0,
    
    // Enable debug mode in development
    debug: environment === 'development',
    
    // Before send hook to filter out certain errors
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly enabled
      if (environment === 'development' && !process.env.SENTRY_DEBUG) {
        return null;
      }
      
      // Filter out certain error types if needed
      if (event.exception) {
        const exception = event.exception.values[0];
        if (exception.type === 'NetworkError' || exception.type === 'TimeoutError') {
          return null;
        }
      }
      
      return event;
    },
    
    // Before send transaction hook
    beforeSendTransaction(event) {
      // Don't send transactions in development unless explicitly enabled
      if (environment === 'development' && !process.env.SENTRY_DEBUG) {
        return null;
      }
      
      return event;
    }
  });

  console.log(`✅ Sentry initialized for sample-app server environment: ${environment}`);
  
  return Sentry;
}

/**
 * Create a Sentry transaction for tracking operations
 * @param {string} name - Transaction name
 * @param {string} op - Operation type
 * @param {Object} data - Additional data
 * @returns {Object} Sentry transaction
 */
function createTransaction(name, op = 'default', data = {}) {
  if (!Sentry.getCurrentHub().getClient()) {
    return null;
  }
  
  const transaction = Sentry.startTransaction({
    name,
    op,
    data
  });
  
  Sentry.getCurrentHub().configureScope(scope => {
    scope.setSpan(transaction);
  });
  
  return transaction;
}

/**
 * Create a Sentry span for tracking sub-operations
 * @param {string} name - Span name
 * @param {string} op - Operation type
 * @param {Object} data - Additional data
 * @returns {Object} Sentry span
 */
function createSpan(name, op = 'default', data = {}) {
  const currentSpan = Sentry.getCurrentHub().getScope().getSpan();
  if (!currentSpan) {
    return null;
  }
  
  return currentSpan.startChild({
    name,
    op,
    data
  });
}

/**
 * Capture and report an error to Sentry
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
function captureError(error, context = {}) {
  if (!Sentry.getCurrentHub().getClient()) {
    console.error('Sentry not initialized, logging error:', error);
    return;
  }
  
  Sentry.withScope(scope => {
    // Add context data
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    
    Sentry.captureException(error);
  });
}

/**
 * Capture and report a message to Sentry
 * @param {string} message - Message to capture
 * @param {string} level - Log level (info, warning, error)
 * @param {Object} context - Additional context
 */
function captureMessage(message, level = 'info', context = {}) {
  if (!Sentry.getCurrentHub().getClient()) {
    console.log(`Sentry not initialized, logging message: ${message}`);
    return;
  }
  
  Sentry.withScope(scope => {
    // Add context data
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    
    Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context for Sentry
 * @param {Object} user - User object
 */
function setUser(user) {
  if (!Sentry.getCurrentHub().getClient()) {
    return;
  }
  
  Sentry.setUser({
    id: user.id || user._id,
    email: user.email,
    username: user.username,
    tenantId: user.tenantId
  });
}

/**
 * Clear user context for Sentry
 */
function clearUser() {
  if (!Sentry.getCurrentHub().getClient()) {
    return;
  }
  
  Sentry.setUser(null);
}

/**
 * Set tags for Sentry
 * @param {Object} tags - Tags object
 */
function setTags(tags) {
  if (!Sentry.getCurrentHub().getClient()) {
    return;
  }
  
  Sentry.setTags(tags);
}

/**
 * Set extra context for Sentry
 * @param {Object} extras - Extra context object
 */
function setExtras(extras) {
  if (!Sentry.getCurrentHub().getClient()) {
    return;
  }
  
  Sentry.setExtras(extras);
}

module.exports = {
  initSentry,
  createTransaction,
  createSpan,
  captureError,
  captureMessage,
  setUser,
  clearUser,
  setTags,
  setExtras,
  Sentry
}; 