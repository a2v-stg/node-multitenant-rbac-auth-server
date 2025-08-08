<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/sample" class="nav-link" active-class="active">
            <i class="fas fa-laptop-code me-2"></i>
            Demo App Usage
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/dashboard" class="nav-link" active-class="active">
            <i class="fas fa-tachometer-alt me-2"></i>
            Dashboard
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/core-data" class="nav-link" active-class="active">
            <i class="fas fa-database me-2"></i>
            Core Data
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/tenants" class="nav-link" active-class="active">
            <i class="fas fa-building me-2"></i>
            Tenant Management
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/users" class="nav-link" active-class="active">
            <i class="fas fa-user-friends me-2"></i>
            User Management
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/rbac" class="nav-link" active-class="active">
            <i class="fas fa-users-cog me-2"></i>
            RBAC Management
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/settings" class="nav-link" active-class="active">
            <i class="fas fa-cog me-2"></i>
            Settings
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
  export default {
    name: 'AppSidebar',
  }
</script>

<style scoped>
  .app-sidebar {
    width: 250px;
    background: #002e6d;
    min-height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .sidebar-nav {
    padding: 1rem 0;
  }

  .nav-link {
    color: #f4f8fa;
    padding: 0.75rem 1.5rem;
    border: none;
    background: transparent;
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-link:hover {
    color: #f4f8fa;
    background: rgba(255, 255, 255, 0.1);
  }

  .nav-link.active {
    color: #f4f8fa;
    background: #b8252b;
    border-left: 3px solid #b8252b;
  }

  .nav-link i {
    width: 20px;
    text-align: center;
    color: #f4f8fa;
  }
</style>
