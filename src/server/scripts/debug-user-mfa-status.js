require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const TenantsModel = require('../models/Tenant');
const UserTenant = require('../models/UserTenant');
const authService = require('../services/authService');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugUserMfaStatus() {
  try {
    console.log('🔍 Debugging User MFA Status...\n');

    // 1. Find the test user
    console.log('1. Finding test user...');
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    console.log('✅ Found user:', user.email);

    // 2. Display all user MFA fields
    console.log('\n2. User MFA Configuration:');
    console.log('MFA Method:', user.mfaMethod);
    console.log('MFA Setup Completed:', user.mfaSetupCompleted);
    console.log('TOTP Secret:', user.totpSecret || 'Not set');
    console.log('Phone Number:', user.phoneNumber || 'Not set');
    console.log('Country Code:', user.countryCode || 'Not set');
    console.log('OAuth Provider:', user.oauthProvider);
    console.log('Created At:', user.createdAt);
    console.log('Updated At:', user.updatedAt);

    // 3. Test hasMfaConfigured method
    console.log('\n3. Testing hasMfaConfigured method:');
    console.log('Has MFA Configured:', user.hasMfaConfigured());

    // 4. Check tenant MFA policy
    console.log('\n4. Tenant MFA Policy:');
    const userTenants = await UserTenant.find({ user: user._id }).populate(
      'tenant'
    );
    if (userTenants.length > 0) {
      const tenant = userTenants[0].tenant;
      console.log('Tenant:', tenant.tenantName);
      console.log('MFA Enabled:', tenant.mfaEnabled);
      console.log(
        'MFA Required for Local Users:',
        tenant.mfaRequiredForLocalUsers
      );
      console.log('MFA Methods:', tenant.mfaMethods);
      console.log('MFA Grace Period:', tenant.mfaGracePeriod, 'days');
    }

    // 5. Test authService.isMfaRequired
    console.log('\n5. Testing MFA requirement logic:');
    if (userTenants.length > 0) {
      const tenant = userTenants[0].tenant;
      const mfaRequired = authService.isMfaRequired(user, tenant);
      console.log('MFA Required:', mfaRequired);
    }

    // 6. Test authService.handleUserLogin
    console.log('\n6. Testing login flow logic:');
    const loginResult = await authService.handleUserLogin(user);
    console.log('Login Result Type:', loginResult.type);
    console.log('Redirect URL:', loginResult.redirectUrl);

    // 7. Manually test hasMfaConfigured logic
    console.log('\n7. Manual hasMfaConfigured test:');
    let hasMfaConfigured = false;

    if (user.mfaMethod === 'totp') {
      hasMfaConfigured = user.totpSecret && user.mfaSetupCompleted;
      console.log(
        'TOTP check:',
        user.totpSecret ? 'Secret exists' : 'No secret',
        '&&',
        user.mfaSetupCompleted ? 'Setup completed' : 'Setup not completed'
      );
    } else if (user.mfaMethod === 'sms' || user.mfaMethod === 'voice') {
      hasMfaConfigured = user.phoneNumber && user.mfaSetupCompleted;
      console.log(
        'SMS/Voice check:',
        user.phoneNumber ? 'Phone exists' : 'No phone',
        '&&',
        user.mfaSetupCompleted ? 'Setup completed' : 'Setup not completed'
      );
    } else if (user.mfaMethod === 'email') {
      hasMfaConfigured = user.email && user.mfaSetupCompleted;
      console.log(
        'Email check:',
        user.email ? 'Email exists' : 'No email',
        '&&',
        user.mfaSetupCompleted ? 'Setup completed' : 'Setup not completed'
      );
    }

    console.log('Manual hasMfaConfigured result:', hasMfaConfigured);

    // 8. Check if there are any database issues
    console.log('\n8. Database consistency check:');
    console.log('User document keys:', Object.keys(user.toObject()));
    console.log('MFA-related fields present:', {
      mfaMethod: user.hasOwnProperty('mfaMethod'),
      mfaSetupCompleted: user.hasOwnProperty('mfaSetupCompleted'),
      totpSecret: user.hasOwnProperty('totpSecret'),
      phoneNumber: user.hasOwnProperty('phoneNumber'),
    });

    console.log('\n✅ Debug completed!');
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the debug
debugUserMfaStatus();
