<template>
  <div class="totp-setup-container">
    <div class="row justify-content-center">
      <div class="col-lg-6 col-md-8">
        <div class="card">
          <div class="card-header text-center">
            <h4 class="mb-0">Setup Authenticator App</h4>
            <p class="text-muted mb-0">
              Scan the QR code with your authenticator app
            </p>
          </div>
          <div class="card-body">
            <!-- QR Code Display -->
            <div v-if="qrCode" class="text-center mb-4">
              <img :src="qrCode" alt="QR Code" class="qr-code" />
              <p class="text-muted mt-2">
                <small
                  >Or enter this code manually: <code>{{ secret }}</code></small
                >
              </p>
            </div>

            <!-- Manual Setup -->
            <div v-else class="text-center mb-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Generating QR code...</p>
            </div>

            <!-- Verification -->
            <div class="mb-4">
              <label for="verificationCode" class="form-label"
                >Enter verification code:</label
              >
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-key"></i>
                </span>
                <input
                  type="text"
                  id="verificationCode"
                  class="form-control"
                  placeholder="Enter 6-digit code"
                  v-model="verificationCode"
                  maxlength="6"
                  @keyup.enter="verifyCode"
                />
              </div>
            </div>

            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-primary"
                @click="verifyCode"
                :disabled="!verificationCode || verificationCode.length !== 6"
              >
                Verify & Complete Setup
              </button>
              <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('cancel')"
              >
                Cancel
              </button>
            </div>

            <!-- Alert Messages -->
            <div
              v-if="alert.show"
              class="alert mt-3"
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
  import axios from 'axios'

  export default {
    name: 'TotpSetup',
    emits: ['cancel', 'completed'],
    setup(props, { emit }) {
      const qrCode = ref(null)
      const secret = ref('')
      const verificationCode = ref('')
      const alert = ref({ show: false, type: '', message: '' })

      const showAlert = (type, message) => {
        alert.value = { show: true, type: `alert-${type}`, message }
      }

      const clearAlert = () => {
        alert.value = { show: false, type: '', message: '' }
      }

      const generateTotpSetup = async () => {
        try {
          const response = await axios.post('/auth/mfa-setup-totp')

          if (response.status === 200) {
            qrCode.value = response.data.qrCode
            secret.value = response.data.secret
          }
        } catch (error) {
          console.error('Error generating TOTP setup:', error)
          showAlert('danger', 'Failed to generate QR code. Please try again.')
        }
      }

      const verifyCode = async () => {
        try {
          if (!verificationCode.value || verificationCode.value.length !== 6) {
            showAlert('danger', 'Please enter a 6-digit verification code.')
            return
          }

          const response = await axios.post('/auth/mfa-verify-totp-setup', {
            secret: secret.value,
            token: verificationCode.value,
          })

          if (response.status === 200 && response.data.success) {
            showAlert('success', 'TOTP setup completed successfully!')
            setTimeout(() => {
              emit('completed')
            }, 1500)
          } else {
            showAlert('danger', 'Invalid verification code. Please try again.')
          }
        } catch (error) {
          console.error('Error verifying TOTP code:', error)
          showAlert('danger', 'Failed to verify code. Please try again.')
        }
      }

      onMounted(() => {
        generateTotpSetup()
      })

      return {
        qrCode,
        secret,
        verificationCode,
        alert,
        showAlert,
        clearAlert,
        verifyCode,
      }
    },
  }
</script>

<style scoped>
  .totp-setup-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background-color: #f8f9fa;
  }

  .card {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border: none;
  }

  .qr-code {
    max-width: 200px;
    height: auto;
  }

  .btn-close {
    float: right;
  }
</style>
