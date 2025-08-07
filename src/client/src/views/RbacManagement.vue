<template>
  <AppLayout>
    <div class="rbac-management-container">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="h3 mb-0">RBAC Management</h1>
            <p class="text-muted mb-0">
              Manage roles, permissions, and user assignments
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
        <!-- Roles Tab -->
        <div v-if="activeTab === 'roles'" class="tab-content">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Roles</h5>
              <button class="btn btn-primary" @click="showCreateRoleModal = true">
                <i class="fas fa-plus me-2"></i>Create Role
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Role Name</th>
                      <th>Description</th>
                      <th>Permissions</th>
                      <th>Users</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="role in roles" :key="role._id">
                      <td>
                        <strong>{{ role.name }}</strong>
                        <span v-if="role.isSystem" class="badge bg-secondary ms-2">System</span>
                      </td>
                      <td>{{ role.description }}</td>
                      <td>
                        <span class="badge bg-info me-1" v-for="permission in role.permissions.slice(0, 3)" :key="permission">
                          {{ permission }}
                        </span>
                        <span v-if="role.permissions.length > 3" class="text-muted">
                          +{{ role.permissions.length - 3 }} more
                        </span>
                      </td>
                      <td>{{ role.userCount || 0 }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" @click="editRole(role)">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            class="btn btn-outline-danger" 
                            @click="deleteRole(role)"
                            :disabled="role.isSystem"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Permissions Tab -->
        <div v-if="activeTab === 'permissions'" class="tab-content">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Permissions</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6" v-for="(permissions, category) in groupedPermissions" :key="category">
                  <div class="card mb-3">
                    <div class="card-header">
                      <h6 class="mb-0">{{ category }}</h6>
                    </div>
                    <div class="card-body">
                      <div class="list-group list-group-flush">
                        <div class="list-group-item d-flex justify-content-between align-items-center" v-for="permission in permissions" :key="permission.key">
                          <div>
                            <strong>{{ permission.key }}</strong>
                            <br>
                            <small class="text-muted">{{ permission.description }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Assignments Tab -->
        <div v-if="activeTab === 'assignments'" class="tab-content">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">User Role Assignments</h5>
              <button class="btn btn-primary" @click="showAssignRoleModal = true">
                <i class="fas fa-user-plus me-2"></i>Assign Role
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Roles</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user._id">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar me-3">
                            <i class="fas fa-user-circle fa-2x text-muted"></i>
                          </div>
                          <div>
                            <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                          </div>
                        </div>
                      </td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="badge bg-primary me-1" v-for="role in user.roles" :key="role._id">
                          {{ role.name }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-outline-primary btn-sm" @click="manageUserRoles(user)">
                          <i class="fas fa-cog me-1"></i>Manage
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Role Modal -->
      <div class="modal fade" :class="{ show: showCreateRoleModal }" :style="{ display: showCreateRoleModal ? 'block' : 'none' }" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editingRole ? 'Edit Role' : 'Create Role' }}</h5>
              <button type="button" class="btn-close" @click="closeRoleModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveRole">
                <div class="mb-3">
                  <label class="form-label">Role Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="roleForm.name" 
                    required
                    :disabled="editingRole?.isSystem"
                  >
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea 
                    class="form-control" 
                    v-model="roleForm.description" 
                    rows="3"
                    :disabled="editingRole?.isSystem"
                  ></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Permissions</label>
                  <div class="row">
                    <div class="col-md-6" v-for="(permissions, category) in groupedPermissions" :key="category">
                      <div class="card">
                        <div class="card-header">
                          <div class="form-check">
                            <input 
                              class="form-check-input" 
                              type="checkbox" 
                              :id="`category-${category}`"
                              @change="toggleCategoryPermissions(category, $event.target.checked)"
                            >
                            <label class="form-check-label" :for="`category-${category}`">
                              {{ category }}
                            </label>
                          </div>
                        </div>
                        <div class="card-body">
                          <div class="form-check" v-for="permission in permissions" :key="permission.key">
                            <input 
                              class="form-check-input" 
                              type="checkbox" 
                              :id="permission.key"
                              :value="permission.key"
                              v-model="roleForm.permissions"
                              :disabled="editingRole?.isSystem"
                            >
                            <label class="form-check-label" :for="permission.key">
                              {{ permission.description }}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeRoleModal">Cancel</button>
              <button type="button" class="btn btn-primary" @click="saveRole" :disabled="loading">
                {{ loading ? 'Saving...' : 'Save Role' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Assign Role Modal -->
      <div class="modal fade" :class="{ show: showAssignRoleModal }" :style="{ display: showAssignRoleModal ? 'block' : 'none' }" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Assign Role to User</h5>
              <button type="button" class="btn-close" @click="closeAssignRoleModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="assignRole">
                <div class="mb-3">
                  <label class="form-label">User</label>
                  <select class="form-select" v-model="assignmentForm.userId" required>
                    <option value="">Select a user</option>
                    <option v-for="user in availableUsers" :key="user._id" :value="user._id">
                      {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Role</label>
                  <select class="form-select" v-model="assignmentForm.roleId" required>
                    <option value="">Select a role</option>
                    <option v-for="role in roles" :key="role._id" :value="role._id">
                      {{ role.name }}
                    </option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeAssignRoleModal">Cancel</button>
              <button type="button" class="btn btn-primary" @click="assignRole" :disabled="loading">
                {{ loading ? 'Assigning...' : 'Assign Role' }}
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
import AppLayout from '../components/AppLayout.vue'

export default {
  name: 'RbacManagement',
  components: {
    AppLayout,
  },
  setup() {
    const activeTab = ref('roles')
    const roles = ref([])
    const users = ref([])
    const permissions = ref([])
    const loading = ref(false)
    const showCreateRoleModal = ref(false)
    const showAssignRoleModal = ref(false)
    const editingRole = ref(null)
    const roleForm = ref({
      name: '',
      description: '',
      permissions: []
    })
    const assignmentForm = ref({
      userId: '',
      roleId: ''
    })

    // Tab configuration
    const tabs = [
      { key: 'roles', label: 'Roles', icon: 'fas fa-users-cog' },
      { key: 'permissions', label: 'Permissions', icon: 'fas fa-key' },
      { key: 'assignments', label: 'User Assignments', icon: 'fas fa-user-plus' }
    ]

    // Group permissions by category
    const groupedPermissions = computed(() => {
      const grouped = {}
      permissions.value.forEach(permission => {
        const category = permission.key.split(':')[0]
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(permission)
      })
      return grouped
    })

    // Available users for assignment
    const availableUsers = computed(() => {
      return users.value.filter(user => user.roles.length === 0)
    })

    // Load data
    const loadRoles = async () => {
      try {
        const response = await fetch('/api/rbac/roles')
        const data = await response.json()
        if (data.success) {
          roles.value = data.roles || data.data || []
        }
      } catch (error) {
        console.error('Error loading roles:', error)
      }
    }

    const loadUsers = async () => {
      try {
        const response = await fetch('/api/rbac/users')
        const data = await response.json()
        if (data.success) {
          users.value = data.users || data.data || []
        }
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }

    const loadPermissions = async () => {
      try {
        const response = await fetch('/api/rbac/permissions')
        const data = await response.json()
        if (data.success) {
          permissions.value = data.permissions || data.data || []
        }
      } catch (error) {
        console.error('Error loading permissions:', error)
      }
    }

    // Role management
    const editRole = (role) => {
      editingRole.value = role
      roleForm.value = {
        name: role.name,
        description: role.description,
        permissions: [...role.permissions]
      }
      showCreateRoleModal.value = true
    }

    const saveRole = async () => {
      loading.value = true
      try {
        const url = editingRole.value 
          ? `/api/rbac/roles/${editingRole.value._id}`
          : '/api/rbac/roles'
        
        const method = editingRole.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(roleForm.value)
        })

        const data = await response.json()
        if (data.success) {
          await loadRoles()
          closeRoleModal()
        } else {
          alert('Error saving role: ' + data.error)
        }
      } catch (error) {
        console.error('Error saving role:', error)
        alert('Error saving role')
      } finally {
        loading.value = false
      }
    }

    const deleteRole = async (role) => {
      if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
        return
      }

      try {
        const response = await fetch(`/api/rbac/roles/${role._id}`, {
          method: 'DELETE'
        })

        const data = await response.json()
        if (data.success) {
          await loadRoles()
        } else {
          alert('Error deleting role: ' + data.error)
        }
      } catch (error) {
        console.error('Error deleting role:', error)
        alert('Error deleting role')
      }
    }

    const closeRoleModal = () => {
      showCreateRoleModal.value = false
      editingRole.value = null
      roleForm.value = {
        name: '',
        description: '',
        permissions: []
      }
    }

    // Assignment management
    const assignRole = async () => {
      loading.value = true
      try {
        const response = await fetch('/api/rbac/assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assignmentForm.value)
        })

        const data = await response.json()
        if (data.success) {
          await loadUsers()
          closeAssignRoleModal()
        } else {
          alert('Error assigning role: ' + data.error)
        }
      } catch (error) {
        console.error('Error assigning role:', error)
        alert('Error assigning role')
      } finally {
        loading.value = false
      }
    }

    const closeAssignRoleModal = () => {
      showAssignRoleModal.value = false
      assignmentForm.value = {
        userId: '',
        roleId: ''
      }
    }

    const manageUserRoles = (user) => {
      // TODO: Implement user role management modal
      console.log('Manage roles for user:', user)
    }

    const toggleCategoryPermissions = (category, checked) => {
      const categoryPermissions = groupedPermissions.value[category].map(p => p.key)
      if (checked) {
        categoryPermissions.forEach(permission => {
          if (!roleForm.value.permissions.includes(permission)) {
            roleForm.value.permissions.push(permission)
          }
        })
      } else {
        roleForm.value.permissions = roleForm.value.permissions.filter(
          permission => !categoryPermissions.includes(permission)
        )
      }
    }

    onMounted(() => {
      loadRoles()
      loadUsers()
      loadPermissions()
    })

    return {
      activeTab,
      tabs,
      roles,
      users,
      permissions,
      groupedPermissions,
      availableUsers,
      loading,
      showCreateRoleModal,
      showAssignRoleModal,
      editingRole,
      roleForm,
      assignmentForm,
      editRole,
      saveRole,
      deleteRole,
      closeRoleModal,
      assignRole,
      closeAssignRoleModal,
      manageUserRoles,
      toggleCategoryPermissions
    }
  }
}
</script>

<style scoped>
.rbac-management-container {
  padding: 2rem;
}

.tab-content {
  margin-top: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
  border-top: none;
  font-weight: 600;
}
</style> 