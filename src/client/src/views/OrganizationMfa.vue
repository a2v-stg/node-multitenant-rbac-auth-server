<template>
  <div class="organization-mfa-view">
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="mb-3">
            <i class="fas fa-shield-alt me-2"></i>Organization MFA Management
          </h2>
          <p class="text-muted">
            Configure two-factor authentication settings for all users in the
            organization. These settings apply to the default tenant and affect
            all local users.
          </p>
        </div>
      </div>

      <!-- Organization MFA Settings -->
      <div class="row">
        <div class="col-12">
          <OrganizationMfaSettings />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import OrganizationMfaSettings from '../components/OrganizationMfaSettings.vue'
  import axios from 'axios'

  export default {
    name: 'OrganizationMfa',
    components: {
      OrganizationMfaSettings,
    },
    setup() {
      const router = useRouter()

      const checkAuthentication = async () => {
        try {
          await axios.get('/auth/current-user')
        } catch (error) {
          console.log('Authentication check failed:', error.response?.status)
          if (error.response?.status === 401) {
            router.push('/login')
          }
        }
      }

      onMounted(() => {
        checkAuthentication()
      })
    },
  }
</script>

<style scoped>
  .organization-mfa-view {
    padding: 20px;
  }
</style>
