<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/dashboard" class="nav-link" active-class="active">
            <i class="fas fa-tachometer-alt me-2"></i>
            Dashboard
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/blacklist" class="nav-link" active-class="active">
            <i class="fas fa-ban me-2"></i>
            Blacklist Management
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
    background: #2c3e50;
    min-height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
  }

  .sidebar-nav {
    padding: 1rem 0;
  }

  .nav-link {
    color: #ecf0f1;
    padding: 0.75rem 1.5rem;
    border: none;
    background: transparent;
    transition: all 0.3s ease;
  }

  .nav-link:hover {
    color: #3498db;
    background: rgba(52, 152, 219, 0.1);
  }

  .nav-link.active {
    color: #3498db;
    background: rgba(52, 152, 219, 0.2);
    border-left: 3px solid #3498db;
  }

  .nav-link i {
    width: 20px;
    text-align: center;
  }
</style>
