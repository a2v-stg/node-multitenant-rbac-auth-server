const mongoose = require('mongoose');
const User = require('../models/User');
const TenantsModel = require('../models/Tenant');
const UserTenant = require('../models/UserTenant');
const authService = require('../services/authService');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function testLoginFlow() {
  try {
    console.log('🧪 Testing login flow...\n');

    // Get the user
    const user = await User.findOne({ email: 'risk_reviewer@example.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`👤 User: ${user.email}`);
    console.log(`   - Has Password: ${!!user.password}`);
    console.log(`   - OAuth Provider: ${user.oauthProvider || 'None'}`);

    // Test the handleUserLogin function
    console.log('\n🔍 Testing handleUserLogin...');
    const result = await authService.handleUserLogin(user);

    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.type === 'single') {
      console.log(
        `✅ Single tenant selected: ${result.tenant.tenantName} (${result.tenant.tenantId})`
      );
      console.log(`   Redirect URL: ${result.redirectUrl}`);
    } else {
      console.log(`📋 Multiple tenants available: ${result.tenants.length}`);
      result.tenants.forEach(tenant => {
        console.log(`   - ${tenant.tenantName} (${tenant.tenantId})`);
      });
    }

    console.log('\n✅ Login flow test complete!');
  } catch (error) {
    console.error('❌ Error testing login flow:', error);
  } finally {
    mongoose.connection.close();
  }
}

testLoginFlow();
