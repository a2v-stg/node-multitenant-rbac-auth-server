#!/usr/bin/env node

/**
 * Quick test script for rate limiting
 * Run this to verify rate limiting is working
 */

const axios = require('axios');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function testRateLimit() {
  console.log('🧪 Testing Rate Limiting...');
  console.log(`🔗 Base URL: ${BASE_URL}`);
  console.log('─'.repeat(50));

  try {
    // Test 1: Single request to verify connectivity
    console.log('1️⃣ Testing single request...');
    const response1 = await axios.get(`${BASE_URL}/test/rate-limit`);
    console.log(`   ✅ Status: ${response1.status}`);
    console.log(`   📊 Rate Limit: ${response1.headers['x-ratelimit-remaining']}/${response1.headers['x-ratelimit-limit']}`);

    // Test 2: Check rate limit status
    console.log('\n2️⃣ Checking rate limit status...');
    const response2 = await axios.get(`${BASE_URL}/test/rate-limit/status`);
    console.log(`   ✅ Status: ${response2.status}`);
    console.log('   📊 Data:', response2.data);

    // Test 3: Make multiple requests to trigger rate limiting
    console.log('\n3️⃣ Testing rate limiting with multiple requests...');
    console.log('   Making 150 requests to trigger rate limiting...');

    let rateLimitHit = false;
    let successfulRequests = 0;
    let rateLimitedRequests = 0;

    for (let i = 0; i < 150; i++) {
      try {
        const response = await axios.get(`${BASE_URL}/test/rate-limit`, {
          timeout: 5000,
          validateStatus: () => true
        });

        if (response.status === 200) {
          successfulRequests++;
        } else if (response.status === 429) {
          rateLimitedRequests++;
          if (!rateLimitHit) {
            rateLimitHit = true;
            console.log(`   🚫 Rate limit hit at request ${i + 1}`);
            console.log('   📊 Rate limit info:', {
              remaining: response.headers['x-ratelimit-remaining'],
              limit: response.headers['x-ratelimit-limit'],
              reset: response.headers['x-ratelimit-reset']
            });
          }
        }

        // Add small delay to avoid overwhelming the server
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Show progress
        if (i % 25 === 0) {
          process.stdout.write(`   Progress: ${i + 1}/150\r`);
        }

      } catch (error) {
        console.log(`   ❌ Error at request ${i + 1}:`, error.message);
      }
    }

    console.log('\n📊 Test Results:');
    console.log('   Total Requests: 150');
    console.log(`   Successful (200): ${successfulRequests}`);
    console.log(`   Rate Limited (429): ${rateLimitedRequests}`);
    console.log(`   Other Status Codes: ${150 - successfulRequests - rateLimitedRequests}`);

    if (rateLimitHit) {
      console.log('\n✅ Rate limiting is working correctly!');
      console.log('   Your application is now protected against DoS attacks.');
    } else {
      console.log('\n⚠️  Rate limiting may not be configured or limits are too high.');
      console.log('   Check your configuration and middleware setup.');
    }

    // Test 4: Test authentication endpoint rate limiting
    console.log('\n4️⃣ Testing authentication endpoint rate limiting...');
    console.log('   Making 10 requests to auth endpoint...');

    let authRateLimitHit = false;
    for (let i = 0; i < 10; i++) {
      try {
        const response = await axios.post(`${BASE_URL}/test/auth-test`, {}, {
          timeout: 5000,
          validateStatus: () => true
        });

        if (response.status === 429) {
          authRateLimitHit = true;
          console.log(`   🚫 Auth rate limit hit at request ${i + 1}`);
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        // Ignore errors for this test
      }
    }

    if (authRateLimitHit) {
      console.log('   ✅ Authentication rate limiting is working!');
    } else {
      console.log('   ⚠️  Authentication rate limiting may need configuration.');
    }

    console.log('\n🎉 Rate limiting test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n💡 Make sure your server is running and accessible at:', BASE_URL);
    console.log('   You can start it with: npm run dev:server');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testRateLimit();
}

module.exports = { testRateLimit };
