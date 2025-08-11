const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

async function setupLocalUser() {
  try {
    console.log('🔧 Setting up local user for testing...\n');

    // Find the local user
    let user = await User.findOne({ email: 'local@email.com' });

    if (!user) {
      console.log('❌ Local user not found. Creating new user...');

      // Create new local user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('password123', saltRounds);

      user = new User({
        email: 'local@email.com',
        fullName: 'Local Test User',
        password: hashedPassword,
        isActive: true
      });

      await user.save();
      console.log('✅ Created new local user');
    } else {
      console.log('📋 Found existing local user');

      // Update password if user exists but has no password
      if (!user.password) {
        console.log('🔧 Adding password to existing user...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('password123', saltRounds);

        user.password = hashedPassword;
        await user.save();
        console.log('✅ Added password to existing user');
      } else {
        console.log('✅ User already has password');
      }
    }

    console.log('\n📋 User Details:');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Full Name: ${user.fullName}`);
    console.log(`   - Has Password: ${!!user.password}`);
    console.log(`   - Is Active: ${user.isActive}`);

    console.log('\n🔑 Login Credentials:');
    console.log('   - Username: local@email.com');
    console.log('   - Password: password123');

    console.log('\n✅ Local user setup complete!');
    console.log('🧪 You can now test local login with these credentials.');
  } catch (error) {
    console.error('❌ Error setting up local user:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupLocalUser();
