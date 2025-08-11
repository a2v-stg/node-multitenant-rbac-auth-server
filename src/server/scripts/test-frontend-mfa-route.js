const axios = require('axios');

// Test accessing the /mfa route directly
async function testFrontendMfaRoute() {
  try {
    console.log('🧪 Testing Frontend /mfa Route Access...\n');

    // 1. Login to get session
    console.log('1. Logging in to get session...');
    const loginResponse = await axios.post(
      'http://localhost:3000/auth/login',
      {
        username: 'test@example.com',
        password: 'password123'
      },
      {
        maxRedirects: 0,
        validateStatus(status) {
          return status >= 200 && status < 400; // Accept redirects
        }
      }
    );

    console.log('✅ Login successful, status:', loginResponse.status);
    console.log('Redirect URL:', loginResponse.headers.location);

    // 2. Create session for subsequent requests
    const session = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:3000'
    });

    // 3. Test accessing /mfa route directly
    console.log('\n2. Testing direct access to /mfa route...');
    try {
      const mfaRouteResponse = await session.get('/mfa');
      console.log('✅ /mfa route accessible');
      console.log('Status:', mfaRouteResponse.status);
      console.log('Content-Type:', mfaRouteResponse.headers['content-type']);
    } catch (error) {
      console.log('❌ /mfa route error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 4. Test if there's any redirect happening from /mfa
    console.log('\n3. Testing for redirects from /mfa...');
    try {
      const mfaRouteResponse = await session.get('/mfa', {
        maxRedirects: 0,
        validateStatus(status) {
          return status >= 200 && status < 400; // Accept redirects
        }
      });
      console.log('✅ /mfa route response');
      console.log('Status:', mfaRouteResponse.status);
      if (mfaRouteResponse.headers.location) {
        console.log('Redirect URL:', mfaRouteResponse.headers.location);
      }
    } catch (error) {
      console.log('❌ /mfa route redirect error:', error.response?.status);
      if (error.response?.headers?.location) {
        console.log('Redirect URL:', error.response.headers.location);
      }
    }

    // 5. Test if the frontend is serving the MFA page
    console.log('\n4. Testing frontend MFA page...');
    try {
      const frontendResponse = await session.get('http://localhost:3001/mfa');
      console.log('✅ Frontend MFA page accessible');
      console.log('Status:', frontendResponse.status);
    } catch (error) {
      console.log('❌ Frontend MFA page error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    console.log('\n✅ Frontend MFA Route Test Completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log('💡 Make sure you are logged in and have proper permissions');
    }

    if (error.response?.status === 400) {
      console.log('💡 Check the request data format and required fields');
    }
  }
}

// Run the test
testFrontendMfaRoute();
