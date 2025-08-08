# Authentication & Multi-Factor Authentication Guide

## Overview

The Admin UI provides a comprehensive authentication system with support for local authentication, OAuth integration, and configurable Multi-Factor Authentication (MFA). The system is designed to be secure, flexible, and user-friendly.

## Authentication Methods

### 1. Local Authentication

**Features:**
- Username/email and password authentication
- Secure password hashing with bcrypt
- Password policy enforcement
- Account lockout protection

**Implementation:**
```javascript
// Password hashing
const bcrypt = require('bcrypt');
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password verification
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 2. OAuth Integration

**Supported Providers:**
- Configurable OAuth2 providers
- Automatic user provisioning
- Profile information synchronization
- MFA bypass for OAuth users (configurable)

**Configuration:**
```javascript
// OAuth Strategy Configuration
passport.use(new OAuth2Strategy({
  clientID: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: '/auth/oauth/callback'
}, async (accessToken, refreshToken, profile, done) => {
  // User provisioning logic
}));
```

## Multi-Factor Authentication (MFA)

### Supported MFA Methods

1. **TOTP (Time-based One-Time Password)**
   - Authenticator apps (Google Authenticator, Authy, etc.)
   - QR code setup
   - 6-digit time-based codes

2. **SMS Authentication**
   - Phone number verification
   - Text message delivery
   - Configurable providers

3. **Voice Authentication**
   - Phone call verification
   - Voice code delivery
   - Fallback for SMS issues

4. **Authy Integration**
   - Authy push notifications
   - Authy app integration
   - Enhanced security features

### MFA Configuration Levels

#### 1. Organization Level
```javascript
// Organization MFA settings
{
  organizationMfaEnabled: true,
  organizationMfaGracePeriod: 7, // days
  organizationMfaMethods: ['totp', 'sms'],
  organizationMfaRequiredForLocalUsers: true
}
```

#### 2. Tenant Level
```javascript
// Tenant MFA settings
{
  mfaEnabled: true,
  mfaGracePeriod: 0,
  mfaMethods: ['totp', 'sms', 'voice'],
  mfaRequiredForLocalUsers: true
}
```

#### 3. User Level
```javascript
// User MFA settings
{
  mfa: {
    enabled: true,
    secret: 'encrypted_totp_secret',
    methods: ['totp'],
    phoneNumber: '+1234567890',
    backupCodes: ['code1', 'code2', '...']
  }
}
```

## Authentication Flow

### Standard Login Flow

```
1. User enters credentials
2. System validates credentials
3. Check tenant access
4. Multiple tenants? → Tenant selection
5. Single tenant → Check MFA requirement
6. MFA required? → MFA verification
7. No MFA / MFA passed → Dashboard
```

### OAuth Login Flow

```
1. User clicks OAuth login
2. Redirect to OAuth provider
3. User authorizes application
4. Callback with authorization code
5. Exchange code for access token
6. Fetch user profile
7. Create/update user account
8. Check tenant access
9. MFA bypass (configurable) → Dashboard
```

### MFA Verification Flow

```
1. User completes primary authentication
2. System checks MFA requirement
3. MFA required → Redirect to MFA page
4. User selects MFA method
5. System sends challenge (SMS/Voice/Push)
6. User enters verification code
7. System validates code
8. Success → Complete login
9. Failure → Retry or lockout
```

## Security Features

### 1. Session Management

**Session Configuration:**
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 24 hours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### 2. Password Security

**Password Policy:**
- Minimum length: 8 characters
- Complexity requirements: uppercase, lowercase, numbers, symbols
- Password history: Prevent reuse of last 5 passwords
- Expiration: Configurable password age limits

**Implementation:**
```javascript
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  maxAge: 90, // days
  historyCount: 5
};
```

### 3. Account Security

**Account Lockout:**
- Failed attempt threshold: 5 attempts
- Lockout duration: 15 minutes (escalating)
- Automatic unlock after timeout
- Manual unlock by administrators

**Security Monitoring:**
```javascript
// Track login attempts
{
  userId: ObjectId,
  ipAddress: String,
  userAgent: String,
  success: Boolean,
  timestamp: Date,
  mfaUsed: Boolean,
  tenantId: String
}
```

## MFA Setup Process

### 1. TOTP Setup

```javascript
// Generate TOTP secret
const speakeasy = require('speakeasy');
const secret = speakeasy.generateSecret({
  name: `${organizationName} (${userEmail})`,
  issuer: organizationName
});

// Generate QR code
const QRCode = require('qrcode');
const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
```

### 2. Phone Number Verification

```javascript
// Send verification code
const verificationCode = Math.floor(100000 + Math.random() * 900000);
await smsService.send(phoneNumber, `Your verification code: ${verificationCode}`);

