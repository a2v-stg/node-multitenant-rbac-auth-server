<template>
  <div class="user-settings">
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="mb-3">
            <i class="fas fa-user-cog me-2"></i>User Settings
          </h2>
        </div>
      </div>

      <!-- MFA Settings -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-shield-alt me-2"></i>Two-Factor Authentication
              </h5>
            </div>
            <div class="card-body">
              <!-- Organization MFA Status -->
              <div class="row mb-4" v-if="organizationMfaConfig">
                <div class="col-12">
                  <h6>Organization MFA Status</h6>
                  <div
                    v-if="organizationMfaConfig.enabled"
                    class=" alert-info"
                  >
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Organization MFA is Enabled</strong> - Two-factor
                    authentication is required for all local users
                    <br />
                    <small class="text-muted">
                      Grace period: {{ organizationMfaConfig.gracePeriod }} days
                      | Methods: {{ organizationMfaConfig.methods.join(', ') }}
                    </small>
                  </div>
                  <div v-else class=" alert-secondary">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Organization MFA is Disabled</strong> - Two-factor
                    authentication is optional
                  </div>
                </div>
              </div>

              <!-- Current MFA Status -->
              <div class="row mb-4">
                <div class="col-md-8">
                  <h6>Your MFA Status</h6>
                  <div
                    v-if="user.mfaSetupCompleted"
                    class=" alert-success"
                  >
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Enabled</strong> - Your account is protected with
                    {{ getMethodDisplayName(user.mfaMethod) }}
                  </div>
                  <div v-else class=" alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Disabled</strong> - Your account is not protected
                    with two-factor authentication
                    <span
                      v-if="
                        organizationMfaConfig && organizationMfaConfig.enabled
                      "
                      class="text-danger"
                    >
                      <br /><strong>Required by organization</strong>
                    </span>
                  </div>
                </div>
                <div class="col-md-4 text-end">
                  <button
                    v-if="!user.mfaSetupCompleted"
                    type="button"
                    class="btn btn-primary"
                    @click="showMfaSetup = true"
                  >
                    <i class="fas fa-plus me-2"></i>Enable MFA
                  </button>
                  <button
                    v-else
                    type="button"
                    class="btn btn-outline-danger"
                    @click="disableMfa"
                    :disabled="
                      organizationMfaConfig && organizationMfaConfig.enabled
                    "
                  >
                    <i class="fas fa-times me-2"></i>Disable MFA
                  </button>
                </div>
              </div>

              <!-- MFA Setup Modal -->
              <div
                v-if="showMfaSetup"
                class="modal fade show d-block"
                style="background-color: rgba(0, 0, 0, 0.5)"
              >
                <div class="modal-dialog modal-lg">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">
                        Setup Two-Factor Authentication
                      </h5>
                      <button
                        type="button"
                        class="btn-close"
                        @click="showMfaSetup = false"
                      ></button>
                    </div>
                    <div class="modal-body">
                      <!-- MFA Method Selection -->
                      <div v-if="!selectedMfaMethod" class="mb-4">
                        <h6>Choose a verification method:</h6>
                        <div class="row">
                          <div class="col-md-6 mb-3">
                            <div
                              class="card h-100"
                              @click="selectMfaMethod('totp')"
                              style="cursor: pointer"
                            >
                              <div class="card-body text-center">
                                <i
                                  class="fas fa-mobile-alt fa-3x text-primary mb-3"
                                ></i>
                                <h6>Authenticator App</h6>
                                <p class="text-muted small">
                                  Use apps like Google Authenticator or Microsoft Authenticator
                                </p>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-6 mb-3">
                            <div
                              class="card h-100"
                              @click="selectMfaMethod('sms')"
                              style="cursor: pointer"
                            >
                              <div class="card-body text-center">
                                <i
                                  class="fas fa-sms fa-3x text-primary mb-3"
                                ></i>
                                <h6>SMS</h6>
                                <p class="text-muted small">
                                  Receive codes via text message
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Phone Number Setup for SMS -->
                      <div
                        v-if="selectedMfaMethod === 'sms' && !phoneNumber"
                        class="mb-4"
                      >
                        <h6>Enter your phone number:</h6>
                        <div class="row">
                          <div class="col-md-3">
                            <select class="form-select" v-model="countryCode">
                              <option value="+1">+1 (US)</option>
                              <option value="+44">+44 (UK)</option>
                              <option value="+91">+91 (IN)</option>
                              <option value="+61">+61 (AU)</option>
                            </select>
                          </div>
                          <div class="col-md-9">
                            <input
                              type="tel"
                              class="form-control"
                              placeholder="Phone number"
                              v-model="phoneNumber"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          class="btn btn-primary mt-3"
                          @click="setupSmsMfa"
                          :disabled="!phoneNumber"
                        >
                          Setup SMS MFA
                        </button>
                      </div>

                      <!-- TOTP Setup -->
                      <div
                        v-if="
                          selectedMfaMethod === 'totp' && !totpSetupComplete
                        "
                        class="mb-4"
                      >
                        <TotpSetup
                          @completed="onTotpSetupComplete"
                          @cancel="showMfaSetup = false"
                        />
                      </div>

                      <!-- Success Message -->
                      <div v-if="mfaSetupSuccess" class=" alert-success">
                        <i class="fas fa-check-circle me-2"></i>
                        Two-factor authentication has been enabled successfully!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-user-cog me-2"></i>Account Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Switch Tenant</h6>
                  <p class="text-muted">
                    Change to a different tenant if you have access to multiple
                    tenants.
                  </p>
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    @click="switchToTenantSelection"
                  >
                    <i class="fas fa-exchange-alt me-2"></i>Switch Tenant
                  </button>
                </div>
                <div class="col-md-6">
                  <h6>Logout</h6>
                  <p class="text-muted">
                    Sign out of your account and return to the login page.
                  </p>
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    @click="logout"
                  >
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert Messages -->
      <div
        v-if="alert.show"
        class="alert alert-dismissible"
        :class="alert.type"
        role="alert"
      >
        {{ alert.message }}
        <button type="button" class="btn-close" @click="clearAlert"></button>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted } from 'vue'
  import TotpSetup from './TotpSetup.vue'
  import axios from 'axios'

  export default {
    name: 'UserSettings',
    components: {
      TotpSetup,
    },
    setup() {
      const user = ref({})
      const organizationMfaConfig = ref(null)
      const showMfaSetup = ref(false)
      const selectedMfaMethod = ref('')
      const phoneNumber = ref('')
      const countryCode = ref('+1')
      const totpSetupComplete = ref(false)
      const mfaSetupSuccess = ref(false)
      const alert = ref({ show: false, type: '', message: '' })

      const showAlert = (type, message) => {
        alert.value = { show: true, type: `alert-${type}`, message }
        setTimeout(() => {
          clearAlert()
        }, 5000)
      }

      const clearAlert = () => {
        alert.value = { show: false, type: '', message: '' }
      }

      const getMethodDisplayName = method => {
        const methodNames = {
          sms: 'SMS',
          voice: 'Voice Call',
          totp: 'Authenticator App',
          email: 'Email',
        }
        return methodNames[method] || method
      }

      const loadUserData = async () => {
        try {
          const response = await axios.get('/auth/current-user')
          user.value = response.data.user
        } catch (error) {
          console.error('Error loading user data:', error)
          showAlert('danger', 'Failed to load user data.')
        }
      }

      const loadOrganizationMfaConfig = async () => {
        try {
          const response = await axios.get('/auth/organization/mfa/config')
          organizationMfaConfig.value = response.data
        } catch (error) {
          console.error('Error loading organization MFA config:', error)
          // Don't show alert for this as it's not critical
        }
      }

      const selectMfaMethod = method => {
        selectedMfaMethod.value = method
      }

      const setupSmsMfa = async () => {
        try {
          const response = await axios.post('/auth/mfa/enable', {
            method: 'sms',
            phoneNumber: phoneNumber.value,
            countryCode: countryCode.value,
          })

          if (response.status === 200) {
            mfaSetupSuccess.value = true
            await loadUserData()
            setTimeout(() => {
              showMfaSetup.value = false
              mfaSetupSuccess.value = false
              selectedMfaMethod.value = ''
              phoneNumber.value = ''
            }, 2000)
          }
        } catch (error) {
          console.error('Error setting up SMS MFA:', error)
          showAlert('danger', 'Failed to setup SMS MFA. Please try again.')
        }
      }

      const onTotpSetupComplete = async () => {
        totpSetupComplete.value = true
        mfaSetupSuccess.value = true
        await loadUserData()
        setTimeout(() => {
          showMfaSetup.value = false
          mfaSetupSuccess.value = false
          totpSetupComplete.value = false
          selectedMfaMethod.value = ''
        }, 2000)
      }

      const disableMfa = async () => {
        if (
          !confirm(
            'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
          )
        ) {
          return
        }

        try {
          const response = await axios.post('/auth/mfa/disable')

          if (response.status === 200) {
            showAlert('success', 'Two-factor authentication has been disabled.')
            await loadUserData()
          }
        } catch (error) {
          console.error('Error disabling MFA:', error)
          showAlert('danger', 'Failed to disable MFA. Please try again.')
        }
      }

      const switchToTenantSelection = () => {
        window.location.href = '/tenant-selection'
      }

      const logout = () => {
        sessionStorage.clear()
        window.location.href = '/auth/logout'
      }

      onMounted(() => {
        loadUserData()
        loadOrganizationMfaConfig()
      })

      return {
        user,
        organizationMfaConfig,
        showMfaSetup,
        selectedMfaMethod,
        phoneNumber,
        countryCode,
        totpSetupComplete,
        mfaSetupSuccess,
        alert,
        showAlert,
        clearAlert,
        getMethodDisplayName,
        selectMfaMethod,
        setupSmsMfa,
        onTotpSetupComplete,
        disableMfa,
        switchToTenantSelection,
        logout,
      }
    },
  }
</script>

<style scoped>
  .user-settings {
    padding: 20px;
  }

  .alert {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1050;
    min-width: 300px;
  }

  .card {
    transition: all 0.2s;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
</style>
