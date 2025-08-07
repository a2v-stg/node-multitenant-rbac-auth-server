<template>
  <AppLayout>
    <div class="tenant-management-container">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="h3 mb-0">Tenant Management</h1>
            <p class="text-muted mb-0">
              Manage system tenants and FDE configurations
            </p>
          </div>
          <div class="col-auto">
            <button
              v-if="isDefaultTenant"
              class="btn btn-primary"
              @click="showAddModal"
            >
              <i class="fas fa-plus me-2"></i>
              Add New Tenant
            </button>
          </div>
        </div>
      </div>

      <!-- Access Denied Message -->
      <div v-if="!isDefaultTenant" class="alert alert-warning">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Access Restricted:</strong> Tenant management is only available
        to users in the default tenant. You can only view and edit your current
        tenant information.
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading tenants...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <!-- Tenants List -->
      <div v-else class="container-fluid">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-building me-2"></i>
                  {{ isDefaultTenant ? 'All Tenants' : 'Current Tenant' }}
                </h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Tenant Name</th>
                        <th>Tenant ID</th>
                        <th>Environment</th>
                        <th>MFA Status</th>
                        <th>API Key</th>
                        <th>Callback URL</th>
                        <th>Modules</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="tenant in tenants" :key="tenant._id">
                        <td>
                          <strong>{{ tenant.tenantName }}</strong>
                        </td>
                        <td>
                          <code>{{ tenant.tenantId }}</code>
                        </td>
                        <td>
                          <span class="badge bg-info">{{
                            tenant.envName
                          }}</span>
                        </td>
                        <td>
                          <div
                            v-if="
                              tenant.mfaEnabled &&
                              tenant.mfaRequiredForLocalUsers
                            "
                            class="d-flex align-items-center"
                          >
                            <span class="badge bg-success me-2">
                              <i class="fas fa-shield-alt"></i> Enabled
                            </span>
                            <small class="text-muted">
                              {{ tenant.mfaMethods?.join(', ') || 'TOTP' }}
                            </small>
                          </div>
                          <div v-else class="d-flex align-items-center">
                            <span class="badge bg-secondary">
                              <i class="fas fa-times"></i> Disabled
                            </span>
                          </div>
                        </td>
                        <td>
                          <span v-if="tenant.apiKey" class="text-success">
                            <i class="fas fa-check-circle"></i> Configured
                          </span>
                          <span v-else class="text-muted">
                            <i class="fas fa-times-circle"></i> Not Set
                          </span>
                        </td>
                        <td>
                          <span
                            v-if="tenant.callbackUrl"
                            class="text-truncate d-inline-block"
                            style="max-width: 150px"
                            :title="tenant.callbackUrl"
                          >
                            {{ tenant.callbackUrl }}
                          </span>
                          <span v-else class="text-muted">-</span>
                        </td>
                        <td>
                          <div
                            v-if="
                              tenant.allowedModules &&
                              tenant.allowedModules.length > 0
                            "
                          >
                            <span
                              v-for="module in tenant.allowedModules.slice(
                                0,
                                2
                              )"
                              :key="module"
                              class="badge bg-secondary me-1"
                            >
                              {{ module }}
                            </span>
                            <span
                              v-if="tenant.allowedModules.length > 2"
                              class="badge bg-light text-dark"
                            >
                              +{{ tenant.allowedModules.length - 2 }}
                            </span>
                          </div>
                          <span v-else class="text-muted">-</span>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-primary"
                              @click="editTenant(tenant)"
                              :disabled="!canEditTenant(tenant)"
                            >
                              <i class="fas fa-edit"></i>
                            </button>
                            <button
                              v-if="
                                isDefaultTenant && tenant.tenantId !== 'default'
                              "
                              class="btn btn-outline-danger"
                              @click="deleteTenant(tenant)"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Empty State -->
                <div
                  v-if="!loading && !error && tenants.length === 0"
                  class="text-center py-5"
                >
                  <i class="fas fa-building fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No tenants found</h5>
                  <p class="text-muted">No tenants are available to display.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal fade" id="tenantModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditing ? 'Edit Tenant' : 'Add New Tenant' }}
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveTenant">
                <!-- Basic Information -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h6 class="text-primary mb-3">
                      <i class="fas fa-info-circle me-2"></i>Basic Information
                    </h6>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Tenant Name *</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="form.tenantName"
                        :disabled="isEditing"
                        required
                      />
                      <div class="form-text">
                        Unique identifier for the tenant
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Tenant ID *</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="form.tenantId"
                        :disabled="isEditing"
                        required
                      />
                      <div class="form-text">Unique tenant identifier</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Environment Name *</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="form.envName"
                        required
                      />
                      <div class="form-text">
                        Environment name (e.g., dev, staging, prod)
                      </div>
                    </div>
                  </div>
                </div>

                <!-- MFA Configuration -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h6 class="text-primary mb-3">
                      <i class="fas fa-shield-alt me-2"></i>Multi-Factor
                      Authentication
                    </h6>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="mfaEnabled"
                          v-model="form.mfaEnabled"
                        />
                        <label class="form-check-label" for="mfaEnabled">
                          <strong>Enable MFA for Local Users</strong>
                        </label>
                      </div>
                      <div class="form-text">
                        Require two-factor authentication for all local users in
                        this tenant
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="mfaRequiredForLocalUsers"
                          v-model="form.mfaRequiredForLocalUsers"
                          :disabled="!form.mfaEnabled"
                        />
                        <label
                          class="form-check-label"
                          for="mfaRequiredForLocalUsers"
                        >
                          <strong>Enforce MFA Requirement</strong>
                        </label>
                      </div>
                      <div class="form-text">
                        Force all local users to setup MFA on their next login
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">MFA Methods</label>
                      <select
                        class="form-select"
                        v-model="form.mfaMethods"
                        multiple
                        size="4"
                        :disabled="!form.mfaEnabled"
                      >
                        <option value="totp">TOTP (Authenticator App)</option>
                        <option value="sms">SMS</option>
                        <option value="voice">Voice Call</option>
                        <option value="email">Email</option>
                      </select>
                      <div class="form-text">
                        Select available MFA methods for users (Ctrl+click for
                        multiple)
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Grace Period (Days)</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model="form.mfaGracePeriod"
                        placeholder="7"
                        min="0"
                        max="30"
                        :disabled="!form.mfaEnabled"
                      />
                      <div class="form-text">
                        Number of days new users have to setup MFA (0 =
                        immediate)
                      </div>
                    </div>
                  </div>
                </div>

                <!-- API Configuration -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h6 class="text-primary mb-3">
                      <i class="fas fa-key me-2"></i>API Configuration
                    </h6>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">API Key</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="form.apiKey"
                        placeholder="Enter API key"
                      />
                      <div class="form-text">
                        API key for tenant authentication
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Shared Key</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="form.sharedKey"
                        placeholder="Enter shared key"
                      />
                      <div class="form-text">
                        Shared key for additional security
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Callback Configuration -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h6 class="text-primary mb-3">
                      <i class="fas fa-link me-2"></i>Callback Configuration
                    </h6>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Callback URL</label>
                      <input
                        type="url"
                        class="form-control"
                        v-model="form.callbackUrl"
                        placeholder="https://example.com/callback"
                      />
                      <div class="form-text">URL for receiving callbacks</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Callback Retries</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model="form.callbackRetries"
                        placeholder="3"
                        min="0"
                        max="10"
                      />
                      <div class="form-text">
                        Number of callback retry attempts
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Document Callback URL</label>
                      <input
                        type="url"
                        class="form-control"
                        v-model="form.documentCallbackUrl"
                        placeholder="https://example.com/document-callback"
                      />
                      <div class="form-text">
                        URL for document processing callbacks
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Rules Engine Configuration -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h6 class="text-primary mb-3">
                      <i class="fas fa-cogs me-2"></i>Rules Engine Configuration
                    </h6>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Rules Engine Host</label>
                      <input
                        type="url"
                        class="form-control"
                        v-model="form.rulesEngineHost"
                        placeholder="https://rules-engine.example.com"
                      />
                      <div class="form-text">Rules engine service host URL</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label"
                        >Rules Engine Access Token</label
                      >
                      <input
                        type="text"
                        class="form-control"
                        v-model="form.rulesEngineAccessToken"
                        placeholder="Enter access token"
                      />
                      <div class="form-text">Access token for rules engine</div>
                    </div>
                  </div>
                </div>

                <!-- Module Configuration -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h6 class="text-primary mb-3">
                      <i class="fas fa-puzzle-piece me-2"></i>Module
                      Configuration
                    </h6>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Allowed Modules</label>
                      <select
                        class="form-select"
                        v-model="form.allowedModules"
                        multiple
                        size="4"
                      >
                        <option value="socure">Socure</option>
                        <option value="doc-check">Document Validation</option>
                        <option value="doc-copilot-check">
                          Document Copilot Validation
                        </option>
                        <option value="lira-watch-list">LIRA Watchlist</option>
                        <option value="etran-watch-list">
                          ETran Watchlist
                        </option>
                        <option value="watch-list">UFP Watchlist</option>
                        <option value="do-not-pay">Do Not Pay</option>
                      </select>
                      <div class="form-text">
                        Select modules this tenant can access (Ctrl+click for
                        multiple)
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label"
                        >Allowed Socure Sub-Modules</label
                      >
                      <select
                        class="form-select"
                        v-model="form.allowedSocureSubModules"
                        multiple
                        size="4"
                      >
                        <option value="socure_identity">Socure Identity</option>
                        <option value="socure_risk">Socure Risk</option>
                        <option value="socure_fraud">Socure Fraud</option>
                        <option value="socure_compliance">
                          Socure Compliance
                        </option>
                      </select>
                      <div class="form-text">
                        Select Socure sub-modules (Ctrl+click for multiple)
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Event Configuration -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h6 class="text-primary mb-3">
                      <i class="fas fa-bell me-2"></i>Event Configuration
                    </h6>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Subscribe Events From</label>
                      <select
                        class="form-select"
                        v-model="form.subscribeEventsFrom"
                        multiple
                        size="4"
                      >
                        <option value="document_events">Document Events</option>
                        <option value="identity_events">Identity Events</option>
                        <option value="risk_events">Risk Events</option>
                        <option value="fraud_events">Fraud Events</option>
                        <option value="compliance_events">
                          Compliance Events
                        </option>
                      </select>
                      <div class="form-text">
                        Select event sources to subscribe to
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Selected Events</label>
                      <select
                        class="form-select"
                        v-model="form.selectedEvents"
                        multiple
                        size="4"
                      >
                        <option value="validation_started">
                          Validation Started
                        </option>
                        <option value="validation_completed">
                          Validation Completed
                        </option>
                        <option value="validation_failed">
                          Validation Failed
                        </option>
                        <option value="document_processed">
                          Document Processed
                        </option>
                        <option value="risk_assessment_completed">
                          Risk Assessment Completed
                        </option>
                      </select>
                      <div class="form-text">
                        Select specific events to receive
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Similarity Thresholds -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h6 class="text-primary mb-3">
                      <i class="fas fa-percentage me-2"></i>Similarity
                      Thresholds
                    </h6>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Top Face Similarity</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model="form.topFaceSimilarity"
                        placeholder="0.8"
                        min="0"
                        max="1"
                        step="0.1"
                      />
                      <div class="form-text">
                        Threshold for face similarity matching (0-1)
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Top Image Similarity</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model="form.topImageSimilarity"
                        placeholder="0.8"
                        min="0"
                        max="1"
                        step="0.1"
                      />
                      <div class="form-text">
                        Threshold for image similarity matching (0-1)
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveTenant"
                :disabled="saving"
              >
                <span
                  v-if="saving"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                {{ isEditing ? 'Update' : 'Create' }} Tenant
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal fade" id="deleteModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirm Delete</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div class="modal-body">
              <p>
                Are you sure you want to delete the tenant
                <strong>{{ tenantToDelete?.tenantName }}</strong
                >?
              </p>
              <p class="text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                This action cannot be undone. All associated data will be
                permanently removed.
              </p>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-danger"
                @click="confirmDelete"
                :disabled="deleting"
              >
                <span
                  v-if="deleting"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                Delete Tenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
  import { ref, computed, onMounted } from 'vue'
  import axios from 'axios'
  import AppLayout from '../components/AppLayout.vue'
  import { Modal } from 'bootstrap'

  export default {
    name: 'TenantManagement',
    components: {
      AppLayout,
    },
    setup() {
      const tenants = ref([])
      const loading = ref(false)
      const error = ref(null)
      const saving = ref(false)
      const deleting = ref(false)
      const isEditing = ref(false)
      const tenantToDelete = ref(null)
      const currentTenant = ref(null)

      const form = ref({
        tenantName: '',
        tenantId: '',
        envName: '',
        apiKey: '',
        sharedKey: '',
        callbackUrl: '',
        callbackRetries: '',
        allowedModules: [],
        allowedSocureSubModules: [],
        rulesEngineHost: '',
        rulesEngineAccessToken: '',
        callbackEndpoint: '',
        subscribeEventsFrom: [],
        selectedEvents: [],
        documentCallbackUrl: '',
        topFaceSimilarity: 0.8,
        topImageSimilarity: 0.8,
        // MFA Configuration
        mfaEnabled: false,
        mfaRequiredForLocalUsers: false,
        mfaMethods: ['totp'],
        mfaGracePeriod: 0,
      })

      const isDefaultTenant = computed(() => {
        return currentTenant.value?.tenantId === 'default'
      })

      const loadTenants = async () => {
        loading.value = true
        error.value = null

        try {
          const response = await axios.get('/api/tenants')
          tenants.value = response.data.data
        } catch (err) {
          console.error('Error loading tenants:', err)
          if (err.response?.status === 401) {
            // Redirect to login if not authenticated
            window.location.href = '/login'
            return
          } else if (err.response?.status === 403) {
            // If not default tenant, load only current tenant
            const currentResponse = await axios.get('/api/current-tenant')
            tenants.value = [currentResponse.data.data]
          } else {
            error.value = err.response?.data?.error || 'Failed to load tenants'
          }
        } finally {
          loading.value = false
        }
      }

      const loadCurrentTenant = async () => {
        try {
          const response = await axios.get('/api/current-tenant')
          currentTenant.value = response.data.data
        } catch (err) {
          console.error('Error loading current tenant:', err)
          if (err.response?.status === 401) {
            throw new Error('Not authenticated')
          }
          throw err
        }
      }

      const showAddModal = () => {
        isEditing.value = false
        form.value = {
          tenantName: '',
          tenantId: '',
          envName: '',
          apiKey: '',
          sharedKey: '',
          callbackUrl: '',
          callbackRetries: '',
          allowedModules: [],
          allowedSocureSubModules: [],
          rulesEngineHost: '',
          rulesEngineAccessToken: '',
          callbackEndpoint: '',
          subscribeEventsFrom: [],
          selectedEvents: [],
          documentCallbackUrl: '',
          topFaceSimilarity: 0.8,
          topImageSimilarity: 0.8,
          // MFA Configuration
          mfaEnabled: false,
          mfaRequiredForLocalUsers: false,
          mfaMethods: ['totp'],
          mfaGracePeriod: 0,
        }
        // Show modal using Bootstrap
        const modalElement = document.getElementById('tenantModal')
        if (modalElement) {
          const modal = new Modal(modalElement)
          modal.show()
        }
      }

      const editTenant = tenant => {
        isEditing.value = true
        form.value = {
          tenantName: tenant.tenantName || '',
          tenantId: tenant.tenantId || '',
          envName: tenant.envName || '',
          apiKey: tenant.apiKey || '',
          sharedKey: tenant.sharedKey || '',
          callbackUrl: tenant.callbackUrl || '',
          callbackRetries: tenant.callbackRetries || '',
          allowedModules: tenant.allowedModules || [],
          allowedSocureSubModules: tenant.allowedSocureSubModules || [],
          rulesEngineHost: tenant.rulesEngineHost || '',
          rulesEngineAccessToken: tenant.rulesEngineAccessToken || '',
          callbackEndpoint: tenant.callbackEndpoint || '',
          subscribeEventsFrom: tenant.subscribeEventsFrom || [],
          selectedEvents: tenant.selectedEvents || [],
          documentCallbackUrl: tenant.documentCallbackUrl || '',
          topFaceSimilarity: tenant.topFaceSimilarity || 0.8,
          topImageSimilarity: tenant.topImageSimilarity || 0.8,
          // MFA Configuration
          mfaEnabled: tenant.mfaEnabled || false,
          mfaRequiredForLocalUsers: tenant.mfaRequiredForLocalUsers || false,
          mfaMethods: tenant.mfaMethods || ['totp'],
          mfaGracePeriod: tenant.mfaGracePeriod || 0,
        }
        // Show modal using Bootstrap
        const modalElement = document.getElementById('tenantModal')
        if (modalElement) {
          const modal = new Modal(modalElement)
          modal.show()
        }
      }

      const saveTenant = async () => {
        saving.value = true

        try {
          const tenantData = {
            tenantName: form.value.tenantName,
            tenantId: form.value.tenantId,
            envName: form.value.envName,
            apiKey: form.value.apiKey,
            sharedKey: form.value.sharedKey,
            callbackUrl: form.value.callbackUrl,
            callbackRetries: form.value.callbackRetries,
            allowedModules: form.value.allowedModules,
            allowedSocureSubModules: form.value.allowedSocureSubModules,
            rulesEngineHost: form.value.rulesEngineHost,
            rulesEngineAccessToken: form.value.rulesEngineAccessToken,
            callbackEndpoint: form.value.callbackEndpoint,
            subscribeEventsFrom: form.value.subscribeEventsFrom,
            selectedEvents: form.value.selectedEvents,
            documentCallbackUrl: form.value.documentCallbackUrl,
            topFaceSimilarity: parseFloat(form.value.topFaceSimilarity) || 0.8,
            topImageSimilarity:
              parseFloat(form.value.topImageSimilarity) || 0.8,
            // MFA Configuration
            mfaEnabled: form.value.mfaEnabled,
            mfaRequiredForLocalUsers: form.value.mfaRequiredForLocalUsers,
            mfaMethods: form.value.mfaMethods,
            mfaGracePeriod: parseInt(form.value.mfaGracePeriod) || 0,
          }

          if (isEditing.value) {
            // Find the tenant to update
            const tenant = tenants.value.find(
              t => t.tenantId === form.value.tenantId
            )
            if (!tenant) {
              throw new Error('Tenant not found')
            }

            await axios.put(`/api/tenants/${tenant._id}`, tenantData)
          } else {
            await axios.post('/api/tenants', tenantData)
          }

          // Reload tenants
          await loadTenants()

          // Hide modal
          const modalElement = document.getElementById('tenantModal')
          if (modalElement) {
            const modal = Modal.getInstance(modalElement)
            if (modal) modal.hide()
          }

          alert(
            isEditing.value
              ? 'Tenant updated successfully!'
              : 'Tenant created successfully!'
          )
        } catch (err) {
          console.error('Error saving tenant:', err)
          alert(err.response?.data?.error || 'Failed to save tenant')
        } finally {
          saving.value = false
        }
      }

      const deleteTenant = tenant => {
        tenantToDelete.value = tenant
        const modalElement = document.getElementById('deleteModal')
        if (modalElement) {
          const modal = new Modal(modalElement)
          modal.show()
        }
      }

      const confirmDelete = async () => {
        deleting.value = true

        try {
          await axios.delete(`/api/tenants/${tenantToDelete.value._id}`)

          // Reload tenants
          await loadTenants()

          // Hide modal
          const modalElement = document.getElementById('deleteModal')
          if (modalElement) {
            const modal = Modal.getInstance(modalElement)
            if (modal) modal.hide()
          }

          alert('Tenant deleted successfully!')
        } catch (err) {
          console.error('Error deleting tenant:', err)
          alert(err.response?.data?.error || 'Failed to delete tenant')
        } finally {
          deleting.value = false
        }
      }

      const canEditTenant = tenant => {
        return (
          isDefaultTenant.value ||
          tenant.tenantId === currentTenant.value?.tenantId
        )
      }

      onMounted(async () => {
        try {
          // First check if user is authenticated
          await loadCurrentTenant()
          // Then load data
          await loadTenants()
        } catch (err) {
          console.error('Error in component initialization:', err)
          // Redirect to login if not authenticated
          window.location.href = '/login'
        }
      })

      return {
        tenants,
        loading,
        error,
        saving,
        deleting,
        isEditing,
        tenantToDelete,
        currentTenant,
        form,
        isDefaultTenant,
        loadTenants,
        showAddModal,
        editTenant,
        saveTenant,
        deleteTenant,
        confirmDelete,
        canEditTenant,
      }
    },
  }
</script>

<style scoped>
  .tenant-management-container {
    background-color: #f8f9fa;
  }

  .table th {
    font-weight: 600;
    color: #495057;
  }

  .btn-group .btn {
    margin-right: 0.25rem;
  }

  .btn-group .btn:last-child {
    margin-right: 0;
  }

  .modal-body .form-label {
    font-weight: 600;
    color: #495057;
  }

  .form-text {
    font-size: 0.875rem;
    color: #6c757d;
  }

  .modal-xl {
    max-width: 1200px;
  }

  .text-truncate {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    font-size: 0.75rem;
  }

  .form-check-input:checked {
    background-color: #007bff;
    border-color: #007bff;
  }
</style>
