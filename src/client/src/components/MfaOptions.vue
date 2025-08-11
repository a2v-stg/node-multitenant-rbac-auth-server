<template>
  <div class="mfa-options-container" v-if="user">
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
            <h4 class="mb-0">Two Factor Authentication</h4>
            <p class="text-muted mb-0">
              {{
                isLoginFlowProp
                  ? 'Complete your login with verification'
                  : 'For the security of your account, we require verification before you can continue.'
              }}
            </p>
          </div>
          <div class="card-body">
            <!-- MFA Options -->
            <div v-show="showMfaOptions" class="mb-4">
              <h6 class="mb-3">Choose a verification method:</h6>

              <!-- Show user's configured method if available -->
              <div
                v-if="userMfaMethod && isLoginFlowProp"
                class="alert alert-info"
              >
                <i class="fas fa-info-circle me-2"></i>
                Your account is configured to use
                <strong>{{ getMethodDisplayName(userMfaMethod) }}</strong>
              </div>

              <div class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="radio"
                  name="authMode"
                  id="sms"
                  value="sms"
                  v-model="authMode"
                  :disabled="
                    isLoginFlowProp && userMfaMethod && userMfaMethod !== 'sms'
                  "
                />
                <label class="form-check-label" for="sms">
                  <i class="fas fa-sms me-2"></i>SMS
                </label>
              </div>
              <div class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="radio"
                  name="authMode"
                  id="voice"
                  value="voice"
                  v-model="authMode"
                  :disabled="
                    isLoginFlowProp &&
                    userMfaMethod &&
                    userMfaMethod !== 'voice'
                  "
                />
                <label class="form-check-label" for="voice">
                  <i class="fas fa-phone me-2"></i>Voice
                </label>
              </div>
              <div class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="radio"
                  name="authMode"
                  id="totp"
                  value="totp"
                  v-model="authMode"
                  :disabled="
                    isLoginFlowProp && userMfaMethod && userMfaMethod !== 'totp'
                  "
                />
                <label class="form-check-label" for="totp">
                  <i class="fas fa-mobile-alt me-2"></i>Authenticator App
                </label>
              </div>
              <div class="form-check mb-3" v-if="firstTime && !isLoginFlowProp">
                <input
                  class="form-check-input"
                  type="radio"
                  name="authMode"
                  id="pushauth"
                  value="pushauth"
                  v-model="authMode"
                />
                <label class="form-check-label" for="pushauth">
                  <i class="fas fa-mobile-alt me-2"></i>Push Auth
                </label>
              </div>

              <div class="d-grid gap-2">
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="sendVerification"
                  :disabled="!authMode"
                >
                  {{ getButtonText() }}
                </button>
              </div>
            </div>

            <!-- Token Input -->
            <div v-show="showTokenInput" class="mb-4">
              <h6 class="mb-3">{{ getTokenInputTitle() }}</h6>
              <div class="input-group mb-3">
                <span class="input-group-text">
                  <i class="fas fa-key"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  :placeholder="getTokenInputPlaceholder()"
                  v-model="token"
                  maxlength="6"
                  @keyup.enter="validateToken"
                />
              </div>

              <div class="d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="validateToken"
                  :disabled="token.length !== 6"
                >
                  Verify
                </button>
                <button type="button" class="btn btn-secondary" @click="goBack">
                  Back
                </button>
              </div>
            </div>

            <!-- Push Auth Status -->
            <div v-show="showPushAuth" class="text-center">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <h6>Approve the authorization request on your authenticator app</h6>
              <p class="text-muted">Waiting for approval...</p>
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
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import logger from '../utils/logger.js'

  export default {
    name: 'MfaOptions',
    props: {
      user: {
        type: Object,
        required: false,
        default: () => ({
          email: '',
          username: '',
          mfaMethod: null,
          phoneNumber: null,
          countryCode: '+1',
        }),
      },
      isLoginFlow: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const router = useRouter()

      const authMode = ref('')
      const token = ref('')
      const showMfaOptions = ref(true)
      const showTokenInput = ref(false)
      const showPushAuth = ref(false)
      const firstTime = ref(false)
      const alert = ref({ show: false, type: '', message: '' })

      // Computed properties
      const userMfaMethod = computed(() => props.user?.mfaMethod)
      const isLoginFlow = computed(() => props.isLoginFlow)

      // Expose props to template
      const user = computed(() => props.user)
      const isLoginFlowProp = computed(() => props.isLoginFlow)

      // Auto-select user's configured method for login flow
      watch(
        [isLoginFlow, userMfaMethod],
        ([loginFlow, mfaMethod]) => {
          if (loginFlow && mfaMethod) {
            authMode.value = mfaMethod
          }
        },
        { immediate: true }
      )

      const showAlert = (type, message) => {
        alert.value = { show: true, type: `alert-${type}`, message }
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

      const getButtonText = () => {
        const method =
          isLoginFlow.value && userMfaMethod.value
            ? userMfaMethod.value
            : authMode.value

        if (method === 'totp') {
          return isLoginFlowProp.value
            ? 'Continue with Authenticator App'
            : 'Continue with Authenticator App'
        }

        return isLoginFlowProp.value
          ? 'Send Verification Code'
          : 'Send Verification'
      }

      const getTokenInputTitle = () => {
        const method =
          isLoginFlow.value && userMfaMethod.value
            ? userMfaMethod.value
            : authMode.value

        if (method === 'totp') {
          return 'Enter authenticator app code:'
        }

        return 'Enter verification code:'
      }

      const getTokenInputPlaceholder = () => {
        const method =
          isLoginFlow.value && userMfaMethod.value
            ? userMfaMethod.value
            : authMode.value

        if (method === 'totp') {
          return 'Enter 6-digit code from your authenticator app'
        }

        return 'Enter 6-digit code'
      }

      const sendVerification = async () => {
        try {
          clearAlert()

          // For login flow, use the user's configured method
          const method =
            isLoginFlow.value && userMfaMethod.value
              ? userMfaMethod.value
              : authMode.value

          // For TOTP, skip sending verification and go directly to token input
          if (method === 'totp') {
            showTokenInput.value = true
            showMfaOptions.value = false
            showAlert(
              'info',
              'Please enter the 6-digit code from your authenticator app.'
            )
            return
          }

          const payload = {
            username: props.user?.username || props.user?.email,
            mode: method,
          }

          const response = await axios.post('/auth/mfa-send-verification', payload)

          if (response.status === 200) {
            if (method === 'pushauth') {
              showPushAuth.value = true
              showMfaOptions.value = false
              showTokenInput.value = false
              // Start polling for push auth approval
              pollPushAuthStatus()
            } else {
              showTokenInput.value = true
              showMfaOptions.value = false
              showAlert(
                'success',
                `${getMethodDisplayName(method)} verification code sent successfully!`
              )
            }
          }
        } catch (error) {
          logger.error('Error sending verification:', error)
          showAlert(
            'danger',
            'Failed to send verification code. Please try again.'
          )
        }
      }

      const validateToken = async () => {
        try {
          clearAlert()

          if (token.value.length !== 6) {
            showAlert('danger', 'Please enter a 6-digit verification code.')
            return
          }

          let result

          if (isLoginFlow.value) {
            // Use login-specific endpoint
            const response = await axios.post('/auth/mfa-verify-login', {
              token: token.value,
            })

            if (response.status === 200 && response.data.success) {
              showAlert('success', 'Verification successful! Redirecting...')
              setTimeout(() => {
                window.location.href = response.data.redirectUrl
              }, 1500)
            } else {
              showAlert(
                'danger',
                'Invalid verification code. Please try again.'
              )
            }
          } else {
            // Use general MFA verification
            const method = userMfaMethod.value || authMode.value
            const payload = {
              token: token.value,
              mode: method,
            }

            const response = await axios.post('/auth/mfa-verify-token', payload)

            if (response.status === 200 && response.data.validated) {
              showAlert('success', 'Verification successful! Redirecting...')
              setTimeout(() => {
                router.push('/dashboard')
              }, 1500)
            } else {
              showAlert(
                'danger',
                'Invalid verification code. Please try again.'
              )
            }
          }
        } catch (error) {
          logger.error('Error validating token:', error)
          showAlert(
            'danger',
            'Failed to validate verification code. Please try again.'
          )
        }
      }

      const pollPushAuthStatus = async () => {
        const maxAttempts = 24 // 2 minutes with 5-second intervals
        let attempts = 0

        const poll = async () => {
          try {
            const response = await axios.get('/auth/mfa-push-status')

            if (response.data.approved) {
              showAlert(
                'success',
                'Push authentication approved! Redirecting...'
              )
              setTimeout(() => {
                if (isLoginFlow.value) {
                  window.location.href = '/dashboard'
                } else {
                  router.push('/dashboard')
                }
              }, 1500)
              return
            }

            attempts++
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000)
            } else {
              showPushAuth.value = false
              showMfaOptions.value = true
              showAlert(
                'danger',
                'Push authentication timed out. Please try again.'
              )
            }
          } catch (error) {
            logger.error('Error polling push auth status:', error)
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000)
            }
          }
        }

        setTimeout(poll, 5000)
      }

      const goBack = () => {
        showTokenInput.value = false
        showMfaOptions.value = true
        token.value = ''
        clearAlert()
      }

      onMounted(() => {
        // For login flow, set the auth mode to user's configured method
        if (isLoginFlow.value && userMfaMethod.value) {
          authMode.value = userMfaMethod.value
        }
      })

      return {
        user, // Expose user prop to template
        isLoginFlowProp, // Expose isLoginFlow prop to template
        authMode,
        token,
        showMfaOptions,
        showTokenInput,
        showPushAuth,
        firstTime,
        alert,
        userMfaMethod,
        isLoginFlow,
        showAlert,
        clearAlert,
        getMethodDisplayName,
        getButtonText,
        getTokenInputTitle,
        getTokenInputPlaceholder,
        sendVerification,
        validateToken,
        goBack,
      }
    },
  }
</script>

<style scoped>
  .mfa-options-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background-color: #f8f9fa;
  }

  .card {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border: none;
  }

  .form-check-input:checked {
    background-color: #007bff;
    border-color: #007bff;
  }

  .btn-close {
    float: right;
  }
</style>
