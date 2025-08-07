const mongoose = require('mongoose');
const User = require('../models/User');
const authService = require('../services/authService');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-ui',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function testSimpleLogin() {
  try {
    console.log('🧪 Testing Simple Login...\n');

    // 1. Get or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        email: 'test@example.com',
        name: 'Test User',
        oauthProvider: 'local',
        isActive: true,
      });
      await testUser.save();
      console.log('✅ Test user created:', testUser.email);
    } else {
      console.log('✅ Test user found:', testUser.email);
    }

    // 2. Test authService.handleUserLogin
    console.log('\n2. Testing authService.handleUserLogin...');
    try {
      const result = await authService.handleUserLogin(testUser);
      console.log('✅ Login result:');
      console.log('  - Type:', result.type);
      console.log('  - Redirect URL:', result.redirectUrl);

      if (result.tenant) {
        console.log('  - Selected tenant:', result.tenant.tenantName);
        console.log('  - Tenant ID:', result.tenant.tenantId);
      }

      if (result.tenants) {
        console.log(
          '  - Available tenants:',
          result.tenants.map(t => t.tenantName)
        );
      }
    } catch (error) {
      console.log('❌ Login error:', error.message);
      console.log('Error stack:', error.stack);
    }

    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testSimpleLogin();
