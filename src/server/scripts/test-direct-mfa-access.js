const axios = require('axios');

// Test direct access to /mfa
async function testDirectMfaAccess() {
  try {
    console.log('🧪 Testing Direct Access to /mfa...\n');

    // 1. Login to get session
    console.log('1. Logging in to get session...');
    const loginResponse = await axios.post(
      'http://localhost:3000/auth/login',
      {
        username: 'test@example.com',
        password: 'password123',
      },
      {
        maxRedirects: 0,
        validateStatus(status) {
          return status >= 200 && status < 400; // Accept redirects
        },
      }
    );

    console.log('✅ Login successful, status:', loginResponse.status);
    console.log('Redirect URL:', loginResponse.headers.location);

    // 2. Create session for subsequent requests
    const session = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:3000',
    });

    // 3. Check current user status
    console.log('\n2. Checking current user status...');
    try {
      const currentUserResponse = await session.get('/auth/current-user');
      console.log('✅ Current user:', currentUserResponse.data.user.email);
      console.log('MFA Method:', currentUserResponse.data.user.mfaMethod);
      console.log(
        'MFA Setup Completed:',
        currentUserResponse.data.user.mfaSetupCompleted
      );
      console.log(
        'Has MFA Configured:',
        currentUserResponse.data.user.hasMfaConfigured
      );
    } catch (error) {
      console.log('❌ Current user error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 4. Test direct access to /mfa endpoint
    console.log('\n3. Testing direct access to /mfa endpoint...');
    try {
      const mfaResponse = await session.get('/mfa');
      console.log('✅ MFA endpoint accessible');
      console.log('Status:', mfaResponse.status);
    } catch (error) {
      console.log('❌ MFA endpoint error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 5. Test if there's any redirect happening
    console.log('\n4. Testing for redirects...');
    try {
      const mfaResponse = await session.get('/mfa', {
        maxRedirects: 0,
        validateStatus(status) {
          return status >= 200 && status < 400; // Accept redirects
        },
      });
      console.log('✅ MFA endpoint response');
      console.log('Status:', mfaResponse.status);
      if (mfaResponse.headers.location) {
        console.log('Redirect URL:', mfaResponse.headers.location);
      }
    } catch (error) {
      console.log('❌ MFA endpoint redirect error:', error.response?.status);
      if (error.response?.headers?.location) {
        console.log('Redirect URL:', error.response.headers.location);
      }
    }

    console.log('\n✅ Direct MFA Access Test Completed!');
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
testDirectMfaAccess();
