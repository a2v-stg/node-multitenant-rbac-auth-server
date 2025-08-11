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

async function createNewLocalUser() {
  try {
    console.log('🔧 Creating new local user...\n');

    // Delete existing local user
    await User.deleteOne({ email: 'local@email.com' });
    console.log('🗑️ Deleted existing local user');

    // Create new local user
    const user = new User({
      email: 'local@email.com',
      name: 'Local Test User',
      oauthProvider: 'local',
      isActive: true
    });

    // Set password
    await user.setPassword('password123');
    await user.save();

    console.log('✅ Created new local user');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Has password: ${!!user.password}`);

    // Test authentication
    console.log('\n🔍 Testing authentication...');
    const isValid = await user.authenticate('password123');
    console.log(`   - Password 'password123' valid: ${isValid ? 'Yes' : 'No'}`);

    console.log('\n🔑 Login Credentials:');
    console.log('   - Username: local@email.com');
    console.log('   - Password: password123');

    console.log('\n✅ New local user created successfully!');
    console.log('🧪 You can now test local login with these credentials.');
  } catch (error) {
    console.error('❌ Error creating new local user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createNewLocalUser();
