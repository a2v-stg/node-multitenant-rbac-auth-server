const axios = require('axios');

// Test the actual login flow with MFA
async function testActualLoginFlow() {
  try {
    console.log('🧪 Testing Actual Login Flow with MFA...\n');

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

    // 2. Follow the redirect to see what happens
    console.log('\n2. Following redirect...');
    const redirectUrl = loginResponse.headers.location;

    if (redirectUrl.includes('/mfa')) {
      console.log('✅ Redirected to MFA verification (correct behavior)');

      // 3. Create session for MFA verification
      const session = axios.create({
        withCredentials: true,
        baseURL: 'http://localhost:3000',
      });

      // 4. Check current user status
      console.log('\n3. Checking current user status...');
      try {
        const currentUserResponse = await session.get('/auth/current-user');
        console.log('✅ Current user:', currentUserResponse.data.user.email);
        console.log('MFA Method:', currentUserResponse.data.user.mfaMethod);
        console.log(
          'MFA Setup Completed:',
          currentUserResponse.data.user.mfaSetupCompleted
        );
      } catch (error) {
        console.log('❌ Current user error:', error.response?.status);
      }

      // 5. Test MFA verification (with a dummy token)
      console.log('\n4. Testing MFA verification...');
      try {
        const mfaVerifyResponse = await session.post('/auth/mfa-verify-login', {
          token: '123456',
        });
        console.log('✅ MFA verification response:', mfaVerifyResponse.data);
      } catch (error) {
        console.log('❌ MFA verification error:', error.response?.status);
        console.log('Error details:', error.response?.data);
      }
    } else if (redirectUrl.includes('/mfa-setup')) {
      console.log(
        '❌ Redirected to MFA setup (incorrect behavior - user should have MFA configured)'
      );
    } else if (redirectUrl.includes('/dashboard')) {
      console.log(
        '✅ Redirected to dashboard (MFA not required or already verified)'
      );
    } else {
      console.log('❓ Redirected to:', redirectUrl);
    }

    console.log('\n✅ Actual Login Flow Test Completed!');
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
testActualLoginFlow();
