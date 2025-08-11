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

async function setupLocalUserPassword() {
  try {
    console.log('🔧 Setting up local user password...\n');

    // Find the local user
    const user = await User.findOne({ email: 'local@email.com' });

    if (!user) {
      console.log('❌ Local user not found');
      return;
    }

    console.log('📋 Found local user');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Current password hash: ${user.passwordHash || 'None'}`);

    // Set password using passport-local-mongoose method
    console.log('🔧 Setting password...');
    await user.setPassword('password123');
    await user.save();

    console.log('✅ Password set successfully');
    console.log(`   - New password hash: ${user.passwordHash || 'None'}`);

    console.log('\n🔑 Login Credentials:');
    console.log('   - Username: local@email.com');
    console.log('   - Password: password123');

    console.log('\n✅ Local user password setup complete!');
    console.log('🧪 You can now test local login with these credentials.');
  } catch (error) {
    console.error('❌ Error setting up local user password:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupLocalUserPassword();
