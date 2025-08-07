const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function createUserWithBcrypt() {
  try {
    console.log('🔧 Creating user with bcrypt password...\n');

    // Delete existing user
    await User.deleteOne({ email: 'local@email.com' });
    console.log('🗑️ Deleted existing user');

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    // Create user with bcrypt password
    const user = new User({
      email: 'local@email.com',
      name: 'Local Test User',
      password: hashedPassword,
      oauthProvider: 'local',
      isActive: true,
    });

    await user.save();

    console.log('✅ Created user with bcrypt password');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Has password: ${!!user.password}`);
    console.log(
      `   - Password length: ${user.password ? user.password.length : 0}`
    );

    // Test bcrypt authentication
    console.log('\n🔍 Testing bcrypt authentication...');
    const isValid = await bcrypt.compare('password123', user.password);
    console.log(`   - Correct password: ${isValid ? 'Valid' : 'Invalid'}`);

    const isWrongValid = await bcrypt.compare('wrongpassword', user.password);
    console.log(`   - Wrong password: ${isWrongValid ? 'Valid' : 'Invalid'}`);

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

createUserWithBcrypt();
