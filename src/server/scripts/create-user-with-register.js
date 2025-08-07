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

async function createUserWithRegister() {
  try {
    console.log('🔧 Creating user with register method...\n');

    // Delete existing user
    await User.deleteOne({ email: 'local@email.com' });
    console.log('🗑️ Deleted existing user');

    // Create user using register method
    const user = await User.register(
      {
        email: 'local@email.com',
        name: 'Local Test User',
        oauthProvider: 'local',
        isActive: true,
      },
      'password123'
    );

    console.log('✅ Created user with register method');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Has password: ${!!user.password}`);
    console.log(`   - Password hash: ${user.passwordHash || 'None'}`);
    console.log(`   - Salt: ${user.salt || 'None'}`);

    // Test authentication
    console.log('\n🔍 Testing authentication...');
    const result = await user.authenticate('password123');
    console.log(`   - Correct password: ${result ? 'Valid' : 'Invalid'}`);

    const wrongResult = await user.authenticate('wrongpassword');
    console.log(`   - Wrong password: ${wrongResult ? 'Valid' : 'Invalid'}`);

    console.log('\n✅ User creation complete!');
    console.log('🧪 You can now test local login with:');
    console.log('   - Username: local@email.com');
    console.log('   - Password: password123');
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createUserWithRegister();
