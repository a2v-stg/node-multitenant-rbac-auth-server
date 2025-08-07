<template>
  <header class="app-header">
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col">
          <h1 class="h3 mb-0">Fraud Detection Engine</h1>
          <h3 class="h6 mb-0">{{ currentTenant?.tenantName }}</h3>
        </div>
        <div class="col-auto">
          <div class="header-controls">
            <!-- Tenant Switcher -->
            <div class="tenant-switcher me-3">
              <div class="dropdown" ref="tenantDropdown">
                <button
                  class="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  @click="toggleTenantDropdown"
                >
                  <i class="fas fa-building me-2"></i>
                  {{ currentTenant?.tenantName }}
                </button>
                <ul class="dropdown-menu" :class="{ show: showTenantDropdown }">
                  <li
                    v-for="tenant in availableTenants"
                    :key="tenant.tenantName"
                  >
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="switchTenant(tenant)"
                      :class="{
                        active: tenant.tenantName === currentTenant?.tenantName,
                      }"
                    >
                      <i class="fas fa-building me-2"></i>
                      {{ tenant.tenantName }}
                    </a>
                  </li>
                  <li v-if="availableTenants.length === 0">
                    <span class="dropdown-item text-muted"
                      >No tenants available</span
                    >
                  </li>
                </ul>
              </div>
            </div>

            <!-- User Info -->
            <div class="user-info">
              <div class="user-avatar" v-if="user && user.picture">
                <img :src="user.picture" alt="Profile Picture" />
              </div>
              <div class="user-avatar" v-else>
                <span>{{ userInitial }}</span>
              </div>
              <div class="user-details">
                <span class="user-name">{{ userName }}</span>
                <span class="user-email" v-if="user">{{ user.email }}</span>
              </div>
              <div class="dropdown" ref="userDropdown">
                <button
                  class="btn btn-link dropdown-toggle"
                  type="button"
                  @click="toggleUserDropdown"
                >
                  <i class="fas fa-cog"></i>
                </button>
                <ul class="dropdown-menu" :class="{ show: showUserDropdown }">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="logout"
                      >Logout</a
                    >
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'

  export default {
    name: 'AppHeader',
    setup() {
      const router = useRouter()

      const user = ref(null)
      const tenant = ref(null)
      const availableTenants = ref([])
      const showTenantDropdown = ref(false)
      const showUserDropdown = ref(false)

      const userName = computed(() => {
        if (!user.value) return 'Unknown User'
        return (
          user.value.fullName ||
          user.value.name ||
          user.value.email ||
          'Unknown User'
        )
      })

      const userInitial = computed(() => {
        if (!user.value || !user.value.email) return 'U'
        return user.value.email.charAt(0).toUpperCase()
      })

      const currentTenant = computed(() => tenant.value)

      const currentTenantName = computed(() => {
        if (!tenant.value) return 'Select Tenant'
        return tenant.value.name
      })

      const loadUserData = async () => {
        try {
          console.log('Loading user data...')
          const response = await axios.get('/auth/current-user')
          console.log('User data response:', response.data)
          user.value = response.data.user
          tenant.value = response.data.tenant
        } catch (error) {
          console.error('Error loading user data:', error)
          if (error.response?.status === 401) {
            window.location.href = '/login'
          }
        }
      }

      const loadAvailableTenants = async () => {
        try {
          console.log('Loading available tenants...')
          const response = await axios.get('/auth/available-tenants')
          console.log('Available tenants response:', response.data)
          availableTenants.value = response.data.tenants
        } catch (error) {
          console.error('Error loading available tenants:', error)
          if (error.response?.status === 401) {
            window.location.href = '/login'
          }
        }
      }

      const switchTenant = async selectedTenant => {
        try {
          console.log('Switching to tenant:', selectedTenant.tenantName)
          showTenantDropdown.value = false // Close dropdown after selection
          const response = await axios.post('/auth/switch-tenant', {
            tenant: selectedTenant.tenantName,
          })

          console.log('Switch tenant response:', response.data)

          if (response.data.success) {
            // Show success message briefly before refreshing
            alert(
              `Switched to ${selectedTenant.tenantName} tenant. Refreshing page...`
            )

            // Refresh the page to load new tenant data
            window.location.reload()
          }
        } catch (error) {
          console.error('Error switching tenant:', error)
          if (error.response?.status === 401) {
            window.location.href = '/login'
          } else {
            alert('Failed to switch tenant. Please try again.')
          }
        }
      }

      const toggleTenantDropdown = () => {
        console.log('Toggle tenant dropdown clicked')
        showTenantDropdown.value = !showTenantDropdown.value
        showUserDropdown.value = false // Close other dropdown
      }

      const toggleUserDropdown = () => {
        console.log('Toggle user dropdown clicked')
        showUserDropdown.value = !showUserDropdown.value
        showTenantDropdown.value = false // Close other dropdown
      }

      const logout = () => {
        console.log('Logging out...')
        window.location.href = '/auth/logout'
      }

      onMounted(() => {
        loadUserData()
        loadAvailableTenants()

        // Close dropdowns when clicking outside
        document.addEventListener('click', event => {
          const tenantDropdown = document.querySelector('.tenant-switcher')
          const userDropdown = document.querySelector('.user-info .dropdown')

          if (!tenantDropdown?.contains(event.target)) {
            showTenantDropdown.value = false
          }

          if (!userDropdown?.contains(event.target)) {
            showUserDropdown.value = false
          }
        })
      })

      return {
        user,
        tenant,
        availableTenants,
        userName,
        userInitial,
        currentTenant,
        currentTenantName,
        showTenantDropdown,
        showUserDropdown,
        toggleTenantDropdown,
        toggleUserDropdown,
        switchTenant,
        logout,
      }
    },
  }
</script>

<style scoped>
  .app-header {
    background: white;
    border-bottom: 1px solid #e9ecef;
    padding: 1rem 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .tenant-switcher .dropdown-menu {
    max-height: 300px;
    overflow-y: auto;
  }

  .tenant-switcher .dropdown-item.active {
    background-color: #007bff;
    color: white;
  }

  .tenant-switcher .dropdown-item:hover {
    background-color: #f8f9fa;
  }

  .dropdown-menu.show {
    display: block !important;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #007bff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-details {
    display: flex;
    flex-direction: column;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .user-email {
    font-size: 0.8rem;
    color: #6c757d;
  }
</style>
