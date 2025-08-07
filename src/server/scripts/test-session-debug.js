const axios = require('axios');

// Test session debugging
async function testSessionDebug() {
  try {
    console.log('🧪 Testing Session Debug...\n');

    // Create axios instance with credentials
    const session = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:3000',
    });

    // 1. Test login to get session
    console.log('1. Logging in to get session...');
    const loginResponse = await session.post('/auth/login', {
      username: 'test@example.com',
      password: 'password123',
    });

    console.log('✅ Login successful, status:', loginResponse.status);
    console.log('Response data:', loginResponse.data);
    console.log('Response headers:', loginResponse.headers);
    console.log('Set-Cookie header:', loginResponse.headers['set-cookie']);

    // 2. Test if session is maintained
    console.log('\n2. Testing session maintenance...');
    try {
      const currentUserResponse = await session.get('/auth/current-user');
      console.log(
        '✅ Session maintained - Current user:',
        currentUserResponse.data.user.email
      );
    } catch (error) {
      console.log('❌ Session not maintained - Error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 3. Test with a fresh axios instance to see if cookies are sent
    console.log('\n3. Testing with fresh axios instance...');
    const freshSession = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:3000',
      headers: {
        Cookie: session.defaults.headers.Cookie || '',
      },
    });

    try {
      const freshResponse = await freshSession.get('/auth/current-user');
      console.log(
        '✅ Fresh session works - Current user:',
        freshResponse.data.user.email
      );
    } catch (error) {
      console.log('❌ Fresh session failed - Error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    console.log('\n✅ Session debug completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSessionDebug();
