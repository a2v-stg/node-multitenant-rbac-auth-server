const requiredEnvVars = [
  'MONGODB_URI',
  'SESSION_SECRET',
  'OAUTH_CLIENT_ID',
  'OAUTH_CLIENT_SECRET',
  'OAUTH_AUTH_URL',
  'OAUTH_TOKEN_URL',
  'OAUTH_CALLBACK_URL',
  'OAUTH_USERINFO_URL'
];

function validateEnvironment() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  // Validate MongoDB URI format
  if (
    !process.env.MONGODB_URI.startsWith('mongodb://') &&
    !process.env.MONGODB_URI.startsWith('mongodb+srv://')
  ) {
    throw new Error('Invalid MONGODB_URI format');
  }
}

module.exports = { validateEnvironment };
