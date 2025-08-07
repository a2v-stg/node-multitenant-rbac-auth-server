const axios = require('axios');

// Test session flow
async function testSessionFlow() {
  try {
    console.log('🧪 Testing Session Flow...\n');

    // Create a session that persists across requests
    const session = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:3000',
    });

    // 1. Test login and session
    console.log('1. Testing login and session...');
    try {
      const loginResponse = await session.post(
        '/auth/login',
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

      console.log('✅ Login response status:', loginResponse.status);
      if (loginResponse.headers.location) {
        console.log('✅ Login redirect to:', loginResponse.headers.location);
      }

      // 2. Test current user endpoint
      console.log('\n2. Testing current user endpoint...');
      try {
        const currentUserResponse = await session.get('/auth/current-user');
        console.log(
          '✅ Current user response status:',
          currentUserResponse.status
        );
        console.log('✅ Current user:', currentUserResponse.data.user.email);
        console.log(
          '✅ Session tenantId:',
          currentUserResponse.data.tenant?.tenantId
        );
      } catch (error) {
        console.log(
          '❌ Current user error:',
          error.response?.status,
          error.response?.data
        );
      }

      // 3. Test available tenants
      console.log('\n3. Testing available tenants...');
      try {
        const tenantsResponse = await session.get('/auth/available-tenants');
        console.log(
          '✅ Available tenants response status:',
          tenantsResponse.status
        );
        console.log('✅ Available tenants:', tenantsResponse.data.tenants);
      } catch (error) {
        console.log(
          '❌ Available tenants error:',
          error.response?.status,
          error.response?.data
        );
      }
    } catch (error) {
      console.log(
        '❌ Login error:',
        error.response?.status,
        error.response?.data
      );
    }

    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSessionFlow();
