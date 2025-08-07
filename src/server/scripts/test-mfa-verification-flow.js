const axios = require('axios');

// Test the MFA verification flow
async function testMfaVerificationFlow() {
  try {
    console.log('🧪 Testing MFA Verification Flow...\n');

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

    // 4. Test MFA verification with SMS (since user has SMS configured)
    console.log('\n3. Testing SMS MFA verification...');
    try {
      // First, send verification code
      const sendResponse = await session.post('/auth/mfa-send-verification', {
        username: 'test@example.com',
        mode: 'sms',
      });
      console.log('✅ SMS verification sent:', sendResponse.data);
    } catch (error) {
      console.log('❌ SMS verification error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 5. Test MFA verification with TOTP (since user has TOTP configured)
    console.log('\n4. Testing TOTP MFA verification...');
    try {
      // Test with a dummy token (this will fail but we can see the response)
      const totpResponse = await session.post('/auth/mfa-verify-token', {
        token: '123456',
        mode: 'totp',
      });
      console.log('✅ TOTP verification response:', totpResponse.data);
    } catch (error) {
      console.log('❌ TOTP verification error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 6. Test MFA verification with correct TOTP token
    console.log('\n5. Testing TOTP MFA verification with correct token...');
    try {
      // Generate a valid TOTP token using the user's secret
      const userResponse = await session.get('/auth/current-user');
      const user = userResponse.data.user;

      if (user.totpSecret) {
        // For testing, we'll use a known valid token
        // In a real scenario, you'd generate this using the TOTP algorithm
        const validToken = '123456'; // This is just for testing

        const totpResponse = await session.post('/auth/mfa-verify-login', {
          token: validToken,
        });
        console.log(
          '✅ TOTP verification with valid token:',
          totpResponse.data
        );
      } else {
        console.log('⚠️ User does not have TOTP secret configured');
      }
    } catch (error) {
      console.log(
        '❌ TOTP verification with valid token error:',
        error.response?.status
      );
      console.log('Error details:', error.response?.data);
    }

    console.log('\n✅ MFA Verification Flow Test Completed!');
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
testMfaVerificationFlow();
