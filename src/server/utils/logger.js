const log4js = require('log4js');

// Configure log4js
log4js.configure({
  appenders: {
    console: { 
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p]: %m'
      }
    },
    errorFile: { 
      type: 'file', 
      filename: 'logs/error.log', 
      maxLogSize: 10485760, 
      backups: 15, 
      compress: true 
    },
    combinedFile: { 
      type: 'file', 
      filename: 'logs/combined.log', 
      maxLogSize: 10485760, 
      backups: 15, 
      compress: true 
    },
    authFile: { 
      type: 'file', 
      filename: 'logs/auth.log', 
      maxLogSize: 10485760, 
      backups: 15, 
      compress: true 
    },
    mfaFile: { 
      type: 'file', 
      filename: 'logs/mfa.log', 
      maxLogSize: 10485760, 
      backups: 15, 
      compress: true 
    }
  },
  categories: {
    default: { 
      appenders: ['console', 'combinedFile'], 
      level: process.env.LOG_LEVEL || 'info' 
    },
    error: { 
      appenders: ['console', 'errorFile'], 
      level: 'error' 
    },
    auth: { 
      appenders: ['console', 'authFile'], 
      level: process.env.LOG_LEVEL || 'info' 
    },
    mfa: { 
      appenders: ['console', 'mfaFile'], 
      level: process.env.LOG_LEVEL || 'info' 
    }
  }
});

// Create logger instances
const mainLogger = log4js.getLogger();
const errorLogger = log4js.getLogger('error');
const authLogger = log4js.getLogger('auth');
const mfaLogger = log4js.getLogger('mfa');

// Helper function to format messages with metadata
const formatMessage = (message, meta = {}) => {
  if (Object.keys(meta).length > 0) {
    return `${message} ${JSON.stringify(meta)}`;
  }
  return message;
};

// Export logger with domain-specific methods
module.exports = {
  // General logging
  info: (message, meta = {}) => mainLogger.info(formatMessage(message, meta)),
  error: (message, meta = {}) => errorLogger.error(formatMessage(message, meta)),
  warn: (message, meta = {}) => mainLogger.warn(formatMessage(message, meta)),
  debug: (message, meta = {}) => mainLogger.debug(formatMessage(message, meta)),

  // Auth-specific logging
  auth: (message, meta = {}) => authLogger.info(`[AUTH] ${formatMessage(message, meta)}`),
  authError: (message, meta = {}) => authLogger.error(`[AUTH] ${formatMessage(message, meta)}`),

  // MFA-specific logging
  mfa: (message, meta = {}) => mfaLogger.info(`[MFA] ${formatMessage(message, meta)}`),
  mfaError: (message, meta = {}) => mfaLogger.error(`[MFA] ${formatMessage(message, meta)}`),

  // Database logging
  db: (message, meta = {}) => mainLogger.info(`[DB] ${formatMessage(message, meta)}`),
  dbError: (message, meta = {}) => errorLogger.error(`[DB] ${formatMessage(message, meta)}`),

  // API logging
  api: (message, meta = {}) => mainLogger.info(`[API] ${formatMessage(message, meta)}`),
  apiError: (message, meta = {}) => errorLogger.error(`[API] ${formatMessage(message, meta)}`),
};
