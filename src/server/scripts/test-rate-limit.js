#!/usr/bin/env node

/**
 * Test script for rate limiting functionality
 * Run this script to test various rate limiting scenarios
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_ENDPOINTS = [
  '/test/rate-limit',
  '/auth/login',
  '/api/users',
  '/api/rbac',
  '/mfa/setup'
];

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Single Request Test',
    description: 'Make a single request to verify basic functionality',
    requests: 1,
    delay: 0
  },
  {
    name: 'Rate Limit Test',
    description: 'Make multiple requests to trigger rate limiting',
    requests: 150, // Should trigger rate limiting
    delay: 100 // 100ms between requests
  },
  {
    name: 'Authentication Rate Limit Test',
    description: 'Test authentication endpoint rate limiting',
    requests: 10, // Should trigger auth rate limiting
    delay: 200
  },
  {
    name: 'API Rate Limit Test',
    description: 'Test API endpoint rate limiting',
    requests: 60, // Should trigger API rate limiting
    delay: 150
  }
];

/**
 * Make a single request and return the response
 */
async function makeRequest(endpoint) {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      timeout: 5000,
      validateStatus: () => true // Accept all status codes
    });
    
    return {
      status: response.status,
      headers: response.headers,
      data: response.data,
      rateLimitRemaining: response.headers['x-ratelimit-remaining'],
      rateLimitLimit: response.headers['x-ratelimit-limit'],
      rateLimitReset: response.headers['x-ratelimit-reset']
    };
  } catch (error) {
    return {
      error: error.message,
      status: error.response?.status || 'ERROR',
      data: error.response?.data || null
    };
  }
}

/**
 * Run a test scenario
 */
async function runTestScenario(scenario, endpoint) {
  console.log(`\n🧪 Running: ${scenario.name}`);
  console.log(`📝 Description: ${scenario.description}`);
  console.log(`🔗 Endpoint: ${endpoint}`);
  console.log(`📊 Requests: ${scenario.requests}`);
  console.log(`⏱️  Delay: ${scenario.delay}ms`);
  console.log('─'.repeat(60));
  
  const results = [];
  let rateLimitHit = false;
  let rateLimitCount = 0;
  
  for (let i = 0; i < scenario.requests; i++) {
    const result = await makeRequest(endpoint);
    results.push(result);
    
    // Check if rate limit was hit
    if (result.status === 429) {
      rateLimitHit = true;
      rateLimitCount++;
      
      if (rateLimitCount === 1) {
        console.log(`🚫 Rate limit hit at request ${i + 1}`);
        console.log(`📊 Rate limit info:`, {
          remaining: result.rateLimitRemaining,
          limit: result.rateLimitLimit,
          reset: result.rateLimitReset
        });
      }
    }
    
    // Add delay between requests
    if (scenario.delay > 0 && i < scenario.requests - 1) {
      await new Promise(resolve => setTimeout(resolve, scenario.delay));
    }
    
    // Show progress for long tests
    if (scenario.requests > 10 && (i + 1) % 10 === 0) {
      process.stdout.write(`   Progress: ${i + 1}/${scenario.requests}\r`);
    }
  }
  
  // Summary
  console.log(`\n📊 Results Summary:`);
  console.log(`   Total Requests: ${results.length}`);
  console.log(`   Successful (2xx): ${results.filter(r => r.status >= 200 && r.status < 300).length}`);
  console.log(`   Rate Limited (429): ${rateLimitCount}`);
  console.log(`   Other Errors: ${results.filter(r => r.status >= 400 && r.status !== 429).length}`);
  
  if (rateLimitHit) {
    console.log(`✅ Rate limiting is working correctly!`);
  } else {
    console.log(`⚠️  Rate limiting may not be configured or limits are too high`);
  }
  
  return results;
}

/**
 * Test rate limit headers
 */
async function testRateLimitHeaders() {
  console.log('\n🔍 Testing Rate Limit Headers');
  console.log('─'.repeat(40));
  
  const response = await makeRequest('/test/rate-limit');
  
  if (response.status === 200) {
    console.log('📋 Response Headers:');
    console.log(`   X-RateLimit-Remaining: ${response.rateLimitRemaining || 'Not set'}`);
    console.log(`   X-RateLimit-Limit: ${response.rateLimitLimit || 'Not set'}`);
    console.log(`   X-RateLimit-Reset: ${response.rateLimitReset || 'Not set'}`);
    
    if (response.rateLimitRemaining && response.rateLimitLimit) {
      console.log('✅ Rate limit headers are present');
    } else {
      console.log('⚠️  Rate limit headers are missing');
    }
  } else {
    console.log(`❌ Failed to get response: ${response.status}`);
  }
}

/**
 * Test different endpoints
 */
async function testEndpoints() {
  console.log('\n🌐 Testing Different Endpoints');
  console.log('─'.repeat(40));
  
  for (const endpoint of TEST_ENDPOINTS) {
    try {
      const response = await makeRequest(endpoint);
      console.log(`${endpoint}: ${response.status} ${response.status === 429 ? '🚫' : '✅'}`);
    } catch (error) {
      console.log(`${endpoint}: ERROR - ${error.message}`);
    }
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Rate Limiting Test Suite');
  console.log('='.repeat(60));
  console.log(`🔗 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  try {
    // Test basic connectivity
    console.log('\n🔌 Testing Basic Connectivity...');
    const connectivityTest = await makeRequest('/test/rate-limit');
    
    if (connectivityTest.status === 200) {
      console.log('✅ Server is accessible');
    } else {
      console.log('❌ Server is not accessible or test endpoint not available');
      console.log('   Make sure your server is running and has the test endpoints');
      return;
    }
    
    // Test rate limit headers
    await testRateLimitHeaders();
    
    // Test different endpoints
    await testEndpoints();
    
    // Run test scenarios
    for (const scenario of TEST_SCENARIOS) {
      for (const endpoint of TEST_ENDPOINTS.slice(0, 2)) { // Test first 2 endpoints
        await runTestScenario(scenario, endpoint);
        
        // Wait between scenarios to avoid overwhelming the server
        if (scenario.requests > 50) {
          console.log('⏳ Waiting 5 seconds before next scenario...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

/**
 * Command line interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Rate Limiting Test Suite

Usage: node test-rate-limit.js [options]

Options:
  --base-url <url>    Base URL to test (default: http://localhost:3000)
  --endpoint <path>   Test specific endpoint only
  --scenario <name>   Run specific scenario only
  --help, -h          Show this help message

Examples:
  node test-rate-limit.js
  node test-rate-limit.js --base-url http://localhost:3001
  node test-rate-limit.js --endpoint /auth/login
  node test-rate-limit.js --scenario "Rate Limit Test"
    `);
    process.exit(0);
  }
  
  // Parse command line arguments
  const baseUrlIndex = args.indexOf('--base-url');
  if (baseUrlIndex !== -1 && args[baseUrlIndex + 1]) {
    process.env.TEST_BASE_URL = args[baseUrlIndex + 1];
  }
  
  // Run tests
  runTests();
}

module.exports = {
  runTests,
  makeRequest,
  runTestScenario
}; 