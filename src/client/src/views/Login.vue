<template>
  <div class="login-container">
    <div class="row justify-content-center align-items-center min-vh-100">
      <div class="col-lg-4 col-md-6 col-sm-8">
        <div class="login-card">
          <div class="text-center mb-4">
            <div class="logo-placeholder mb-3">
              <i class="fas fa-shield-alt fa-3x text-primary"></i>
            </div>
            <h4 class="text-primary">Welcome to the</h4>
            <h3 class="fw-bold">Fraud Detection Engine</h3>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <!-- Email Field -->
            <div class="mb-3">
              <label for="email" class="form-label">
                Email <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  placeholder="Enter your email"
                  required
                  :disabled="loading"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="mb-3">
              <label for="password" class="form-label">
                Password <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  placeholder="Enter your password"
                  required
                  :disabled="loading"
                />
              </div>
            </div>

            <!-- Tenant selection removed for security - will be shown after successful login -->

            <!-- Error Message -->
            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>

            <!-- Login Button -->
            <div class="d-grid gap-2 mb-3">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="loading || !email || !password"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                {{ loading ? 'Signing In...' : 'Sign In' }}
              </button>
            </div>

            <!-- OAuth Divider -->
            <div v-if="oauthEnabled" class="text-center mb-3">
              <div class="divider">
                <span class="divider-text">OR</span>
              </div>
            </div>

            <!-- OAuth Button -->
            <div v-if="oauthEnabled" class="d-grid gap-2">
              <button
                type="button"
                class="btn btn-outline-primary btn-lg"
                @click="handleOAuthLogin"
                :disabled="oauthLoading"
              >
                <i class="fas fa-sign-in-alt me-2"></i>
                <span
                  v-if="oauthLoading"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                {{
                  oauthLoading
                    ? 'Connecting...'
                    : `Sign In with ${oauthProvider}`
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'

  export default {
    name: 'Login',
    setup() {
      const router = useRouter()

      const email = ref('')
      const password = ref('')
      const loading = ref(false)
      const oauthLoading = ref(false)
      const error = ref('')
      const oauthEnabled = ref(false)
      const oauthProvider = ref('SSO')

      const validateEmail = email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      const handleLogin = async () => {
        if (!email.value || !password.value) {
          error.value = 'Please enter both email and password.'
          return
        }

        if (!validateEmail(email.value)) {
          error.value = 'Please enter a valid email address.'
          return
        }

        loading.value = true
        error.value = ''

        try {
          const loginData = {
            username: email.value,
            password: password.value,
          }

          // Simple login - tenant selection will happen after successful authentication
          const response = await axios.post('/auth/login', loginData)
          console.log(response)

          if (response.status === 200) {
            // Login successful - let the server handle redirects (MFA, tenant selection, etc.)
            window.location.href = response.data.redirectUrl || '/dashboard' // FIXME
          }
        } catch (error) {
          console.error('Login error:', error)

          if (error.response) {
            if (error.response.status === 401) {
              error.value = 'Invalid email or password.'
            } else if (error.response.status === 403) {
              error.value = 'Access denied. Please contact your administrator.'
            } else {
              error.value = 'Login failed. Please try again.'
            }
          } else {
            error.value = 'Network error. Please check your connection.'
          }
        } finally {
          loading.value = false
        }
      }

      const handleOAuthLogin = () => {
        oauthLoading.value = true
        error.value = ''

        try {
          window.location.href = '/auth/oauth'
        } catch (error) {
          console.error('OAuth login error:', error)
          error.value = 'Failed to initiate OAuth login.'
          oauthLoading.value = false
        }
      }

      const loadOAuthConfig = async () => {
        try {
          console.log('Loading OAuth config from:', '/auth/oauth-config')
          const response = await axios.get('/auth/oauth-config')
          console.log('OAuth config response:', response.data)
          oauthEnabled.value = response.data.oauthEnabled
          oauthProvider.value = response.data.provider
        } catch (error) {
          console.error('Error loading OAuth config:', error)
          console.error('Error details:', error.response?.data || error.message)
          oauthEnabled.value = false
        }
      }

      const testApiProxy = async () => {
        try {
          console.log('Testing API proxy...')
          const response = await axios.get('/test-api')
          console.log('API proxy test response:', response.data)
        } catch (error) {
          console.error('API proxy test failed:', error)
        }
      }

      onMounted(() => {
        // Clear any existing session
        sessionStorage.setItem('isLoggedIn', 'false')
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('tenant')
        sessionStorage.removeItem('permissions')
        sessionStorage.removeItem('roles')

        // Test API proxy
        // testApiProxy()

        // Load OAuth configuration
        loadOAuthConfig()
      })

      return {
        email,
        password,
        loading,
        oauthLoading,
        error,
        oauthEnabled,
        oauthProvider,
        validateEmail,
        handleLogin,
        handleOAuthLogin,
      }
    },
  }
</script>

<style scoped>
  .login-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  .login-card {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .logo-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    height: 120px;
    margin: 0 auto;
    background: rgba(0, 123, 255, 0.1);
    border-radius: 50%;
  }

  .divider {
    position: relative;
    text-align: center;
    margin: 20px 0;
  }

  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #dee2e6;
  }

  .divider-text {
    background: white;
    padding: 0 15px;
    color: #6c757d;
    font-size: 0.875rem;
  }

  .form-label {
    font-weight: 600;
    color: #495057;
  }

  .input-group-text {
    background-color: #f8f9fa;
    border-color: #ced4da;
  }

  .btn-lg {
    padding: 12px 24px;
    font-size: 1.1rem;
  }

  .alert {
    border-radius: 8px;
    border: none;
  }
</style>
