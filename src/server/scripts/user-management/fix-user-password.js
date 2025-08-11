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

async function fixUserPassword() {
  try {
    console.log('🔧 Fixing user password...\n');

    // Find the user
    const user = await User.findOne({ email: 'local@email.com' });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('📋 Before fix:');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Has password: ${!!user.password}`);
    console.log(`   - Password hash: ${user.passwordHash || 'None'}`);
    console.log(`   - Salt: ${user.salt || 'None'}`);

    // Set password using passport-local-mongoose method
    console.log('\n🔧 Setting password...');
    await user.setPassword('password123');
    await user.save();

    console.log('\n📋 After fix:');
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

    console.log('\n✅ Password fix complete!');
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixUserPassword();
