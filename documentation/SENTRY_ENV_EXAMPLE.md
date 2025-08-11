# Sentry Environment Configuration Example

Create a `.env` file in the root directory with the following configuration:

```bash
# Sentry Configuration
# Replace with your actual Sentry DSN
SENTRY_DSN=your-sentry-dsn-here

# Sentry Tracing Configuration
SENTRY_TRACING_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_DEBUG=false

# Client-side Sentry Configuration (for Vite)
VITE_SENTRY_DSN=your-sentry-dsn-here
VITE_SENTRY_TRACING_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_DEBUG=false

# Environment Configuration
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/admin-ui

# Session Configuration
SESSION_SECRET=your-session-secret-here
```

## Configuration Details

### Required Variables
- `SENTRY_DSN` - Your Sentry project DSN (server-side)
- `VITE_SENTRY_DSN` - Your Sentry project DSN (client-side)

### Optional Variables
- `SENTRY_TRACING_ENABLED` - Enable performance tracing (default: false)
- `SENTRY_TRACES_SAMPLE_RATE` - Sampling rate for transactions (default: 0.1)
- `SENTRY_DEBUG` - Enable debug mode (default: false)
- `VITE_SENTRY_TRACING_ENABLED` - Enable client-side tracing (default: false)
- `VITE_SENTRY_TRACES_SAMPLE_RATE` - Client-side sampling rate (default: 0.1)
- `VITE_SENTRY_DEBUG` - Enable client-side debug mode (default: false)

## Getting Your Sentry DSN

1. Go to [Sentry.io](https://sentry.io)
2. Create a new project or select an existing one
3. Go to Settings > Projects > [Your Project] > Client Keys (DSN)
4. Copy the DSN value
5. Replace `your-sentry-dsn-here` with your actual DSN

## Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
SENTRY_DEBUG=true
VITE_SENTRY_DEBUG=true
SENTRY_TRACING_ENABLED=false
VITE_SENTRY_TRACING_ENABLED=false
```

### Production
```bash
NODE_ENV=production
SENTRY_DEBUG=false
VITE_SENTRY_DEBUG=false
SENTRY_TRACING_ENABLED=true
VITE_SENTRY_TRACING_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Staging
```bash
NODE_ENV=staging
SENTRY_DEBUG=false
VITE_SENTRY_DEBUG=false
SENTRY_TRACING_ENABLED=true
VITE_SENTRY_TRACING_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.5
VITE_SENTRY_TRACES_SAMPLE_RATE=0.5
``` 