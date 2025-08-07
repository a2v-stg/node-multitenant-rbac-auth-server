<template>
  <div class="mfa-view">
    <div
      v-if="loading"
      class="d-flex justify-content-center align-items-center min-vh-100"
    >
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading MFA options...</p>
      </div>
    </div>
    <MfaOptions v-else :user="user" :isLoginFlow="isLoginFlow" />
  </div>
</template>

<script>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import MfaOptions from '../components/MfaOptions.vue'
  import axios from 'axios'
  import logger from '../utils/logger.js'

  export default {
    name: 'Mfa',
    components: {
      MfaOptions,
    },
    setup() {
      const router = useRouter()
      const route = useRoute()
      const user = ref(null)
      const isLoginFlow = ref(false)
      const loading = ref(true)

      const loadUserData = async () => {
        let retries = 0
        const maxRetries = 3

        while (retries < maxRetries) {
          try {
            logger.mfa('Loading user data... (attempt', retries + 1, ')')
            const response = await axios.get('/auth/current-user')
            user.value = response.data.user
            logger.mfa('User data loaded:', user.value?.email)
            logger.mfa('MFA Setup Completed:', user.value?.mfaSetupCompleted)
            logger.mfa('MFA Method:', user.value?.mfaMethod)

            // Check if this is a login flow by looking for MFA session
            // or if the user has MFA configured and we're coming from login
            if (user.value?.mfaSetupCompleted && user.value?.mfaMethod) {
              isLoginFlow.value = true
              logger.mfa('Set isLoginFlow to true (user has MFA configured)')
            } else {
              logger.mfa(
                'User does not have MFA configured, redirecting to setup'
              )
              router.push('/mfa-setup')
            }
            loading.value = false
            break // Success, exit loop
          } catch (error) {
            retries++
            logger.error(
              'Error loading user data (attempt',
              retries,
              '):',
              error.response?.status,
              error.response?.data
            )

            if (retries >= maxRetries) {
              logger.error(
                'Failed to load user data after',
                maxRetries,
                'retries'
              )
              // For login flow, we might not have a current user yet
              // Check if we have MFA session data
              if (route.query.login === 'true' || route.query.mfa === 'true') {
                isLoginFlow.value = true
                logger.mfa('Set isLoginFlow to true (from route query)')
                // Try to get user from session or create a minimal user object
                user.value = {
                  email: 'user@example.com', // This will be overridden by actual session data
                  username: 'user@example.com',
                  mfaSetupCompleted: true,
                  mfaMethod: 'totp', // Default method
                  phoneNumber: null,
                  countryCode: '+1',
                }
              } else {
                // Redirect to login if not authenticated
                logger.mfa('Redirecting to login')
                router.push('/login')
              }
              loading.value = false
            } else {
              // Wait before retry
              logger.mfa('Waiting 1 second before retry...')
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
      }

      onMounted(() => {
        loadUserData()
      })

      return {
        user,
        isLoginFlow,
        loading,
      }
    },
  }
</script>

<style scoped>
  .mfa-view {
    min-height: 100vh;
    background-color: #f8f9fa;
  }
</style>
