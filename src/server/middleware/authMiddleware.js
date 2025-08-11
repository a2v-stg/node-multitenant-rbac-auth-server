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
  res.redirect('http://localhost:3001/login');
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
    return res.redirect('http://localhost:3001/login');
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
    return res.redirect('http://localhost:3001/login');
  }

  next();
}

module.exports = {
  ensureAuthenticated,
  ensureAuthenticatedAndTenant
};
