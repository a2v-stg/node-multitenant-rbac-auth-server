// Rate limiting configuration
// This file contains all the rate limiting settings that can be customized via environment variables

module.exports = {
  // General rate limiting settings
  general: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },

  // Authentication rate limiting
  auth: {
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS) || 5, // 5 attempts per window
    message: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },

  // API rate limiting
  api: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 50, // 50 requests per window
    message: 'Too many API requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },

  // File upload rate limiting
  upload: {
    windowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_FILES) || 10, // 10 uploads per hour
    message: 'Too many file uploads from this IP, please try again later.',
    retryAfter: '1 hour'
  },

  // MFA rate limiting
  mfa: {
    windowMs: parseInt(process.env.MFA_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
    max: parseInt(process.env.MFA_RATE_LIMIT_MAX_ATTEMPTS) || 3, // 3 attempts per 5 minutes
    message: 'Too many MFA attempts from this IP, please try again later.',
    retryAfter: '5 minutes'
  },

  // Admin operations rate limiting
  admin: {
    windowMs: parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.ADMIN_RATE_LIMIT_MAX_OPERATIONS) || 30, // 30 operations per 15 minutes
    message: 'Too many admin operations from this IP, please try again later.',
    retryAfter: '15 minutes'
  },

  // Speed limiting settings
  speedLimit: {
    windowMs: parseInt(process.env.SPEED_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    delayAfter: parseInt(process.env.SPEED_LIMIT_DELAY_AFTER) || 50, // start delaying after 50 requests
    delayMs: parseInt(process.env.SPEED_LIMIT_DELAY_MS) || 500, // 500ms delay per request
    maxDelayMs: parseInt(process.env.SPEED_LIMIT_MAX_DELAY_MS) || 20000 // maximum 20 second delay
  },

  // Role-based rate limiting
  roleBased: {
    admin: parseInt(process.env.ROLE_ADMIN_RATE_LIMIT) || 100,
    tenantadmin: parseInt(process.env.ROLE_TENANT_ADMIN_RATE_LIMIT) || 50,
    user: parseInt(process.env.ROLE_USER_RATE_LIMIT) || 25,
    default: parseInt(process.env.ROLE_DEFAULT_RATE_LIMIT) || 10
  },

  // Trust proxy settings (important for getting real IP addresses)
  trustProxy: process.env.TRUST_PROXY === 'true',

  // Skip rate limiting for certain IPs (comma-separated)
  skipIPs: process.env.SKIP_RATE_LIMIT_IPS ? process.env.SKIP_RATE_LIMIT_IPS.split(',') : [],

  // Skip rate limiting for certain user agents (comma-separated)
  skipUserAgents: process.env.SKIP_RATE_LIMIT_USER_AGENTS ? process.env.SKIP_RATE_LIMIT_USER_AGENTS.split(',') : [],

  // Environment-specific overrides
  environment: {
    development: {
      general: { max: 1000 }, // More lenient in development
      auth: { max: 20 },
      api: { max: 200 }
    },
    production: {
      general: { max: 100 }, // Stricter in production
      auth: { max: 5 },
      api: { max: 50 }
    },
    staging: {
      general: { max: 200 }, // Moderate in staging
      auth: { max: 10 },
      api: { max: 100 }
    }
  }
};
