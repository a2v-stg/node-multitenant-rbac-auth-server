// Helper function to generate redirect URLs
function getRedirectUrl(path) {
  // Get base URL from environment or default to localhost:3000
  const baseUrl = process.env.CLIENT_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  // Check if this is an API request
  if (
    req.path.startsWith('/api/') ||
    req.headers.accept?.includes('application/json')
  ) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // For page requests, redirect to Vue app login
  res.redirect(getRedirectUrl('/login'));
}

function ensureAuthenticatedAndTenant(req, res, next) {
  if (!req.isAuthenticated()) {
    // Check if this is an API request
    if (
      req.path.startsWith('/api/') ||
      req.headers.accept?.includes('application/json')
    ) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    console.log('redirecting to login');
    // For page requests, redirect to Vue app login
    return res.redirect(getRedirectUrl('/login'));
  }

  if (!req.session.tenantId) {
    // Check if this is an API request
    if (
      req.path.startsWith('/api/') ||
      req.headers.accept?.includes('application/json')
    ) {
      return res.status(401).json({ error: 'No tenant selected' });
    }

    // For page requests, redirect to Vue app login
    return res.redirect(getRedirectUrl('/login'));
  }

  next();
}

module.exports = {
  ensureAuthenticated,
  ensureAuthenticatedAndTenant
};
