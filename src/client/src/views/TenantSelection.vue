<template>
  <div class="tenant-selection-container">
    <div class="row justify-content-center align-items-center min-vh-100">
      <div class="col-lg-6 col-md-8 col-sm-10">
        <div class="tenant-selection-card">
          <div class="text-center mb-4">
            <h3 class="text-primary">Select Your Tenant</h3>
            <p class="text-muted">
              You have access to multiple tenants. Please select one to
              continue.
            </p>
          </div>

          <div class="tenant-list">
            <div
              v-for="tenant in tenants"
              :key="tenant.tenantId"
              class="tenant-item"
              :class="{ selected: selectedTenant === tenant.tenantId }"
              @click="selectTenant(tenant)"
            >
              <div class="tenant-info">
                <div class="tenant-icon">
                  <i class="fas fa-building"></i>
                </div>
                <div class="tenant-details">
                  <h5 class="tenant-name">{{ tenant.tenantName }}</h5>
                  <p class="tenant-id">ID: {{ tenant.tenantId }}</p>
                  <p v-if="tenant.envName" class="tenant-env">
                    <small class="text-muted">{{ tenant.envName }}</small>
                  </p>
                  <p
                    v-if="tenant.mfaEnabled && tenant.mfaRequiredForLocalUsers"
                    class="tenant-mfa"
                  >
                    <i class="fas fa-shield-alt text-warning"></i>
                    MFA Required
                  </p>
                  <p v-else-if="tenant.mfaEnabled" class="tenant-mfa">
                    <i class="fas fa-shield-alt text-info"></i>
                    MFA Optional
                  </p>
                </div>
              </div>
              <div class="tenant-actions">
                <button
                  class="btn btn-primary"
                  @click="confirmTenant(tenant)"
                  :disabled="loading"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ loading ? 'Loading...' : 'Select' }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger mt-3" role="alert">
            {{ error }}
          </div>

          <div class="text-center mt-4">
            <button class="btn btn-outline-secondary" @click="logout">
              <i class="fas fa-sign-out-alt me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'

  export default {
    name: 'TenantSelection',
    setup() {
      const router = useRouter()

      const tenants = ref([])
      const selectedTenant = ref('')
      const loading = ref(false)
      const error = ref('')

      const loadTenants = async () => {
        try {
          const response = await axios.get('/auth/available-tenants')
          tenants.value = response.data.tenants || []
          console.log('Available tenants:', tenants.value)

          // If only one tenant, auto-select it but let the user see the selection
          if (tenants.value.length === 1) {
            selectedTenant.value = tenants.value[0].tenantId
            console.log(
              'Auto-selected single tenant:',
              tenants.value[0].tenantName
            )
          }
        } catch (error) {
          console.error('Error loading tenants:', error)
          error.value = 'Failed to load available tenants'
        }
      }

      // Watch for auto-selection and automatically confirm
      watch(selectedTenant, async newTenantId => {
        if (newTenantId && tenants.value.length === 1) {
          const tenant = tenants.value.find(t => t.tenantId === newTenantId)
          if (tenant) {
            console.log('Auto-confirming single tenant:', tenant.tenantName)
            await confirmTenant(tenant)
          }
        }
      })

      const selectTenant = tenant => {
        selectedTenant.value = tenant.tenantId
      }

      const confirmTenant = async tenant => {
        loading.value = true
        error.value = ''

        try {
          console.log('Selecting tenant:', tenant.tenantId)

          // Call backend to select tenant
          const response = await axios.post(
            '/auth/select-tenant',
            {
              tenantId: tenant.tenantId,
            },
            {
              maxRedirects: 0,
              validateStatus: function (status) {
                return status >= 200 && status < 400 // Accept redirects
              },
            }
          )
          console.log('Tenant selection response:', response)
          console.log('Response status:', response.status)
          console.log('Response headers:', response.headers)

          // The backend will handle the redirect based on MFA requirements
          // We just need to follow the redirect
          if (response.status === 302 || response.status === 200) {
            const redirectUrl = response.headers.location
            console.log('Redirect URL:', redirectUrl)
            if (redirectUrl) {
              window.location.href = redirectUrl
            } else {
              // Fallback to dashboard if no redirect
              console.log('No redirect URL, going to dashboard')
              router.push('/dashboard')
            }
          }
        } catch (error) {
          console.error('Error selecting tenant:', error)
          console.error('Error response:', error.response)
          if (error.response?.data?.error) {
            error.value = error.response.data.error
          } else if (error.response?.status === 401) {
            error.value = 'Authentication failed. Please login again.'
            router.push('/login')
          } else {
            error.value = 'Failed to select tenant. Please try again.'
          }
        } finally {
          loading.value = false
        }
      }

      const logout = () => {
        sessionStorage.clear()
        window.location.href = '/auth/logout'
      }

      onMounted(async () => {
        // Check if user is authenticated by calling the current-user endpoint
        try {
          const response = await axios.get('/auth/current-user')
          if (response.data.user) {
            console.log('✅ User authenticated:', response.data.user.email)
            await loadTenants()
          } else {
            console.log('❌ User not authenticated, redirecting to login')
            router.push('/login')
          }
        } catch (error) {
          console.log('❌ Authentication check failed, redirecting to login')
          router.push('/login')
        }
      })

      return {
        tenants,
        selectedTenant,
        loading,
        error,
        selectTenant,
        confirmTenant,
        logout,
      }
    },
  }
</script>

<style scoped>
  .tenant-selection-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  .tenant-selection-card {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .tenant-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .tenant-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tenant-item:hover {
    border-color: #007bff;
    background-color: #f8f9fa;
  }

  .tenant-item.selected {
    border-color: #007bff;
    background-color: #e3f2fd;
  }

  .tenant-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .tenant-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #007bff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  .tenant-details {
    flex: 1;
  }

  .tenant-name {
    margin: 0;
    color: #333;
    font-weight: 600;
  }

  .tenant-id {
    margin: 0;
    color: #666;
    font-size: 0.875rem;
  }

  .tenant-actions {
    flex-shrink: 0;
  }

  .btn {
    border-radius: 8px;
    font-weight: 500;
  }

  .alert {
    border-radius: 8px;
    border: none;
  }
</style>
