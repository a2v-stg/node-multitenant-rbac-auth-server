<template>
  <AppLayoutWrapper>
    <div class="sample-container">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="h3 mb-0">Sample App Demo</h1>
            <p class="text-muted mb-0">
              This is a demonstration of the sample-app using the same UI and functionality as the submodule with complete visual consistency
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
                  <strong>The app now features a comprehensive dependency injection and theming system that ensures complete visual consistency.</strong>
                </p>
                <div class="alert alert-info">
                  <i class="fas fa-lightbulb me-2"></i>
                  <strong>Key Features:</strong>
                  <ul class="mb-0 mt-2">
                    <li>Identical UI/UX as the submodule app with legacy design system</li>
                    <li>Complete visual consistency through dependency injection</li>
                    <li>Legacy color scheme and styling (Primary: #002e6d, Secondary: #b8252b)</li>
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
                  Complete Visual Consistency
                </h5>
              </div>
              <div class="card-body">
                <p class="card-text">
                  The sample-app now uses a comprehensive theming system that ensures complete visual consistency 
                  with the legacy design. All components, including those from the submodule, inherit the sample-app's 
                  styling through dependency injection.
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
                  Dependency Injection System
                </h5>
              </div>
              <div class="card-body">
                <p class="card-text">
                  Advanced dependency injection system that provides sample-app components and styling to all child components, 
                  ensuring that even submodule components use the correct theme and styling.
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
                  Legacy Design System
                </h5>
              </div>
              <div class="card-body">
                <p class="card-text">
                  Complete implementation of the legacy design system with proper color scheme, typography, 
                  and component styling that matches the original application design.
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
                      <li><i class="fas fa-check text-success me-2"></i>AppLayoutWrapper - Dynamic layout with theme injection</li>
                      <li><i class="fas fa-check text-success me-2"></i>ComponentProvider - Dependency injection provider</li>
                      <li><i class="fas fa-check text-success me-2"></i>AppHeader - Header with legacy styling</li>
                      <li><i class="fas fa-check text-success me-2"></i>AppSidebar - Navigation with legacy color scheme</li>
                      <li><i class="fas fa-check text-success me-2"></i>DataTable - Reusable data table</li>
                      <li><i class="fas fa-check text-success me-2"></i>Theme System - Comprehensive SCSS theming</li>
                    </ul>
                  </div>
                  <div class="col-md-6">
                    <h6>New Features:</h6>
                    <ul class="list-unstyled">
                      <li><i class="fas fa-check text-success me-2"></i>Dependency injection system</li>
                      <li><i class="fas fa-check text-success me-2"></i>Complete visual consistency</li>
                      <li><i class="fas fa-check text-success me-2"></i>Legacy design system</li>
                      <li><i class="fas fa-check text-success me-2"></i>Theme-aware components</li>
                      <li><i class="fas fa-check text-success me-2"></i>Context-aware styling</li>
                      <li><i class="fas fa-check text-success me-2"></i>Seamless submodule integration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme Information -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-palette me-2"></i>
                  Theme System Details
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>Color Scheme:</h6>
                    <ul class="list-unstyled">
                      <li><i class="fas fa-circle text-primary me-2"></i>Primary: #002e6d (Dark Blue)</li>
                      <li><i class="fas fa-circle text-danger me-2"></i>Secondary: #b8252b (Red)</li>
                      <li><i class="fas fa-circle text-info me-2"></i>Tertiary: #66b3ff (Light Blue)</li>
                      <li><i class="fas fa-circle text-light me-2"></i>Light: #f4f8fa (Light Gray)</li>
                      <li><i class="fas fa-circle text-secondary me-2"></i>Grey: #e9f1f5 (Medium Gray)</li>
                    </ul>
                  </div>
                  <div class="col-md-6">
                    <h6>Design Elements:</h6>
                    <ul class="list-unstyled">
                      <li><i class="fas fa-check text-success me-2"></i>Legacy typography (Noto Sans)</li>
                      <li><i class="fas fa-check text-success me-2"></i>Consistent spacing and layout</li>
                      <li><i class="fas fa-check text-success me-2"></i>Component-specific styling</li>
                      <li><i class="fas fa-check text-success me-2"></i>Responsive design</li>
                      <li><i class="fas fa-check text-success me-2"></i>Accessibility compliance</li>
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
  </AppLayoutWrapper>
</template>

<script>
  import AppLayoutWrapper from '../components/AppLayoutWrapper.vue'

  export default {
    name: 'Sample',
    components: {
      AppLayoutWrapper,
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