// Store temporarily for verification
await redis.setex(`phone_verification_${userId}`, 300, verificationCode);
```

### 3. Backup Codes Generation

```javascript
// Generate backup codes
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};
```

## MFA Enforcement Policies

### 1. Grace Period

Users can have a grace period before MFA becomes mandatory:

```javascript
const checkMfaGracePeriod = (user, tenant) => {
  const gracePeriod = tenant.mfaGracePeriod || 0;
  const userCreated = new Date(user.createdAt);
  const graceExpiry = new Date(userCreated.getTime() + gracePeriod * 24 * 60 * 60 * 1000);
  
  return new Date() <= graceExpiry;
};
```

### 2. Conditional MFA

MFA requirements can be conditional based on:
- User type (local vs OAuth)
- Tenant settings
- Organization policies
- User role/permissions
- Access location/IP
- Device recognition

### 3. MFA Bypass Scenarios

```javascript
const shouldBypassMfa = (user, tenant, context) => {
  // OAuth users bypass MFA (configurable)
  if (user.isOAuthUser && tenant.settings.oauthBypassMfa) {
    return true;
  }
  
  // Trusted devices (if enabled)
  if (context.trustedDevice && tenant.settings.allowTrustedDevices) {
    return true;
  }
  
  // Emergency access codes
  if (context.emergencyAccess && user.hasEmergencyAccess) {
    return true;
  }
  
  return false;
};
```

## Security Best Practices

### 1. Implementation Guidelines

- **Secret Storage**: Encrypt MFA secrets at rest
- **Code Transmission**: Use secure channels (HTTPS/TLS)
- **Rate Limiting**: Implement attempt limits and delays
- **Audit Logging**: Log all authentication events
- **Backup Methods**: Provide recovery mechanisms

### 2. Recovery Procedures

**Account Recovery Options:**
1. **Backup Codes**: Pre-generated one-time codes
2. **Admin Reset**: Administrator-initiated MFA reset
3. **Identity Verification**: Out-of-band identity confirmation
4. **Emergency Access**: Special emergency access codes

### 3. Monitoring and Alerting

**Security Events to Monitor:**
- Multiple failed MFA attempts
- MFA method changes
- Unusual login patterns
- Account lockouts
- Emergency access usage

## Troubleshooting

### Common Issues

#### 1. TOTP Code Not Working

**Possible Causes:**
- Time synchronization issues
- Wrong secret configuration
- App not properly configured

**Solutions:**
- Check server time synchronization
- Regenerate TOTP secret
- Verify QR code generation
- Allow time skew tolerance

#### 2. SMS/Voice Not Delivered

**Possible Causes:**
- Invalid phone number format
- Service provider issues
- Rate limiting

**Solutions:**
- Validate phone number format
- Check service provider status
- Implement retry mechanisms
- Provide alternative methods

#### 3. OAuth MFA Conflicts

**Possible Causes:**
- Conflicting MFA requirements
- OAuth profile synchronization issues

**Solutions:**
- Configure OAuth MFA bypass
- Sync user profiles properly
- Clear conflicting settings

### Debug Mode

Enable MFA debugging:

```javascript
// Enable MFA debug logging
process.env.DEBUG_MFA = 'true';

// Log MFA events
const mfaLogger = require('./utils/mfaLogger');
mfaLogger.logMfaEvent(userId, 'totp_verification', { success: true });
```

## API Reference

### MFA Setup Endpoints

```javascript
// Initialize MFA setup
POST /api/mfa/setup/init
{
  method: 'totp' | 'sms' | 'voice'
}

// Complete MFA setup
POST /api/mfa/setup/complete
{
  method: 'totp',
  code: '123456',
  secret: 'base32_secret' // for TOTP
}

// Generate backup codes
POST /api/mfa/backup-codes/generate

// Verify MFA code
POST /api/mfa/verify
{
  code: '123456',
  method: 'totp'
}
```

### MFA Management Endpoints

```javascript
// Get MFA status
GET /api/mfa/status

// Disable MFA
POST /api/mfa/disable
{
  password: 'current_password'
}

// Reset MFA (admin only)
POST /api/admin/mfa/reset/:userId
```

## Configuration Examples

### Development Configuration

```javascript
// .env
MFA_ENABLED=true
MFA_GRACE_PERIOD=7
MFA_METHODS=totp,sms
TOTP_ISSUER=MyApp Development
SMS_PROVIDER=test
```

### Production Configuration

```javascript
// .env
MFA_ENABLED=true
MFA_GRACE_PERIOD=0
MFA_METHODS=totp,sms,voice,authy
TOTP_ISSUER=MyApp Production
SMS_PROVIDER=twilio
AUTHY_API_KEY=prod_authy_key
```

---

This authentication and MFA system provides enterprise-grade security while maintaining usability and flexibility for different organizational needs.