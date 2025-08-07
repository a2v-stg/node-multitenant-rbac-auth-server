<template>
  <AppLayout>
    <div class="settings-container">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="h3 mb-0">Settings</h1>
            <p class="text-muted mb-0">
              Manage organization configuration and system settings
            </p>
          </div>
          <div class="col-auto">
            <div class="btn-group">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="btn"
                :class="
                  activeTab === tab.key ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="activeTab = tab.key"
              >
                <i :class="tab.icon" class="me-2"></i>
                {{ tab.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container-fluid">
        <!-- User Settings Tab -->
        <div v-if="activeTab === 'user'" class="tab-content">
          <UserSettings />
        </div>

        <!-- Organization Settings Tab -->
        <div v-if="activeTab === 'organization'" class="tab-content">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Organization Configuration</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveOrganizationSettings">
                <div class="row">
                  <div class="col-md-6">
                    <h6 class="mb-3">Basic Information</h6>
                    <div class="mb-3">
                      <label class="form-label">Organization Name</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="orgSettings.name"
                        required
                      >
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Description</label>
                      <textarea 
                        class="form-control" 
                        v-model="orgSettings.description"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h6 class="mb-3">Security Settings</h6>
                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="mfaEnabled"
                          v-model="orgSettings.mfaEnabled"
                        >
                        <label class="form-check-label" for="mfaEnabled">
                          Enable MFA for all users
                        </label>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">MFA Grace Period (days)</label>
                      <input 
                        type="number" 
                        class="form-control" 
                        v-model="orgSettings.mfaGracePeriod"
                        min="0"
                        max="365"
                      >
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Session Timeout (hours)</label>
                      <input 
                        type="number" 
                        class="form-control" 
                        v-model="orgSettings.sessionTimeout"
                        min="1"
                        max="168"
                      >
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <h6 class="mb-3">Password Policy</h6>
                    <div class="mb-3">
                      <label class="form-label">Minimum Password Length</label>
                      <input 
                        type="number" 
                        class="form-control" 
                        v-model="orgSettings.passwordPolicy.minLength"
                        min="6"
                        max="50"
                      >
                    </div>
                    <div class="mb-3">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="requireUppercase"
                          v-model="orgSettings.passwordPolicy.requireUppercase"
                        >
                        <label class="form-check-label" for="requireUppercase">
                          Require uppercase letters
                        </label>
                      </div>
                    </div>
                    <div class="mb-3">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="requireLowercase"
                          v-model="orgSettings.passwordPolicy.requireLowercase"
                        >
                        <label class="form-check-label" for="requireLowercase">
                          Require lowercase letters
                        </label>
                      </div>
                    </div>
                    <div class="mb-3">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="requireNumbers"
                          v-model="orgSettings.passwordPolicy.requireNumbers"
                        >
                        <label class="form-check-label" for="requireNumbers">
                          Require numbers
                        </label>
                      </div>
                    </div>
                    <div class="mb-3">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="requireSpecialChars"
                          v-model="orgSettings.passwordPolicy.requireSpecialChars"
                        >
                        <label class="form-check-label" for="requireSpecialChars">
                          Require special characters
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h6 class="mb-3">Audit & Logging</h6>
                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="auditLoggingEnabled"
                          v-model="orgSettings.auditLogging.enabled"
                        >
                        <label class="form-check-label" for="auditLoggingEnabled">
                          Enable audit logging
                        </label>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Audit Log Retention (days)</label>
                      <input 
                        type="number" 
                        class="form-control" 
                        v-model="orgSettings.auditLogging.retentionDays"
                        min="1"
                        max="3650"
                      >
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Max Login Attempts</label>
                      <input 
                        type="number" 
                        class="form-control" 
                        v-model="orgSettings.maxLoginAttempts"
                        min="1"
                        max="20"
                      >
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Lockout Duration (minutes)</label>
                      <input 
                        type="number" 
                        class="form-control" 
                        v-model="orgSettings.lockoutDuration"
                        min="1"
                        max="1440"
                      >
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-12">
                    <h6 class="mb-3">Feature Flags</h6>
                    <div class="row">
                      <div class="col-md-4">
                        <div class="form-check form-switch">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            id="featureMfa"
                            v-model="orgSettings.features.mfa"
                          >
                          <label class="form-check-label" for="featureMfa">
                            Multi-Factor Authentication
                          </label>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-check form-switch">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            id="featureSso"
                            v-model="orgSettings.features.sso"
                          >
                          <label class="form-check-label" for="featureSso">
                            Single Sign-On (SSO)
                          </label>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-check form-switch">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            id="featureAuditLogging"
                            v-model="orgSettings.features.auditLogging"
                          >
                          <label class="form-check-label" for="featureAuditLogging">
                            Audit Logging
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-4">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <i class="fas fa-save me-2"></i>
                    {{ loading ? 'Saving...' : 'Save Settings' }}
                  </button>
                  <button type="button" class="btn btn-secondary ms-2" @click="resetSettings">
                    Reset to Defaults
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- System Settings Tab -->
        <div v-if="activeTab === 'system'" class="tab-content">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">System Configuration</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6 class="mb-3">Database Settings</h6>
                  <div class="mb-3">
                    <label class="form-label">Database Connection</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="systemSettings.database.connection"
                      readonly
                    >
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Database Name</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="systemSettings.database.name"
                      readonly
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <h6 class="mb-3">Application Settings</h6>
                  <div class="mb-3">
                    <label class="form-label">Environment</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="systemSettings.environment"
                      readonly
                    >
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Version</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="systemSettings.version"
                      readonly
                    >
                  </div>
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
import AppLayout from '../components/AppLayout.vue'
import UserSettings from '../components/UserSettings.vue'

export default {
  name: 'Settings',
  components: {
    AppLayout,
    UserSettings,
  },
  setup() {
    const activeTab = ref('user')
    const loading = ref(false)
    
    // Tab configuration
    const tabs = [
      { key: 'user', label: 'User Settings', icon: 'fas fa-user-cog' },
      { key: 'organization', label: 'Organization', icon: 'fas fa-building' },
      { key: 'system', label: 'System', icon: 'fas fa-cog' }
    ]

    // Organization settings
    const orgSettings = ref({
      name: '',
      description: '',
      mfaEnabled: false,
      mfaGracePeriod: 0,
      sessionTimeout: 24,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
      },
      auditLogging: {
        enabled: true,
        retentionDays: 90
      },
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      features: {
        mfa: true,
        sso: false,
        auditLogging: true,
        userManagement: true
      }
    })

    // System settings
    const systemSettings = ref({
      environment: '',
      version: '',
      database: {
        connection: '',
        name: ''
      }
    })

    // Load settings
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings', {
          credentials: 'include'
        })
        const data = await response.json()
        if (data.success) {
          if (data.data.organization) {
            orgSettings.value = { ...orgSettings.value, ...data.data.organization }
          }
          if (data.data.system) {
            systemSettings.value = { ...systemSettings.value, ...data.data.system }
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    // Save organization settings
    const saveOrganizationSettings = async () => {
      loading.value = true
      try {
        const response = await fetch('/api/settings/organization', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(orgSettings.value)
        })

        const data = await response.json()
        if (data.success) {
          alert('Settings saved successfully!')
        } else {
          alert('Error saving settings: ' + data.error)
        }
      } catch (error) {
        console.error('Error saving settings:', error)
        alert('Error saving settings')
      } finally {
        loading.value = false
      }
    }

    // Reset settings to defaults
    const resetSettings = () => {
      if (confirm('Are you sure you want to reset all settings to defaults?')) {
        orgSettings.value = {
          name: 'Default Organization',
          description: 'Default organization configuration',
          mfaEnabled: false,
          mfaGracePeriod: 0,
          sessionTimeout: 24,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
          },
          auditLogging: {
            enabled: true,
            retentionDays: 90
          },
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          features: {
            mfa: true,
            sso: false,
            auditLogging: true,
            userManagement: true
          }
        }
      }
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      activeTab,
      tabs,
      loading,
      orgSettings,
      systemSettings,
      saveOrganizationSettings,
      resetSettings
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding: 2rem;
}

.tab-content {
  margin-top: 1rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.form-switch .form-check-input {
  width: 3em;
}
</style>
