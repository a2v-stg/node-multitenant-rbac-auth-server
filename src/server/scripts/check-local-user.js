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

async function checkLocalUser() {
  try {
    console.log('🔍 Checking local user...\n');

    const user = await User.findOne({ email: 'local@email.com' });
    if (user) {
      console.log(`📋 User: ${user.email}`);
      console.log(`   - Full Name: ${user.fullName}`);
      console.log(`   - Has Password: ${!!user.password}`);
      console.log(
        `   - Password Length: ${user.password ? user.password.length : 0}`
      );
      console.log(`   - OAuth Provider: ${user.oauthProvider || 'None'}`);
      console.log(`   - Is Active: ${user.isActive}`);
    } else {
      console.log('❌ Local user not found');
    }

    console.log('\n✅ Local user check complete!');
  } catch (error) {
    console.error('❌ Error checking local user:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkLocalUser();
