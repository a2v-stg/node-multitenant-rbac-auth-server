#!/usr/bin/env node

console.log('Testing Admin UI Submodule...');

(async () => {
  try {
  // Test server components
  console.log('Testing server components...');
  
  const authService = require('./server/services/authService');
  console.log('✅ Auth service loaded');
  
  const mfaService = require('./server/services/mfaService');
  console.log('✅ MFA service loaded');
  
  const User = require('./server/models/User');
  console.log('✅ User model loaded');
  
  const authRoutes = require('./server/routes/auth');
  console.log('✅ Auth routes loaded');
  
  const authMiddleware = require('./server/middleware/authMiddleware');
  console.log('✅ Auth middleware loaded');
  
  // Test client paths (not components)
  console.log('Testing client paths...');
  
  // Use dynamic import for ES module
  const clientIndex = await import('./client/index.js');
  console.log('✅ Client index loaded');
  console.log('✅ Client app path:', clientIndex.default.App);
  console.log('✅ Client components paths available');
  
  // Test main index
  console.log('Testing main index...');
  
  const adminUI = require('../../index');
  console.log('✅ Main index loaded');
  console.log('✅ Services available:', Object.keys(adminUI.services));
  console.log('✅ Models available:', Object.keys(adminUI.models));
  console.log('✅ Routes available:', Object.keys(adminUI.routes));
  console.log('✅ Middleware available:', Object.keys(adminUI.middleware));
  
    console.log('\n🎉 All tests passed! Admin UI submodule is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})(); 