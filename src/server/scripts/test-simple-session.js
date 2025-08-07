const axios = require('axios');

// Simple session test
async function testSimpleSession() {
  try {
    console.log('🧪 Testing Simple Session...\n');

    // Create axios instance with credentials
    const session = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:3000',
    });

    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await session.post('/auth/login', {
      username: 'test@example.com',
      password: 'password123',
    });

    console.log('✅ Login successful, status:', loginResponse.status);
    console.log('Response data:', loginResponse.data);
    console.log('Set-Cookie:', loginResponse.headers['set-cookie']);

    // 2. Test a simple endpoint that should work if session is maintained
    console.log('\n2. Testing simple endpoint...');
    try {
      const testResponse = await session.get('/auth/test-api');
      console.log('✅ Simple endpoint works:', testResponse.data);
    } catch (error) {
      console.log('❌ Simple endpoint failed:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 3. Test current user endpoint
    console.log('\n3. Testing current user endpoint...');
    try {
      const userResponse = await session.get('/auth/current-user');
      console.log('✅ Current user works:', userResponse.data.user?.email);
    } catch (error) {
      console.log('❌ Current user failed:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    console.log('\n✅ Simple session test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSimpleSession();
