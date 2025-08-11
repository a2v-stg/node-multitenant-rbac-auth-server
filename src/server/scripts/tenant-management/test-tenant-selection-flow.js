const axios = require('axios');

// Test the tenant selection flow
async function testTenantSelectionFlow() {
  try {
    console.log('🧪 Testing Tenant Selection Flow...\n');

    // Create axios instance with credentials
    const session = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:3000'
    });

    // 1. Test login to get session
    console.log('1. Logging in to get session...');
    const loginResponse = await session.post('/auth/login', {
      username: 'test@example.com',
      password: 'password123'
    });

    console.log('✅ Login successful, status:', loginResponse.status);
    console.log('Response data:', loginResponse.data);

    // 2. Test accessing tenant selection page
    console.log('\n2. Testing tenant selection page access...');

    try {
      // Try to access the tenant selection page
      const tenantSelectionResponse = await session.get(
        '/auth/available-tenants'
      );
      console.log('✅ Tenant selection API accessible');
      console.log('Available tenants:', tenantSelectionResponse.data.tenants);
    } catch (error) {
      console.log('❌ Tenant selection API error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 3. Test current user endpoint
    console.log('\n3. Testing current user endpoint...');
    try {
      const currentUserResponse = await session.get('/auth/current-user');
      console.log('✅ Current user endpoint accessible');
      console.log('User:', currentUserResponse.data.user.email);
      console.log('Tenant:', currentUserResponse.data.tenant?.tenantName);
    } catch (error) {
      console.log('❌ Current user endpoint error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    // 4. Test tenant selection
    console.log('\n4. Testing tenant selection...');
    try {
      const selectResponse = await session.post(
        '/auth/select-tenant',
        {
          tenantId: 'default'
        },
        {
          maxRedirects: 0,
          validateStatus(status) {
            return status >= 200 && status < 400; // Accept redirects
          }
        }
      );

      console.log('✅ Tenant selection successful');
      console.log('Redirect URL:', selectResponse.headers.location);
    } catch (error) {
      console.log('❌ Tenant selection error:', error.response?.status);
      console.log('Error details:', error.response?.data);
    }

    console.log('\n✅ All tests completed!');
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
testTenantSelectionFlow();
