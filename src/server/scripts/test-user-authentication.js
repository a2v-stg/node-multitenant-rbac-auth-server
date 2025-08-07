const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function testUserAuthentication() {
  try {
    console.log('🧪 Testing user authentication directly...\n');

    // Find the user
    const user = await User.findOne({ email: 'local@email.com' });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('📋 User details:');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Has password: ${!!user.password}`);
    console.log(`   - Password hash: ${user.passwordHash || 'None'}`);
    console.log(`   - Salt: ${user.salt || 'None'}`);

    // Test authentication
    console.log('\n🔍 Testing authentication...');
    const result = await user.authenticate('password123');
    console.log(`   - Authentication result: ${result}`);

    // Test with wrong password
    const wrongResult = await user.authenticate('wrongpassword');
    console.log(`   - Wrong password result: ${wrongResult}`);

    console.log('\n✅ Authentication test complete!');
  } catch (error) {
    console.error('❌ Error testing authentication:', error);
  } finally {
    mongoose.connection.close();
  }
}

testUserAuthentication();
