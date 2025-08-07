<template>
  <AppLayout>
    <div class="user-management-container">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="h3 mb-0">User Management</h1>
            <p class="text-muted mb-0">
              Manage users and their roles for the current tenant
            </p>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="showAddModal">
              <i class="fas fa-plus me-2"></i>
              Add New User
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading users...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <!-- Users List -->
      <div v-else class="container-fluid">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-users me-2"></i>
                  Users
                </h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Roles</th>
                        <th>Tenants</th>
                        <th>Last Login</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="user in users" :key="user._id">
                        <td>
                          <strong>{{ user.fullName }}</strong>
                        </td>
                        <td>{{ user.email }}</td>
                        <td>
                          <span
                            :class="
                              user.isActive
                                ? 'badge bg-success'
                                : 'badge bg-secondary'
                            "
                          >
                            {{ user.isActive ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td>
                          <div v-if="user.roles && user.roles.length > 0">
                            <span
                              v-for="role in user.roles"
                              :key="role._id"
                              class="badge bg-primary me-1"
                            >
                              {{ role.name }}
                            </span>
                          </div>
                          <span v-else class="text-muted">No roles</span>
                        </td>
                        <td>
                          <div v-if="user.tenants && user.tenants.length > 0">
                            <span
                              v-for="tenant in user.tenants"
                              :key="tenant.tenantId"
                              class="badge bg-success me-1"
                            >
                              {{ tenant.tenantName }}
                            </span>
                          </div>
                          <span v-else class="text-muted">No tenants</span>
                        </td>
                        <td>{{ formatDate(user.lastLogin) }}</td>
                        <td>{{ formatDate(user.createdAt) }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-primary"
                              @click="editUser(user)"
                            >
                              <i class="fas fa-edit"></i>
                            </button>
                            <button
                              class="btn btn-outline-info"
                              @click="manageTenants(user)"
                              title="Manage Tenants"
                            >
                              <i class="fas fa-building"></i>
                            </button>
                            <button
                              class="btn btn-outline-danger"
                              @click="deleteUser(user)"
                              :disabled="user._id === currentUserId"
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
                  v-if="!loading && !error && users.length === 0"
                  class="text-center py-5"
                >
                  <i class="fas fa-users fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No users found</h5>
                  <p class="text-muted">No users are available to display.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal fade" id="userModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditing ? 'Edit User' : 'Add New User' }}
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveUser">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Full Name *</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="form.fullName"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Email *</label>
                      <input
                        type="email"
                        class="form-control"
                        v-model="form.email"
                        :disabled="isEditing"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label"
                        >Password
                        {{
                          isEditing ? '(leave blank to keep current)' : '*'
                        }}</label
                      >
                      <input
                        type="password"
                        class="form-control"
                        v-model="form.password"
                        :required="!isEditing"
                      />
                      <div class="form-text">
                        {{
                          isEditing
                            ? 'Leave blank to keep the current password'
                            : 'Minimum 8 characters'
                        }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <div class="form-check">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          v-model="form.isActive"
                          id="isActive"
                        />
                        <label class="form-check-label" for="isActive">
                          Active
                        </label>
                      </div>
                      <div class="form-text">Enable or disable this user</div>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Roles</label>
                  <div class="row">
                    <div
                      v-for="role in availableRoles"
                      :key="role._id"
                      class="col-md-4 mb-2"
                    >
                      <div class="form-check">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          :value="role._id"
                          v-model="form.roles"
                          :id="'role-' + role._id"
                        />
                        <label
                          class="form-check-label"
                          :for="'role-' + role._id"
                        >
                          {{ role.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                  <div v-if="availableRoles.length === 0" class="text-muted">
                    No roles available for this tenant
                  </div>
                </div>

                <!-- Tenant Assignment (only for new users) -->
                <div v-if="!isEditing" class="mb-3">
                  <label class="form-label">Assign to Tenants</label>
                  <div class="row">
                    <div
                      v-for="tenant in availableTenantsForAssignment"
                      :key="tenant.tenantId"
                      class="col-md-6 mb-2"
                    >
                      <div class="form-check">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          :value="tenant.tenantId"
                          v-model="form.assignedTenants"
                          :id="'tenant-' + tenant.tenantId"
                        />
                        <label
                          class="form-check-label"
                          :for="'tenant-' + tenant.tenantId"
                        >
                          <strong>{{ tenant.tenantName }}</strong>
                          <br />
                          <small class="text-muted">{{ tenant.envName }}</small>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="availableTenantsForAssignment.length === 0"
                    class="text-muted"
                  >
                    <i class="fas fa-info-circle me-2"></i>
                    No additional tenants available for assignment
                  </div>
                  <div class="form-text">
                    Select the tenants this user should be assigned to. The user
                    will be automatically assigned to the current tenant.
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
                @click="saveUser"
                :disabled="saving"
              >
                <span
                  v-if="saving"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                {{ isEditing ? 'Update' : 'Create' }} User
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
                Are you sure you want to delete the user
                <strong>{{ userToDelete?.fullName }}</strong
                >?
              </p>
              <p class="text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                This action cannot be undone. The user will be removed from this
                tenant.
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
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tenant Management Modal -->
      <div class="modal fade" id="tenantModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                Manage Tenants for {{ selectedUser?.fullName }}
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div class="modal-body">
              <!-- Loading State -->
              <div v-if="tenantLoading" class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading tenant data...</p>
              </div>

              <!-- Error State -->
              <div v-else-if="tenantError" class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ tenantError }}
              </div>

              <!-- Tenant Management Content -->
              <div v-else>
                <!-- Current Tenants -->
                <div class="mb-4">
                  <h6 class="fw-bold mb-3">
                    <i class="fas fa-building me-2"></i>
                    Current Tenants
                  </h6>
                  <div v-if="userTenants.length > 0">
                    <div class="row">
                      <div
                        v-for="tenant in userTenants"
                        :key="tenant.tenantId"
                        class="col-md-6 mb-2"
                      >
                        <div class="card border-success">
                          <div class="card-body py-2">
                            <div
                              class="d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <strong>{{ tenant.tenantName }}</strong>
                                <br />
                                <small class="text-muted">{{
                                  tenant.envName
                                }}</small>
                              </div>
                              <button
                                class="btn btn-sm btn-outline-danger"
                                @click="removeTenant(tenant)"
                                :disabled="removingTenant"
                              >
                                <i class="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    No tenants assigned
                  </div>
                </div>

                <!-- Available Tenants -->
                <div>
                  <h6 class="fw-bold mb-3">
                    <i class="fas fa-plus me-2"></i>
                    Available Tenants
                  </h6>
                  <div v-if="availableTenants.length > 0">
                    <div class="row">
                      <div
                        v-for="tenant in availableTenants"
                        :key="tenant.tenantId"
                        class="col-md-6 mb-2"
                      >
                        <div class="card border-light">
                          <div class="card-body py-2">
                            <div
                              class="d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <strong>{{ tenant.tenantName }}</strong>
                                <br />
                                <small class="text-muted">{{
                                  tenant.envName
                                }}</small>
                              </div>
                              <button
                                class="btn btn-sm btn-outline-success"
                                @click="assignTenant(tenant)"
                                :disabled="assigningTenant"
                              >
                                <i class="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    No available tenants to assign
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
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
    name: 'UserManagement',
    components: {
      AppLayout,
    },
    setup() {
      const users = ref([])
      const availableRoles = ref([])
      const loading = ref(false)
      const error = ref(null)
      const saving = ref(false)
      const deleting = ref(false)
      const isEditing = ref(false)
      const userToDelete = ref(null)
      const currentUserId = ref(null)

      // Tenant management
      const selectedUser = ref(null)
      const userTenants = ref([])
      const availableTenants = ref([])
      const tenantLoading = ref(false)
      const tenantError = ref(null)
      const assigningTenant = ref(false)
      const removingTenant = ref(false)

      // Available tenants for new user assignment
      const availableTenantsForAssignment = ref([])

      // Current user and tenant info
      const currentUser = ref(null)
      const currentTenant = ref(null)

      const form = ref({
        fullName: '',
        email: '',
        password: '',
        isActive: true,
        roles: [],
        assignedTenants: [],
      })

      const loadUsers = async () => {
        loading.value = true
        error.value = null

        try {
          const response = await axios.get('/api/users')
          const usersData = response.data.data

          // Load tenant information for each user
          const usersWithTenants = await Promise.all(
            usersData.map(async user => {
              try {
                const tenantResponse = await axios.get(
                  `/api/users/${user._id}/tenants`
                )
                return {
                  ...user,
                  tenants: tenantResponse.data.data || [],
                }
              } catch (err) {
                console.error(
                  `Error loading tenants for user ${user._id}:`,
                  err
                )
                return {
                  ...user,
                  tenants: [],
                }
              }
            })
          )

          users.value = usersWithTenants
        } catch (err) {
          console.error('Error loading users:', err)
          if (err.response?.status === 401) {
            // Redirect to login if not authenticated
            window.location.href = '/login'
            return
          }
          error.value = err.response?.data?.error || 'Failed to load users'
        } finally {
          loading.value = false
        }
      }

      const loadRoles = async () => {
        try {
          const response = await axios.get('/api/users/roles')
          availableRoles.value = response.data.data || []
        } catch (err) {
          console.error('Error loading roles:', err)
          if (err.response?.status === 401) {
            // Redirect to login if not authenticated
            window.location.href = '/login'
            return
          }
          // Fallback to empty array if roles API fails
          availableRoles.value = []
        }
      }

      const loadAvailableTenantsForAssignment = async () => {
        try {
          const response = await axios.get('/api/tenants/available')
          const allTenants = response.data.data || []

          // Filter out the current tenant since user will be automatically assigned to it
          const currentTenantId = currentTenant.value?.tenantId || 'default'
          availableTenantsForAssignment.value = allTenants.filter(
            tenant => tenant.tenantId !== currentTenantId
          )
        } catch (err) {
          console.error('Error loading available tenants for assignment:', err)
          if (err.response?.status === 401) {
            // Redirect to login if not authenticated
            window.location.href = '/login'
            return
          }
          // Fallback to empty array if tenants API fails
          availableTenantsForAssignment.value = []
        }
      }

      const loadCurrentUser = async () => {
        try {
          const response = await axios.get('/auth/current-user')
          currentUser.value = response.data.user
          currentTenant.value = response.data.tenant
          currentUserId.value = response.data.user._id
        } catch (err) {
          console.error('Error loading current user:', err)
          if (err.response?.status === 401) {
            throw new Error('Not authenticated')
          }
          throw err
        }
      }

      const showAddModal = async () => {
        isEditing.value = false
        form.value = {
          fullName: '',
          email: '',
          password: '',
          isActive: true,
          roles: [],
          assignedTenants: [],
        }

        // Load available tenants for assignment
        await loadAvailableTenantsForAssignment()

        // Show modal using Bootstrap
        const modalElement = document.getElementById('userModal')
        if (modalElement) {
          const modal = new Modal(modalElement)
          modal.show()
        }
      }

      const editUser = user => {
        isEditing.value = true
        form.value = {
          fullName: user.fullName,
          email: user.email,
          password: '',
          isActive: user.isActive,
          roles: user.roles.map(role => role._id),
        }
        // Show modal using Bootstrap
        const modalElement = document.getElementById('userModal')
        if (modalElement) {
          const modal = new Modal(modalElement)
          modal.show()
        }
      }

      const saveUser = async () => {
        saving.value = true

        try {
          const userData = {
            fullName: form.value.fullName,
            email: form.value.email,
            isActive: form.value.isActive,
            roles: form.value.roles,
          }

          // Only include password if provided (for editing) or required (for creating)
          if (!isEditing.value || form.value.password) {
            userData.password = form.value.password
          }

          if (isEditing.value) {
            // Find the user to update
            const user = users.value.find(u => u.email === form.value.email)
            if (!user) {
              throw new Error('User not found')
            }

            await axios.put(`/api/users/${user._id}`, userData)
          } else {
            // Get current tenant ID for user creation
            const currentTenantId = currentTenant.value?.tenantId || 'default'
            userData.tenantId = currentTenantId

            // Create new user
            const createResponse = await axios.post('/api/users', userData)
            const newUser = createResponse.data.data

            // Assign user to selected tenants
            if (
              form.value.assignedTenants &&
              form.value.assignedTenants.length > 0
            ) {
              for (const tenantId of form.value.assignedTenants) {
                try {
                  await axios.post(`/api/users/${newUser._id}/assign-tenant`, {
                    tenantId: tenantId,
                  })
                } catch (err) {
                  console.error(
                    `Error assigning user to tenant ${tenantId}:`,
                    err
                  )
                  // Continue with other tenant assignments even if one fails
                }
              }
            }
          }

          // Reload users
          await loadUsers()

          // Hide modal
          const modalElement = document.getElementById('userModal')
          if (modalElement) {
            const modal = Modal.getInstance(modalElement)
            if (modal) modal.hide()
          }

          alert(
            isEditing.value
              ? 'User updated successfully!'
              : 'User created successfully!'
          )
        } catch (err) {
          console.error('Error saving user:', err)
          alert(err.response?.data?.error || 'Failed to save user')
        } finally {
          saving.value = false
        }
      }

      const deleteUser = user => {
        userToDelete.value = user
        const modalElement = document.getElementById('deleteModal')
        if (modalElement) {
          const modal = new Modal(modalElement)
          modal.show()
        }
      }

      const confirmDelete = async () => {
        deleting.value = true

        try {
          await axios.delete(`/api/users/${userToDelete.value._id}`)

          // Reload users
          await loadUsers()

          // Hide modal
          const modalElement = document.getElementById('deleteModal')
          if (modalElement) {
            const modal = Modal.getInstance(modalElement)
            if (modal) modal.hide()
          }

          alert('User removed from tenant successfully!')
        } catch (err) {
          console.error('Error deleting user:', err)
          alert(err.response?.data?.error || 'Failed to delete user')
        } finally {
          deleting.value = false
        }
      }

      const formatDate = dateString => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleString()
      }

      // Tenant management methods
      const manageTenants = async user => {
        selectedUser.value = user
        tenantLoading.value = true
        tenantError.value = null

        try {
          // Load user's current tenants
          const userTenantsResponse = await axios.get(
            `/api/users/${user._id}/tenants`
          )
          userTenants.value = userTenantsResponse.data.data || []

          // Load available tenants
          const availableTenantsResponse = await axios.get(
            '/api/tenants/available'
          )
          const allTenants = availableTenantsResponse.data.data || []

          // Filter out tenants that the user is already assigned to
          const assignedTenantIds = userTenants.value.map(t => t.tenantId)
          availableTenants.value = allTenants.filter(
            tenant => !assignedTenantIds.includes(tenant.tenantId)
          )

          // Show modal
          const modalElement = document.getElementById('tenantModal')
          if (modalElement) {
            const modal = new Modal(modalElement)
            modal.show()
          }
        } catch (err) {
          console.error('Error loading tenant data:', err)
          if (err.response?.status === 401) {
            window.location.href = '/login'
            return
          }
          tenantError.value =
            err.response?.data?.error || 'Failed to load tenant data'
        } finally {
          tenantLoading.value = false
        }
      }

      const assignTenant = async tenant => {
        assigningTenant.value = true

        try {
          await axios.post(
            `/api/users/${selectedUser.value._id}/assign-tenant`,
            {
              tenantId: tenant.tenantId,
            }
          )

          // Move tenant from available to user tenants
          userTenants.value.push(tenant)
          availableTenants.value = availableTenants.value.filter(
            t => t.tenantId !== tenant.tenantId
          )

          // Update the user in the main users list
          const userIndex = users.value.findIndex(
            u => u._id === selectedUser.value._id
          )
          if (userIndex !== -1) {
            users.value[userIndex].tenants.push(tenant)
          }

          alert(`User assigned to ${tenant.tenantName} successfully!`)
        } catch (err) {
          console.error('Error assigning tenant:', err)
          alert(err.response?.data?.error || 'Failed to assign tenant')
        } finally {
          assigningTenant.value = false
        }
      }

      const removeTenant = async tenant => {
        if (
          !confirm(
            `Are you sure you want to remove ${selectedUser.value.fullName} from ${tenant.tenantName}?`
          )
        ) {
          return
        }

        removingTenant.value = true

        try {
          await axios.delete(
            `/api/users/${selectedUser.value._id}/remove-tenant/${tenant.tenantId}`
          )

          // Move tenant from user tenants to available
          userTenants.value = userTenants.value.filter(
            t => t.tenantId !== tenant.tenantId
          )
          availableTenants.value.push(tenant)

          // Update the user in the main users list
          const userIndex = users.value.findIndex(
            u => u._id === selectedUser.value._id
          )
          if (userIndex !== -1) {
            users.value[userIndex].tenants = users.value[
              userIndex
            ].tenants.filter(t => t.tenantId !== tenant.tenantId)
          }

          alert(`User removed from ${tenant.tenantName} successfully!`)
        } catch (err) {
          console.error('Error removing tenant:', err)
          alert(err.response?.data?.error || 'Failed to remove tenant')
        } finally {
          removingTenant.value = false
        }
      }

      onMounted(async () => {
        try {
          // First check if user is authenticated
          await loadCurrentUser()
          // Then load data
          await loadUsers()
          await loadRoles()
          await loadAvailableTenantsForAssignment()
        } catch (err) {
          console.error('Error in component initialization:', err)
          // Redirect to login if not authenticated
          window.location.href = '/login'
        }
      })

      return {
        users,
        availableRoles,
        loading,
        error,
        saving,
        deleting,
        isEditing,
        userToDelete,
        currentUserId,
        currentUser,
        currentTenant,
        form,
        loadUsers,
        showAddModal,
        editUser,
        saveUser,
        deleteUser,
        confirmDelete,
        formatDate,
        // Tenant management
        selectedUser,
        userTenants,
        availableTenants,
        availableTenantsForAssignment,
        tenantLoading,
        tenantError,
        assigningTenant,
        removingTenant,
        manageTenants,
        assignTenant,
        removeTenant,
      }
    },
  }
</script>

<style scoped>
  .user-management-container {
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

  .badge {
    font-size: 0.75rem;
  }
</style>
