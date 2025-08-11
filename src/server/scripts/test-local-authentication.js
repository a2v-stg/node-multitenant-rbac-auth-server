const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

async function testLocalAuthentication() {
  try {
    console.log('🧪 Testing local authentication...\n');

    // Find the local user
    const user = await User.findOne({ email: 'local@email.com' });

    if (!user) {
      console.log('❌ Local user not found');
      return;
    }

    console.log('📋 User details:');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Has password field: ${!!user.password}`);
    console.log(`   - Password hash: ${user.passwordHash || 'None'}`);
    console.log(`   - Salt: ${user.salt || 'None'}`);

    // Test password authentication
    console.log('\n🔍 Testing password authentication...');
    const isPasswordValid = await user.authenticate('password123');
    console.log(
      `   - Password 'password123' valid: ${isPasswordValid ? 'Yes' : 'No'}`
    );

    const isWrongPasswordValid = await user.authenticate('wrongpassword');
    console.log(
      `   - Password 'wrongpassword' valid: ${isWrongPasswordValid ? 'Yes' : 'No'}`
    );

    console.log('\n✅ Local authentication test complete!');
  } catch (error) {
    console.error('❌ Error testing local authentication:', error);
  } finally {
    mongoose.connection.close();
  }
}

testLocalAuthentication();
