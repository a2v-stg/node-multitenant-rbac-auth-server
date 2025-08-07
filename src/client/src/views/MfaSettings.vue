<template>
  <AppLayout>
    <div class="mfa-settings-container">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="h3 mb-0">
              <i class="fas fa-shield-alt me-2"></i>MFA Settings
            </h1>
            <p class="text-muted mb-0">
              Manage your two-factor authentication settings
            </p>
          </div>
          <div class="col-auto">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="goBack"
            >
              <i class="fas fa-arrow-left me-2"></i>Back
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container-fluid">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <!-- Current MFA Status -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-info-circle me-2"></i>Current Status
                </h5>
              </div>
              <div class="card-body">
                <div v-if="loading" class="text-center">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading MFA status...</p>
                </div>
                <div v-else>
                  <div v-if="user.mfaSetupCompleted" class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Two-factor authentication is enabled</strong>
                    <br />
                    <small class="text-muted">
                      Method: {{ getMethodDisplayName(user.mfaMethod) }}
                      <span v-if="user.phoneNumber">
                        | Phone: {{ user.countryCode }} {{ user.phoneNumber }}
                      </span>
                    </small>
                  </div>
                  <div v-else class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Two-factor authentication is not enabled</strong>
                    <br />
                    <small class="text-muted">
                      Enable two-factor authentication to enhance your account security
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- MFA Options -->
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-cog me-2"></i>MFA Options
                </h5>
              </div>
              <div class="card-body">
                <!-- Enable MFA -->
                <div v-if="!user.mfaSetupCompleted" class="mb-4">
                  <h6>Enable Two-Factor Authentication</h6>
                  <p class="text-muted">
                    Choose a verification method to enable two-factor authentication for your account.
                  </p>
                  
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <div
                        class="card h-100"
                        @click="selectMethod('totp')"
                        :class="{ 'border-primary': selectedMethod === 'totp' }"
                        style="cursor: pointer"
                      >
                        <div class="card-body text-center">
                          <i class="fas fa-mobile-alt fa-3x text-primary mb-3"></i>
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
                        @click="selectMethod('sms')"
                        :class="{ 'border-primary': selectedMethod === 'sms' }"
                        style="cursor: pointer"
                      >
                        <div class="card-body text-center">
                          <i class="fas fa-sms fa-3x text-primary mb-3"></i>
                          <h6>SMS</h6>
                          <p class="text-muted small">
                            Receive codes via text message
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Change MFA Method -->
                <div v-else class="mb-4">
                  <h6>Change MFA Method</h6>
                  <p class="text-muted">
                    You can change your current MFA method or add additional methods.
                  </p>
                  
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <div
                        class="card h-100"
                        @click="selectMethod('totp')"
                        :class="{ 'border-primary': selectedMethod === 'totp' }"
                        style="cursor: pointer"
                      >
                        <div class="card-body text-center">
                          <i class="fas fa-mobile-alt fa-3x text-primary mb-3"></i>
                          <h6>Authenticator App</h6>
                          <p class="text-muted small">
                            Use apps like Google Authenticator or Microsoft Authenticator
                          </p>
                          <div v-if="user.mfaMethod === 'totp'" class="badge bg-success">
                            Current Method
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div
                        class="card h-100"
                        @click="selectMethod('sms')"
                        :class="{ 'border-primary': selectedMethod === 'sms' }"
                        style="cursor: pointer"
                      >
                        <div class="card-body text-center">
                          <i class="fas fa-sms fa-3x text-primary mb-3"></i>
                          <h6>SMS</h6>
                          <p class="text-muted small">
                            Receive codes via text message
                          </p>
                          <div v-if="user.mfaMethod === 'sms'" class="badge bg-success">
                            Current Method
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Method Setup -->
                <div v-if="selectedMethod && !setupComplete">
                  <!-- SMS Setup -->
                  <div v-if="selectedMethod === 'sms'" class="mb-4">
                    <h6>Setup SMS MFA</h6>
                    <div class="row">
                      <div class="col-md-3">
                        <label class="form-label">Country Code</label>
                        <select class="form-select" v-model="countryCode">
                          <option value="+1">+1 (US)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+61">+61 (AU)</option>
                        </select>
                      </div>
                      <div class="col-md-9">
                        <label class="form-label">Phone Number</label>
                        <input
                          type="tel"
                          class="form-control"
                          placeholder="Enter your phone number"
                          v-model="phoneNumber"
                        />
                      </div>
                    </div>
                    <div class="mt-3">
                      <button
                        type="button"
                        class="btn btn-primary"
                        @click="setupSmsMfa"
                        :disabled="!phoneNumber || setupLoading"
                      >
                        <i class="fas fa-spinner fa-spin me-2" v-if="setupLoading"></i>
                        <i class="fas fa-sms me-2" v-else></i>
                        {{ setupLoading ? 'Setting up...' : 'Setup SMS MFA' }}
                      </button>
                      <button
                        type="button"
                        class="btn btn-secondary ms-2"
                        @click="cancelSetup"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <!-- TOTP Setup -->
                  <div v-if="selectedMethod === 'totp'" class="mb-4">
                    <h6>Setup Authenticator App</h6>
                    <TotpSetup
                      @completed="onTotpSetupComplete"
                      @cancel="cancelSetup"
                    />
                  </div>
                </div>

                <!-- Success Message -->
                <div v-if="setupComplete" class="alert alert-success">
                  <i class="fas fa-check-circle me-2"></i>
                  Two-factor authentication has been {{ user.mfaSetupCompleted ? 'updated' : 'enabled' }} successfully!
                  <button
                    type="button"
                    class="btn-close float-end"
                    @click="setupComplete = false"
                  ></button>
                </div>

                <!-- Disable MFA -->
                <div v-if="user.mfaSetupCompleted" class="mt-4 pt-4 border-top">
                  <h6>Disable MFA</h6>
                  <p class="text-muted">
                    You can disable two-factor authentication, but this will make your account less secure.
                  </p>
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    @click="disableMfa"
                    :disabled="disableLoading"
                  >
                    <i class="fas fa-spinner fa-spin me-2" v-if="disableLoading"></i>
                    <i class="fas fa-times me-2" v-else></i>
                    {{ disableLoading ? 'Disabling...' : 'Disable MFA' }}
                  </button>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import TotpSetup from '../components/TotpSetup.vue'
