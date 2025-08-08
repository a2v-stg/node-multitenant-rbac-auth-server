#!/usr/bin/env node

console.log('Testing Sample App Setup...');

try {
  // Test that we can require the sample-app server
  console.log('Testing sample-app server...');
  
  const parentAppServer = require('../server/app');
  console.log('✅ Sample app server loaded');
  
  // Test admin-ui imports in sample-app
  console.log('Testing admin-ui imports in sample-app...');
  
  const authService = require('@admin-ui/auth');
  console.log('✅ Auth service imported');
  
  const User = require('@admin-ui/models/User');
  console.log('✅ User model imported');
  
  const authRoutes = require('@admin-ui/routes/auth');
  console.log('✅ Auth routes imported');
  
  console.log('\n🎉 Sample app setup is working correctly!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
} 