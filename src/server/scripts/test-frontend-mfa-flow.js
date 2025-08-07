const axios = require('axios');

// Test the frontend MFA setup flow
async function testFrontendMfaFlow() {
  try {
    console.log('🧪 Testing Frontend MFA Setup Flow...\n');

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
    } catch (error) {
      console.log('❌ Current user error:', error.response?.status);
    }

    // 4. Test TOTP setup generation
    console.log('\n3. Testing TOTP setup generation...');
    try {
      const totpSetupResponse = await session.post('/auth/mfa-setup-totp');
      console.log('✅ TOTP setup generated');
      console.log('Secret:', totpSetupResponse.data.secret);
      console.log(
        'QR Code:',
        totpSetupResponse.data.qrCode ? 'Generated' : 'Not generated'
      );
    } catch (error) {
      console.log('❌ TOTP setup error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 5. Test TOTP verification (with a dummy token)
    console.log('\n4. Testing TOTP verification...');
    try {
      const totpVerifyResponse = await session.post(
        '/auth/mfa-verify-totp-setup',
        {
          secret: 'TEST_SECRET_123456789',
          token: '123456',
        }
      );
      console.log('✅ TOTP verification response:', totpVerifyResponse.data);
    } catch (error) {
      console.log('❌ TOTP verification error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 6. Test SMS MFA setup
    console.log('\n5. Testing SMS MFA setup...');
    try {
      const smsSetupResponse = await session.post('/auth/mfa/setup', {
        method: 'sms',
        phoneNumber: '+1234567890',
        countryCode: '+1',
      });
      console.log('✅ SMS MFA setup response:', smsSetupResponse.data);
    } catch (error) {
      console.log('❌ SMS MFA setup error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 7. Check user status after setup
    console.log('\n6. Checking user status after setup...');
    try {
      const updatedUserResponse = await session.get('/auth/current-user');
      console.log('✅ Updated user:', updatedUserResponse.data.user.email);
      console.log('MFA Method:', updatedUserResponse.data.user.mfaMethod);
      console.log(
        'MFA Setup Completed:',
        updatedUserResponse.data.user.mfaSetupCompleted
      );
      console.log(
        'TOTP Secret:',
        updatedUserResponse.data.user.totpSecret ? 'Set' : 'Not set'
      );
      console.log(
        'Phone Number:',
        updatedUserResponse.data.user.phoneNumber || 'Not set'
      );
    } catch (error) {
      console.log('❌ Updated user error:', error.response?.status);
    }

    console.log('\n✅ Frontend MFA Flow Test Completed!');
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
testFrontendMfaFlow();
