<template>
  <AppLayout>
    <div class="sample-container">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="h3 mb-0">Sample App Demo</h1>
            <p class="text-muted mb-0">
              This is a demonstration of the sample-app using the same UI and functionality as the submodule
            </p>
          </div>
        </div>
      </div>

      <!-- Demo Content -->
      <div class="container-fluid">
        <!-- Introduction Card -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-info-circle me-2"></i>
                  Sample App Overview
                </h5>
              </div>
              <div class="card-body">
                <p class="mb-3">
                  This sample-app demonstrates how you can easily integrate and reuse the admin-ui submodule 
                  with minimal configuration while maintaining the exact same look, feel, and functionality.
                </p>
                <div class="alert alert-info">
                  <i class="fas fa-lightbulb me-2"></i>
                  <strong>Key Features:</strong>
                  <ul class="mb-0 mt-2">
                    <li>Identical UI/UX as the submodule app</li>
                    <li>Same components, layouts, and styling</li>
                    <li>Full functionality including MFA, tenant management, user management</li>
                    <li>Easy customization and extension capabilities</li>
                    <li>Minimal code changes required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Cards -->
        <div class="row">
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-palette me-2"></i>
                  UI/UX Consistency
                </h5>
              </div>
              <div class="card-body">
                <p class="card-text">
                  The sample-app uses the exact same components, layouts, and styling as the submodule, 
                  ensuring a consistent user experience across different implementations.
                </p>
                <div class="d-grid">
                  <router-link to="/dashboard" class="btn btn-outline-primary">
                    <i class="fas fa-tachometer-alt me-2"></i>
                    View Dashboard
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-cogs me-2"></i>
                  Full Functionality
                </h5>
              </div>
              <div class="card-body">
                <p class="card-text">
                  All features from the submodule are available: MFA, tenant management, user management, 
                  blacklist management, and more.
                </p>
                <div class="d-grid">
                  <router-link to="/core-data" class="btn btn-outline-success">
                    <i class="fas fa-database me-2"></i>
                    Core Data
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-code me-2"></i>
                  Easy Customization
                </h5>
              </div>
              <div class="card-body">
                <p class="card-text">
                  The modular architecture allows for easy customization and extension while maintaining 
                  the core functionality from the submodule.
                </p>
                <div class="d-grid">
                  <router-link to="/settings" class="btn btn-outline-info">
                    <i class="fas fa-cog me-2"></i>
                    Settings
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Technical Details -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-code me-2"></i>
                  Technical Implementation
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>Components Used:</h6>
                    <ul class="list-unstyled">
                      <li><i class="fas fa-check text-success me-2"></i>AppLayout - Main layout component</li>
                      <li><i class="fas fa-check text-success me-2"></i>AppHeader - Header with tenant switcher</li>
                      <li><i class="fas fa-check text-success me-2"></i>AppSidebar - Navigation sidebar</li>
                      <li><i class="fas fa-check text-success me-2"></i>DataTable - Reusable data table</li>
                      <li><i class="fas fa-check text-success me-2"></i>BlacklistManagement - Blacklist functionality</li>
                      <li><i class="fas fa-check text-success me-2"></i>UserSettings - User settings and MFA</li>
                    </ul>
                  </div>
                  <div class="col-md-6">
                    <h6>Features Available:</h6>
                    <ul class="list-unstyled">
                      <li><i class="fas fa-check text-success me-2"></i>Multi-tenant support</li>
                      <li><i class="fas fa-check text-success me-2"></i>MFA authentication</li>
                      <li><i class="fas fa-check text-success me-2"></i>User management</li>
                      <li><i class="fas fa-check text-success me-2"></i>RBAC system</li>
                      <li><i class="fas fa-check text-success me-2"></i>Blacklist management</li>
                      <li><i class="fas fa-check text-success me-2"></i>Core data management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Demo -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-compass me-2"></i>
                  Navigation Demo
                </h5>
              </div>
              <div class="card-body">
                <p class="mb-3">
                  Use the sidebar navigation to explore all the available features:
                </p>
                <div class="row">
                  <div class="col-md-3 col-sm-6 mb-3">
                    <router-link to="/dashboard" class="btn btn-outline-primary w-100">
                      <i class="fas fa-tachometer-alt me-2"></i>
                      Dashboard
                    </router-link>
                  </div>
                  <div class="col-md-3 col-sm-6 mb-3">
                    <router-link to="/core-data" class="btn btn-outline-success w-100">
                      <i class="fas fa-database me-2"></i>
                      Core Data
                    </router-link>
                  </div>
                  <div class="col-md-3 col-sm-6 mb-3">
                    <router-link to="/blacklist" class="btn btn-outline-danger w-100">
                      <i class="fas fa-ban me-2"></i>
                      Blacklist
                    </router-link>
                  </div>
                  <div class="col-md-3 col-sm-6 mb-3">
                    <router-link to="/users" class="btn btn-outline-info w-100">
                      <i class="fas fa-user-friends me-2"></i>
                      Users
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
  import AppLayout from '@admin/components/AppLayout.vue'

  export default {
    name: 'Sample',
    components: {
      AppLayout,
    },
  }
</script>

<style scoped>
  .sample-container {
    background-color: #f8f9fa;
  }

  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
  }

  .card {
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    border-radius: 10px 10px 0 0 !important;
  }

  .card-title {
    color: #495057;
    font-weight: 600;
  }

  .btn {
    border-radius: 8px;
    font-weight: 500;
  }

  .btn:hover {
    transform: translateY(-1px);
    transition: transform 0.2s;
  }
</style> 