import axios from 'axios'

export default {
  name: 'MfaSettings',
  components: {
    AppLayout,
    TotpSetup,
  },
  setup() {
    const router = useRouter()
    const user = ref({})
    const loading = ref(true)
    const selectedMethod = ref('')
    const phoneNumber = ref('')
    const countryCode = ref('+1')
    const setupComplete = ref(false)
    const setupLoading = ref(false)
    const disableLoading = ref(false)

    const getMethodDisplayName = (method) => {
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
        loading.value = false
      } catch (error) {
        console.error('Error loading user data:', error)
        loading.value = false
        if (error.response?.status === 401) {
          router.push('/login')
        }
      }
    }

    const selectMethod = (method) => {
      selectedMethod.value = method
      setupComplete.value = false
    }

    const setupSmsMfa = async () => {
      if (!phoneNumber.value) {
        alert('Please enter a phone number')
        return
      }

      setupLoading.value = true
      try {
        const response = await axios.post('/auth/mfa/enable', {
          method: 'sms',
          phoneNumber: phoneNumber.value,
          countryCode: countryCode.value,
        })

        if (response.status === 200) {
          setupComplete.value = true
          await loadUserData()
          selectedMethod.value = ''
          phoneNumber.value = ''
          setTimeout(() => {
            setupComplete.value = false
          }, 3000)
        }
      } catch (error) {
        console.error('Error setting up SMS MFA:', error)
        alert('Failed to setup SMS MFA. Please try again.')
      } finally {
        setupLoading.value = false
      }
    }

    const onTotpSetupComplete = async () => {
      setupComplete.value = true
      await loadUserData()
      selectedMethod.value = ''
      setTimeout(() => {
        setupComplete.value = false
      }, 3000)
    }

    const cancelSetup = () => {
      selectedMethod.value = ''
      phoneNumber.value = ''
      setupComplete.value = false
    }

    const disableMfa = async () => {
      if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
        return
      }

      disableLoading.value = true
      try {
        const response = await axios.post('/auth/mfa/disable')

        if (response.status === 200) {
          await loadUserData()
          alert('Two-factor authentication has been disabled.')
        }
      } catch (error) {
        console.error('Error disabling MFA:', error)
        alert('Failed to disable MFA. Please try again.')
      } finally {
        disableLoading.value = false
      }
    }

    const goBack = () => {
      router.go(-1)
    }

    onMounted(() => {
      loadUserData()
    })

    return {
      user,
      loading,
      selectedMethod,
      phoneNumber,
      countryCode,
      setupComplete,
      setupLoading,
      disableLoading,
      getMethodDisplayName,
      selectMethod,
      setupSmsMfa,
      onTotpSetupComplete,
      cancelSetup,
      disableMfa,
      goBack,
    }
  },
}
</script>

<style scoped>
.mfa-settings-container {
  padding: 2rem;
}

.card {
  transition: all 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card.border-primary {
  border-color: #007bff !important;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.badge {
  font-size: 0.75rem;
}
</style> 