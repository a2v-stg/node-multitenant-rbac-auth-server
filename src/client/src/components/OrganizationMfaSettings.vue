<template>
  <div class="organization-mfa-settings">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-shield-alt me-2"></i>
          Organization MFA Settings
        </h5>
        <p class="text-muted mb-0">
          Configure two-factor authentication for all users in the organization
        </p>
      </div>
      <div class="card-body">
        <!-- MFA Enable/Disable Toggle -->
        <div class="mb-4">
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="mfaEnabled"
              v-model="mfaEnabled"
              @change="toggleMfa"
              :disabled="loading"
            />
            <label class="form-check-label" for="mfaEnabled">
              <strong>Enable Organization MFA</strong>
            </label>
          </div>
          <small class="text-muted">
            When enabled, all local users will be required to set up two-factor
            authentication
          </small>
        </div>

        <!-- MFA Configuration (shown when enabled) -->
        <div v-if="mfaEnabled" class="mb-4">
          <h6>MFA Configuration</h6>

          <!-- MFA Methods -->
          <div class="mb-3">
            <label class="form-label">Allowed MFA Methods</label>
            <div class="row">
              <div
                class="col-md-6"
                v-for="method in availableMethods"
                :key="method.value"
              >
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="method.value"
                    :value="method.value"
                    v-model="selectedMethods"
                    @change="updateMethods"
                    :disabled="loading"
                  />
                  <label class="form-check-label" :for="method.value">
                    <i :class="method.icon" class="me-2"></i>
                    {{ method.label }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Grace Period -->
          <div class="mb-3">
            <label for="gracePeriod" class="form-label"
              >Grace Period (days)</label
            >
            <input
              type="number"
              class="form-control"
              id="gracePeriod"
              v-model="gracePeriod"
              min="0"
              max="30"
              @change="updateGracePeriod"
              :disabled="loading"
            />
            <small class="text-muted">
              New users will have this many days to set up MFA before being
              required to use it
            </small>
          </div>

          <!-- Required for Local Users -->
          <div class="mb-3">
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                id="requiredForLocalUsers"
                v-model="requiredForLocalUsers"
                @change="updateRequiredForLocalUsers"
                :disabled="loading"
              />
              <label class="form-check-label" for="requiredForLocalUsers">
                <strong>Require MFA for Local Users</strong>
              </label>
            </div>
            <small class="text-muted">
              OAuth users will always bypass MFA regardless of this setting
            </small>
          </div>
        </div>

        <!-- Current Status -->
        <div class="alert" :class="statusAlertClass" role="alert">
          <i :class="statusIcon" class="me-2"></i>
          <strong>{{ statusTitle }}</strong>
          <p class="mb-0">{{ statusMessage }}</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Updating settings...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted, computed } from 'vue'
  import axios from 'axios'

  export default {
    name: 'OrganizationMfaSettings',
    setup() {
      const loading = ref(false)
      const mfaEnabled = ref(false)
      const requiredForLocalUsers = ref(false)
      const selectedMethods = ref(['totp'])
      const gracePeriod = ref(7)
      const config = ref(null)

      const availableMethods = [
        {
          value: 'totp',
          label: 'Authenticator App (TOTP)',
          icon: 'fas fa-mobile-alt',
        },
        { value: 'sms', label: 'SMS', icon: 'fas fa-sms' },
        { value: 'voice', label: 'Voice Call', icon: 'fas fa-phone' },
        { value: 'email', label: 'Email', icon: 'fas fa-envelope' },
      ]

      const statusAlertClass = computed(() => {
        if (mfaEnabled.value) {
          return 'alert-success'
        }
        return 'alert-info'
      })

      const statusIcon = computed(() => {
        if (mfaEnabled.value) {
          return 'fas fa-shield-check'
        }
        return 'fas fa-info-circle'
      })

      const statusTitle = computed(() => {
        if (mfaEnabled.value) {
          return 'MFA is Enabled'
        }
        return 'MFA is Disabled'
      })

      const statusMessage = computed(() => {
        if (mfaEnabled.value) {
          return `Organization MFA is active. Local users must set up two-factor authentication within ${gracePeriod.value} days of account creation.`
        }
        return 'Organization MFA is currently disabled. Users can optionally set up two-factor authentication.'
      })

      const loadConfig = async () => {
        try {
          loading.value = true
          const response = await axios.get('/auth/organization/mfa/config')
          config.value = response.data

          mfaEnabled.value = config.value.enabled
          requiredForLocalUsers.value = config.value.requiredForLocalUsers
          selectedMethods.value = config.value.methods || ['totp']
          gracePeriod.value = config.value.gracePeriod || 7
        } catch (error) {
          console.error('Error loading MFA config:', error)
        } finally {
          loading.value = false
        }
      }

      const toggleMfa = async () => {
        try {
          loading.value = true

          if (mfaEnabled.value) {
            await axios.post('/auth/organization/mfa/enable', {
              methods: selectedMethods.value,
            })
          } else {
            await axios.post('/auth/organization/mfa/disable')
          }

          await loadConfig()
        } catch (error) {
          console.error('Error toggling MFA:', error)
          // Revert the toggle if there was an error
          mfaEnabled.value = !mfaEnabled.value
        } finally {
          loading.value = false
        }
      }

      const updateMethods = async () => {
        if (!mfaEnabled.value) return

        try {
          loading.value = true
          await axios.post('/auth/organization/mfa/methods', {
            methods: selectedMethods.value,
          })
        } catch (error) {
          console.error('Error updating MFA methods:', error)
        } finally {
          loading.value = false
        }
      }

      const updateGracePeriod = async () => {
        if (!mfaEnabled.value) return

        try {
          loading.value = true
          await axios.post('/auth/organization/mfa/grace-period', {
            days: gracePeriod.value,
          })
        } catch (error) {
          console.error('Error updating grace period:', error)
        } finally {
          loading.value = false
        }
      }

      const updateRequiredForLocalUsers = async () => {
        if (!mfaEnabled.value) return

        try {
          loading.value = true
          // This would need a new endpoint or we can update the entire config
          await axios.post('/auth/organization/mfa/enable', {
            methods: selectedMethods.value,
          })
        } catch (error) {
          console.error('Error updating required for local users:', error)
        } finally {
          loading.value = false
        }
      }

      onMounted(() => {
        loadConfig()
      })

      return {
        loading,
        mfaEnabled,
        requiredForLocalUsers,
        selectedMethods,
        gracePeriod,
        availableMethods,
        statusAlertClass,
        statusIcon,
        statusTitle,
        statusMessage,
        toggleMfa,
        updateMethods,
        updateGracePeriod,
        updateRequiredForLocalUsers,
      }
    },
  }
</script>

<style scoped>
  .organization-mfa-settings {
    max-width: 800px;
    margin: 0 auto;
  }

  .card {
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }

  .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }

  .form-check-input:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
  }

  .form-switch .form-check-input {
    width: 3rem;
    height: 1.5rem;
  }

  .form-switch .form-check-input:checked {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
  }

  .form-switch .form-check-input:focus {
    border-color: rgba(13, 110, 253, 0.25);
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }
</style>
