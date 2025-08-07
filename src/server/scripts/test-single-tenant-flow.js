const axios = require('axios');

// Test the single tenant flow
async function testSingleTenantFlow() {
  try {
    console.log('🧪 Testing Single Tenant Flow...\n');

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

    // 4. Get available tenants
    console.log('\n3. Getting available tenants...');
    try {
      const tenantsResponse = await session.get('/auth/available-tenants');
      console.log('✅ Available tenants:', tenantsResponse.data.tenants);

      if (tenantsResponse.data.tenants.length === 1) {
        console.log('🔍 Single tenant detected, testing auto-selection...');
      } else {
        console.log('🔍 Multiple tenants detected');
      }
    } catch (error) {
      console.log('❌ Available tenants error:', error.response?.status);
    }

    // 5. Test tenant selection for single tenant
    console.log('\n4. Testing tenant selection...');
    try {
      const selectResponse = await session.post(
        '/auth/select-tenant',
        {
          tenantId: 'default',
        },
        {
          maxRedirects: 0,
          validateStatus(status) {
            return status >= 200 && status < 400; // Accept redirects
          },
        }
      );

      console.log('✅ Tenant selection successful');
      console.log('Status:', selectResponse.status);
      console.log('Redirect URL:', selectResponse.headers.location);

      // Check what the redirect URL contains
      if (selectResponse.headers.location) {
        if (selectResponse.headers.location.includes('/mfa-setup')) {
          console.log('🔍 Redirected to MFA setup (user needs to setup MFA)');
        } else if (selectResponse.headers.location.includes('/mfa')) {
          console.log(
            '🔍 Redirected to MFA verification (user has MFA configured)'
          );
        } else if (selectResponse.headers.location.includes('/dashboard')) {
          console.log('🔍 Redirected to dashboard (MFA not required)');
        } else {
          console.log('🔍 Redirected to:', selectResponse.headers.location);
        }
      }
    } catch (error) {
      console.log('❌ Tenant selection error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    console.log('\n✅ Single Tenant Flow Test Completed!');
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
testSingleTenantFlow();
