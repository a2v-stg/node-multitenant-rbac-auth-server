const axios = require('axios');

// Test tenant selection page access
async function testTenantSelectionAccess() {
  try {
    console.log('🧪 Testing Tenant Selection Page Access...\n');

    // 1. Test without authentication
    console.log('1. Testing without authentication...');
    try {
      const response = await axios.get(
        'http://localhost:3001/tenant-selection',
        {
          withCredentials: true,
          maxRedirects: 0,
          validateStatus(status) {
            return status >= 200 && status < 400; // Accept redirects
          }
        }
      );
      console.log('✅ Response status:', response.status);
      console.log('✅ Response URL:', response.config.url);
    } catch (error) {
      if (error.response) {
        console.log('❌ Response status:', error.response.status);
        console.log('❌ Response URL:', error.response.config.url);
        if (error.response.headers.location) {
          console.log('❌ Redirect to:', error.response.headers.location);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }

    // 2. Test with authentication but no tenant
    console.log('\n2. Testing with authentication but no tenant...');
    try {
      // First login
      const loginResponse = await axios.post(
        'http://localhost:3000/auth/login',
        {
          username: 'test@example.com',
          password: 'password123'
        },
        {
          withCredentials: true,
          maxRedirects: 0,
          validateStatus(status) {
            return status >= 200 && status < 400; // Accept redirects
          }
        }
      );

      console.log('✅ Login response status:', loginResponse.status);
      if (loginResponse.headers.location) {
        console.log('✅ Login redirect to:', loginResponse.headers.location);
      }

      // Now try to access tenant selection
      const tenantSelectionResponse = await axios.get(
        'http://localhost:3001/tenant-selection',
        {
          withCredentials: true,
          maxRedirects: 0,
          validateStatus(status) {
            return status >= 200 && status < 400; // Accept redirects
          }
        }
      );

      console.log(
        '✅ Tenant selection response status:',
        tenantSelectionResponse.status
      );
      console.log(
        '✅ Tenant selection URL:',
        tenantSelectionResponse.config.url
      );
    } catch (error) {
      if (error.response) {
        console.log('❌ Response status:', error.response.status);
        console.log('❌ Response URL:', error.response.config.url);
        if (error.response.headers.location) {
          console.log('❌ Redirect to:', error.response.headers.location);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }

    // 3. Test available-tenants API
    console.log('\n3. Testing available-tenants API...');
    try {
      const tenantsResponse = await axios.get(
        'http://localhost:3000/auth/available-tenants',
        {
          withCredentials: true
        }
      );

      console.log(
        '✅ Available tenants response status:',
        tenantsResponse.status
      );
      console.log('✅ Available tenants:', tenantsResponse.data.tenants);
    } catch (error) {
      if (error.response) {
        console.log(
          '❌ Available tenants error status:',
          error.response.status
        );
        console.log('❌ Available tenants error:', error.response.data);
      } else {
        console.log('❌ Network error:', error.message);
      }
    }

    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTenantSelectionAccess();
