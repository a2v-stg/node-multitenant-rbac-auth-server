const express = require('express');
const router = express.Router();

/**
 * Test endpoint to verify rate limiting is working
 */
router.get('/rate-limit', (req, res) => {
  res.json({
    message: 'Rate limit test endpoint',
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    rateLimitInfo: req.rateLimit ? {
      remaining: req.rateLimit.remaining,
      limit: req.rateLimit.limit,
      resetTime: req.rateLimit.resetTime
    } : null
  });
});

/**
 * Endpoint to check current rate limit status
 */
router.get('/rate-limit/status', (req, res) => {
  if (req.rateLimit) {
    res.json({
      remaining: req.rateLimit.remaining,
      limit: req.rateLimit.limit,
      resetTime: req.rateLimit.resetTime,
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  } else {
    res.json({ 
      message: 'No rate limit information available',
      note: 'This endpoint may not be protected by rate limiting'
    });
  }
});

/**
 * Health check endpoint (should not be rate limited)
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    rateLimitInfo: req.rateLimit ? {
      remaining: req.rateLimit.remaining,
      limit: req.rateLimit.limit
    } : null
  });
});

/**
 * Test endpoint for authentication rate limiting
 */
router.post('/auth-test', (req, res) => {
  res.json({
    message: 'Authentication test endpoint',
    ip: req.ip,
    timestamp: new Date().toISOString(),
    rateLimitInfo: req.rateLimit ? {
      remaining: req.rateLimit.remaining,
      limit: req.rateLimit.limit
    } : null
  });
});

/**
 * Test endpoint for API rate limiting
 */
router.get('/api-test', (req, res) => {
  res.json({
    message: 'API test endpoint',
    ip: req.ip,
    timestamp: new Date().toISOString(),
    rateLimitInfo: req.rateLimit ? {
      remaining: req.rateLimit.remaining,
      limit: req.rateLimit.limit
    } : null
  });
});

module.exports = router; 