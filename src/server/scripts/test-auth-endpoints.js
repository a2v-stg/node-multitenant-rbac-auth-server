const axios = require('axios');

async function testAuthEndpoints() {
  console.log('🧪 Testing auth endpoints...\n');

  try {
    // Test available tenants endpoint
    console.log('1. Testing /auth/available-tenants...');
    try {
      const response = await axios.get(
        'http://localhost:3000/auth/available-tenants'
      );
      console.log('   ✅ Available tenants:', response.data);
    } catch (error) {
      console.log('   ❌ Error:', error.response?.status, error.response?.data);
    }

    // Test current user endpoint
    console.log('\n2. Testing /auth/current-user...');
    try {
      const response = await axios.get(
        'http://localhost:3000/auth/current-user'
      );
      console.log('   ✅ Current user:', response.data);
    } catch (error) {
      console.log('   ❌ Error:', error.response?.status, error.response?.data);
    }

    // Test switch tenant endpoint
    console.log('\n3. Testing /auth/switch-tenant...');
    try {
      const response = await axios.post(
        'http://localhost:3000/auth/switch-tenant',
        {
          tenant: 'default',
        }
      );
      console.log('   ✅ Switch tenant:', response.data);
    } catch (error) {
      console.log('   ❌ Error:', error.response?.status, error.response?.data);
    }

    // Test logout endpoint
    console.log('\n4. Testing /auth/logout...');
    try {
      const response = await axios.get('http://localhost:3000/auth/logout');
      console.log('   ✅ Logout response status:', response.status);
    } catch (error) {
      console.log('   ❌ Error:', error.response?.status, error.response?.data);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthEndpoints();
