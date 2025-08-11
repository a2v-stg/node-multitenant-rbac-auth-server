# Rate Limiting Middleware

This directory contains a comprehensive rate limiting solution designed to protect your application against denial-of-service (DoS) attacks and abuse.

## Overview

The rate limiting system provides multiple layers of protection:

1. **General Rate Limiting**: Applies to all routes
2. **Route-Specific Rate Limiting**: Different limits for different types of routes
3. **Role-Based Rate Limiting**: Different limits based on user roles
4. **Speed Limiting**: Gradually slows down requests after thresholds
5. **Environment-Specific Limits**: Different limits for development, staging, and production

## Files

- `rateLimit.js` - Core rate limiting middleware with configurable limits
- `routeRateLimit.js` - Route-specific rate limiting utilities
- `setupRateLimit.js` - Main setup functions for the entire application
- `../config/rateLimit.js` - Configuration file with environment variable support

## Quick Start

### 1. Install Dependencies

```bash
npm install express-rate-limit express-slow-down
```

### 2. Basic Setup

```javascript
const { setupAllRateLimiting } = require('./middleware/setupRateLimit');

// Apply to your Express app
const app = express();
setupAllRateLimiting(app);
```

### 3. Environment Configuration

Copy the example environment file and customize:

```bash
cp src/server/config/rate-limit.env.example .env
```

## Usage Examples

### Apply to All Routes

```javascript
const { setupRateLimit } = require('./middleware/setupRateLimit');

app.use(setupRateLimit);
```

### Apply to Specific Routes

```javascript
const { routeRateLimit } = require('./middleware/routeRateLimit');

// Apply to authentication routes
app.use('/auth', routeRateLimit.auth);

// Apply to API routes
app.use('/api', routeRateLimit.api);

// Apply to admin routes
app.use('/admin', routeRateLimit.admin);
```

### Role-Based Rate Limiting

```javascript
const { routeRateLimit } = require('./middleware/routeRateLimit');

// Apply different limits based on user role
app.use('/api/admin', routeRateLimit.roleBased('admin'));
app.use('/api/tenant', routeRateLimit.roleBased('tenantadmin'));
```

### Custom Rate Limiting

```javascript
const { rateLimit } = require('express-rate-limit');

const customLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 requests per windowMs
  message: 'Custom rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/custom-route', customLimiter);
```

## Configuration Options

### Environment Variables

All rate limiting settings can be configured via environment variables:

```bash
# General settings
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100          # Max requests per window

# Authentication
AUTH_RATE_LIMIT_MAX_ATTEMPTS=5       # Max auth attempts

# API endpoints
API_RATE_LIMIT_MAX_REQUESTS=50       # Max API requests

# File uploads
UPLOAD_RATE_LIMIT_MAX_FILES=10       # Max uploads per hour

# MFA
MFA_RATE_LIMIT_MAX_ATTEMPTS=3        # Max MFA attempts per 5 minutes
```

### Environment-Specific Overrides

The system automatically applies different limits based on `NODE_ENV`:

- **Development**: More lenient limits for testing
- **Staging**: Moderate limits for pre-production testing
- **Production**: Stricter limits for security

### Skip Conditions

You can configure the system to skip rate limiting for:

- Specific IP addresses
- Specific user agents
- Health check endpoints
- Monitoring bots

```bash
SKIP_RATE_LIMIT_IPS=127.0.0.1,::1
SKIP_RATE_LIMIT_USER_AGENTS=health-check,monitoring-bot
```

## Rate Limiting Strategies

### 1. General Protection

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Applies to**: All routes

### 2. Authentication Protection

- **Window**: 15 minutes
- **Limit**: 5 attempts per IP
- **Applies to**: Login, registration, password reset

### 3. API Protection

- **Window**: 15 minutes
- **Limit**: 50 requests per IP
- **Applies to**: All API endpoints

### 4. File Upload Protection

- **Window**: 1 hour
- **Limit**: 10 uploads per IP
- **Applies to**: File upload endpoints

### 5. MFA Protection

- **Window**: 5 minutes
- **Limit**: 3 attempts per IP
- **Applies to**: MFA verification endpoints

### 6. Admin Operation Protection

- **Window**: 15 minutes
- **Limit**: 30 operations per IP
- **Applies to**: Administrative endpoints

## Monitoring and Logging

The system provides comprehensive monitoring:

- Rate limit headers in responses
- Console warnings when limits are approached
- Custom error messages with retry information
- IP address tracking for debugging

### Response Headers

```
X-RateLimit-Remaining: 45
X-RateLimit-Limit: 100
X-RateLimit-Reset: 1640995200000
```

### Error Responses

When rate limits are exceeded, the system returns:

```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": 900,
  "limit": 100,
  "remaining": 0,
  "resetTime": 1640995200000
}
```

## Security Features

### IP Address Detection

- Automatic detection of real client IPs
- Support for reverse proxy configurations
- Configurable trust proxy settings

### Brute Force Protection

- Stricter limits for authentication endpoints
- Progressive delays for repeated violations
- Configurable lockout periods

### Role-Based Security

- Different limits for different user types
- Admin operations have stricter limits
- Tenant-specific rate limiting

## Best Practices

### 1. Apply Early

Apply rate limiting middleware early in your middleware chain, before route handlers.

### 2. Monitor and Adjust

- Monitor rate limit violations
- Adjust limits based on legitimate usage patterns
- Use environment-specific configurations

### 3. Handle Errors Gracefully

- Provide clear error messages
- Include retry information
- Log violations for security analysis

### 4. Test Thoroughly

- Test rate limiting in development
- Verify limits work correctly in staging
- Monitor performance impact in production

## Troubleshooting

### Common Issues

1. **Rate limiting not working**: Check middleware order
2. **Wrong IP addresses**: Configure trust proxy settings
3. **Too strict limits**: Adjust environment variables
4. **Performance impact**: Monitor and optimize

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=rate-limit:*
```

### Health Checks

Exclude health check endpoints from rate limiting:

```javascript
app.use('/health', (req, res, next) => {
  // Skip rate limiting for health checks
  next();
});
```

## Integration with Existing Code

The rate limiting system is designed to integrate seamlessly with your existing Express application:

1. **No breaking changes** to existing routes
2. **Configurable limits** for different environments
3. **Easy to disable** if needed
4. **Minimal performance impact**

## Support

For issues or questions:

1. Check the configuration examples
2. Review the environment variable documentation
3. Test with different rate limiting strategies
4. Monitor application logs for errors

## License

This rate limiting system is part of the admin-ui project and follows the same licensing terms. 