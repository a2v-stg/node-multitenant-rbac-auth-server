const axios = require('axios');

async function testAuthEndpoint() {
  try {
    console.log('🧪 Testing auth endpoint...\n');

    const loginData = {
      username: 'local@email.com',
      password: 'password123',
    };

    console.log('📤 Sending request to /auth/login');
    console.log('Data:', loginData);

    const response = await axios.post(
      'http://localhost:3000/auth/login',
      loginData,
      {
        maxRedirects: 0,
        validateStatus(status) {
          return status >= 200 && status < 400; // Accept redirects
        },
      }
    );

    console.log('\n📥 Response:');
    console.log(`Status: ${response.status}`);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
  } catch (error) {
    console.log('\n❌ Error:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

testAuthEndpoint();
