<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3>Admin UI Integration</h3>
          </div>
          <div class="card-body">
            <p>This page demonstrates how the sample app integrates with admin-ui functionality.</p>
            
            <div class="alert alert-info">
              <h5>Admin UI Features Available:</h5>
              <ul>
                <li><strong>Authentication:</strong> Login/logout system</li>
                <li><strong>User Management:</strong> Create, update, delete users</li>
                <li><strong>Tenant Management:</strong> Multi-tenant support</li>
                <li><strong>MFA:</strong> Multi-factor authentication</li>
                <li><strong>RBAC:</strong> Role-based access control</li>
                <li><strong>Settings:</strong> User and system settings</li>
              </ul>
            </div>

            <div class="row mt-4">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5>Backend Integration</h5>
                  </div>
                  <div class="card-body">
                    <p>The sample app backend uses admin-ui services:</p>
                    <ul>
                      <li>Auth Service</li>
                      <li>MFA Service</li>
                      <li>RBAC Service</li>
                      <li>User Models</li>
                      <li>Middleware</li>
                    </ul>
                    <button @click="testBackend" class="btn btn-primary">
                      Test Backend API
                    </button>
                    <div v-if="backendStatus" class="mt-2">
                      <small class="text-success">{{ backendStatus }}</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5>Frontend Integration</h5>
                  </div>
                  <div class="card-body">
                    <p>The sample app frontend can:</p>
                    <ul>
                      <li>Call admin-ui API endpoints</li>
                      <li>Use admin-ui authentication</li>
                      <li>Access admin-ui data</li>
                      <li>Extend admin-ui functionality</li>
                    </ul>
                    <button @click="testAuth" class="btn btn-secondary">
                      Test Authentication
                    </button>
                    <div v-if="authStatus" class="mt-2">
                      <small class="text-info">{{ authStatus }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <h5>API Endpoints Available:</h5>
              <div class="row">
                <div class="col-md-6">
                  <ul class="list-group">
                    <li class="list-group-item">
                      <code>GET /api/sample</code> - Sample app endpoint
                    </li>
                    <li class="list-group-item">
                      <code>GET /api/fde-engine</code> - FDE Engine status
                    </li>
                    <li class="list-group-item">
                      <code>POST /auth/login</code> - Admin UI login
                    </li>
                    <li class="list-group-item">
                      <code>GET /api/users</code> - User management
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul class="list-group">
                    <li class="list-group-item">
                      <code>GET /api/tenants</code> - Tenant management
                    </li>
                    <li class="list-group-item">
                      <code>GET /api/mfa</code> - MFA setup
                    </li>
                    <li class="list-group-item">
                      <code>GET /api/settings</code> - User settings
                    </li>
                    <li class="list-group-item">
                      <code>GET /api/blacklist</code> - Blacklist management
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Admin',
  data() {
    return {
      backendStatus: '',
      authStatus: ''
    }
  },
  methods: {
    async testBackend() {
      try {
        const response = await this.$http.get('/api/sample')
        this.backendStatus = `✅ Backend working: ${response.data.message}`
      } catch (error) {
        this.backendStatus = `❌ Backend error: ${error.message}`
      }
    },
    async testAuth() {
      try {
        const response = await this.$http.get('/auth/status')
        this.authStatus = `✅ Auth status: ${response.data.authenticated ? 'Logged in' : 'Not logged in'}`
      } catch (error) {
        this.authStatus = `❌ Auth error: ${error.message}`
      }
    }
  }
}
</script>

<style scoped>
.card {
  margin-bottom: 1rem;
}
.list-group-item code {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
}
</style> 