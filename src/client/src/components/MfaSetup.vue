<template>
  <div class="mfa-setup-container">
    <div class="row justify-content-center">
      <div class="col-lg-6 col-md-8">
        <div class="card">
          <div class="card-header text-center">
            <img
              src="/static/allocore-logo.png"
              alt="Tenant Logo"
              class="mb-3"
              style="height: 40px"
            />
            <h4 class="mb-0">Setup Two-Factor Authentication</h4>
            <p class="text-muted mb-0">
              Your organization requires two-factor authentication for enhanced
              security.
            </p>
          </div>
          <div class="card-body">
            <!-- Method Selection -->
            <div v-if="!selectedMethod" class="mb-4">
              <h6 class="mb-3">Choose a verification method:</h6>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <div
                    class="card h-100"
                    @click="selectMethod('totp')"
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

            <!-- Phone Number Setup for SMS -->
            <div v-if="selectedMethod === 'sms' && !phoneNumber" class="mb-4">
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
              v-if="selectedMethod === 'totp' && !totpSetupComplete"
              class="mb-4"
            >
              <TotpSetup @completed="onTotpSetupComplete" @cancel="goBack" />
            </div>

            <!-- Success Message -->
            <div v-if="setupSuccess" class="alert alert-success">
              <i class="fas fa-check-circle me-2"></i>
              Two-factor authentication has been setup successfully! Redirecting
              to dashboard...
            </div>

            <!-- Alert Messages -->
            <div
              v-if="alert.show"
              class="alert"
              :class="alert.type"
              role="alert"
            >
              {{ alert.message }}
              <button
                type="button"
                class="btn-close"
                @click="clearAlert"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import TotpSetup from './TotpSetup.vue'
  import axios from 'axios'

  export default {
    name: 'MfaSetup',
    components: {
      TotpSetup,
    },
    setup() {
      const router = useRouter()

      const selectedMethod = ref('')
      const phoneNumber = ref('')
      const countryCode = ref('+1')
      const totpSetupComplete = ref(false)
      const setupSuccess = ref(false)
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

      const selectMethod = method => {
        selectedMethod.value = method
      }

      const setupSmsMfa = async () => {
        try {
          const response = await axios.post('/auth/mfa/setup', {
            method: 'sms',
            phoneNumber: phoneNumber.value,
            countryCode: countryCode.value,
          })

          if (response.status === 200) {
            setupSuccess.value = true
            setTimeout(() => {
              // Use redirect URL from backend or fallback to dashboard
              const redirectUrl = response.data.redirectUrl || '/dashboard'
              window.location.href = redirectUrl
            }, 2000)
          }
        } catch (error) {
          console.error('Error setting up SMS MFA:', error)
          showAlert('danger', 'Failed to setup SMS MFA. Please try again.')
        }
      }

      const onTotpSetupComplete = async () => {
        totpSetupComplete.value = true
        setupSuccess.value = true
        setTimeout(() => {
          // For TOTP setup, we'll redirect to dashboard for now
          // In a more complete implementation, we'd get the redirect URL from the backend
          window.location.href = '/dashboard'
        }, 2000)
      }

      const goBack = () => {
        selectedMethod.value = ''
        phoneNumber.value = ''
        totpSetupComplete.value = false
        clearAlert()
      }

      onMounted(() => {
        // Check if user is authenticated
        axios.get('/auth/current-user').catch(error => {
          console.log('Authentication check failed:', error.response?.status)
          // Only redirect to login if it's a 401 error (not authenticated)
          if (error.response?.status === 401) {
            router.push('/login')
          }
        })
      })

      return {
        selectedMethod,
        phoneNumber,
        countryCode,
        totpSetupComplete,
        setupSuccess,
        alert,
        showAlert,
        clearAlert,
        selectMethod,
        setupSmsMfa,
        onTotpSetupComplete,
        goBack,
      }
    },
  }
</script>

<style scoped>
  .mfa-setup-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background-color: #f8f9fa;
  }

  .card {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border: none;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .btn-close {
    float: right;
  }
</style>
