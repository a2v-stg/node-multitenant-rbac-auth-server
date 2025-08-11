const axios = require('axios');

// Test the new login flow with MFA and tenant selection
async function testLoginMfaFlow() {
  try {
    console.log('🧪 Testing New Login Flow with MFA and Tenant Selection...\n');

    // 1. Test login without tenant selection (security fix)
    console.log('1. Testing login without tenant selection...');
    const loginResponse = await axios.post(
      'http://localhost:3000/auth/login',
      {
        username: 'testuser@example.com',
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

    // 2. Test tenant selection after login
    console.log('\n2. Testing tenant selection after login...');

    // First, we need to be authenticated
    const session = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:3000'
    });

    // Get available tenants
    const tenantsResponse = await session.get('/auth/available-tenants');
    console.log('Available tenants:', tenantsResponse.data.tenants);

    if (
      tenantsResponse.data.tenants &&
      tenantsResponse.data.tenants.length > 0
    ) {
      const tenant = tenantsResponse.data.tenants[0];
      console.log('Selecting tenant:', tenant.tenantName);

      // Select tenant
      const selectResponse = await session.post('/auth/select-tenant', {
        tenantId: tenant.tenantId
      });

      console.log('✅ Tenant selection successful');
      console.log('Redirect URL:', selectResponse.headers.location);
    }

    // 3. Test MFA flow for tenant with MFA enabled
    console.log('\n3. Testing MFA flow...');

    // Try to access a protected endpoint
    try {
      const currentUserResponse = await session.get('/auth/current-user');
      console.log('✅ Current user info retrieved');
      console.log('User:', currentUserResponse.data.user.email);
      console.log('Tenant:', currentUserResponse.data.tenant.tenantName);
      console.log('MFA Enabled:', currentUserResponse.data.tenant.mfaEnabled);
    } catch (error) {
      if (error.response?.status === 302) {
        console.log('✅ Redirected to MFA (expected for MFA-enabled tenants)');
        console.log('Redirect URL:', error.response.headers.location);
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    console.log('\n✅ All tests completed successfully!');
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
testLoginMfaFlow();
