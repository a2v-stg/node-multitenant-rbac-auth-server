const mongoose = require('mongoose');
const User = require('../models/User');
const authService = require('../services/authService');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

async function testLocalLogin() {
  try {
    console.log('🧪 Testing local login flow...\n');

    // Get the local user
    const user = await User.findOne({ email: 'local@email.com' });
    if (!user) {
      console.log('❌ Local user not found');
      return;
    }

    console.log(`👤 User: ${user.email}`);
    console.log(`   - Has Password: ${!!user.password}`);
    console.log(
      `   - Password Length: ${user.password ? user.password.length : 0}`
    );
    console.log(`   - OAuth Provider: ${user.oauthProvider || 'None'}`);

    // Test the handleUserLogin function
    console.log('\n🔍 Testing handleUserLogin for local user...');
    const result = await authService.handleUserLogin(user);

    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.type === 'single') {
      console.log(`✅ Single tenant selected: ${result.tenant.tenantName}`);
      console.log(`   Redirect URL: ${result.redirectUrl}`);
    } else {
      console.log(`📋 Multiple tenants available: ${result.tenants.length}`);
      result.tenants.forEach(tenant => {
        console.log(`   - ${tenant.tenantName}`);
      });
    }

    console.log('\n✅ Local login flow test complete!');
    console.log('🧪 You can now test local login in the browser with:');
    console.log('   - Username: local@email.com');
    console.log('   - Password: password123');
  } catch (error) {
    console.error('❌ Error testing local login flow:', error);
  } finally {
    mongoose.connection.close();
  }
}

testLocalLogin();
