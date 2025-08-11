const axios = require('axios');

// Test user creation with tenant assignment
async function testUserCreationWithTenant() {
  try {
    console.log('🧪 Testing User Creation with Tenant Assignment...\n');

    // 1. Test login to get session
    console.log('1. Logging in to get session...');
    const loginResponse = await axios.post(
      'http://localhost:3000/auth/login',
      {
        email: 'admin@example.com',
        password: 'admin123'
      },
      {
        withCredentials: true
      }
    );
    console.log('✅ Login successful');

    // 2. Get current user and tenant info
    console.log('\n2. Getting current user and tenant info...');
    const currentUserResponse = await axios.get(
      'http://localhost:3000/auth/current-user',
      {
        withCredentials: true
      }
    );

    const currentUser = currentUserResponse.data.user;
    const currentTenant = currentUserResponse.data.tenant;

    console.log('Current User:', currentUser.email);
    console.log('Current Tenant:', currentTenant.tenantId);
    console.log('✅ Current user and tenant info retrieved');

    // 3. Test user creation with tenant
    console.log('\n3. Testing user creation with tenant...');
    const newUserData = {
      fullName: 'Test User with Tenant',
      email: 'testuser@example.com',
      password: 'password123',
      isActive: true,
      roles: [],
      tenantId: currentTenant.tenantId
    };

    const createUserResponse = await axios.post(
      'http://localhost:3000/api/users',
      newUserData,
      {
        withCredentials: true
      }
    );

    console.log('✅ User created successfully');
    console.log('Created User ID:', createUserResponse.data.data._id);

    // 4. Verify user was assigned to tenant
    console.log('\n4. Verifying user tenant assignment...');
    const usersResponse = await axios.get('http://localhost:3000/api/users', {
      withCredentials: true
    });

    const createdUser = usersResponse.data.data.find(
      user => user.email === 'testuser@example.com'
    );
    if (createdUser) {
      console.log('✅ User found in tenant users list');
      console.log('User Details:', {
        id: createdUser._id,
        email: createdUser.email,
        fullName: createdUser.fullName,
        isActive: createdUser.isActive
      });
    } else {
      console.log('❌ User not found in tenant users list');
    }

    // 5. Test additional tenant assignment
    console.log('\n5. Testing additional tenant assignment...');

    // Get available tenants
    const tenantsResponse = await axios.get(
      'http://localhost:3000/api/tenants/available',
      {
        withCredentials: true
      }
    );

    const availableTenants = tenantsResponse.data.data || [];
    console.log(
      'Available tenants:',
      availableTenants.map(t => t.tenantName)
    );

    if (availableTenants.length > 0) {
      const additionalTenant = availableTenants[0];
      console.log(
        `Assigning user to additional tenant: ${additionalTenant.tenantName}`
      );

      const assignResponse = await axios.post(
        `http://localhost:3000/api/users/${createUserResponse.data.data._id}/assign-tenant`,
        {
          tenantId: additionalTenant.tenantId
        },
        {
          withCredentials: true
        }
      );

      console.log('✅ User assigned to additional tenant');
    } else {
      console.log('ℹ️ No additional tenants available for assignment');
    }

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log('💡 Make sure you are logged in and have proper permissions');
    }

    if (error.response?.status === 400) {
      console.log('💡 Check the request data format and required fields');
    }
  }
}

// Run the test
testUserCreationWithTenant();
