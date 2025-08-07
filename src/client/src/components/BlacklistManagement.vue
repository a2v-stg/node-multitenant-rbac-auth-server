<template>
  <div class="blacklist-management">
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="mb-3">
            <i class="fas fa-ban me-2"></i>Blacklist Management
          </h2>
        </div>
      </div>

      <!-- Add Blacklist Form -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Add Blacklist Entity</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="entityType" class="form-label"
                    >Entity Type *</label
                  >
                  <select
                    id="entityType"
                    class="form-select"
                    v-model="newEntity.entityType"
                    required
                  >
                    <option value="">Select Entity Type</option>
                    <option value="SSN">SSN</option>
                    <option value="ACCOUNT_MOBILE">Phone</option>
                    <option value="TIN">TIN</option>
                    <option value="ACCOUNT_EMAIL">Email</option>
                    <option value="EIN">EIN</option>
                    <option value="ACCOUNT_NAME">Name</option>
                    <option value="IP_ADDRESS">IP Address</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="entityValue" class="form-label"
                    >Entity Value *</label
                  >
                  <input
                    type="text"
                    id="entityValue"
                    class="form-control"
                    v-model="newEntity.entityValue"
                    placeholder="Enter entity value"
                    required
                  />
                </div>
                <div class="col-md-2 mb-3 d-flex align-items-end">
                  <button
                    type="button"
                    class="btn btn-primary w-100"
                    @click="addToBlacklist"
                    :disabled="!newEntity.entityType || !newEntity.entityValue"
                  >
                    <i class="fas fa-plus me-2"></i>Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Blacklist Table -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="card-title mb-0">Blacklist Entities</h5>
              <div class="d-flex gap-2">
                <div class="input-group" style="width: 300px">
                  <span class="input-group-text">
                    <i class="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search entities..."
                    v-model="searchTerm"
                    @input="handleSearch"
                  />
                </div>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="refreshBlacklist"
                  :disabled="loading"
                >
                  <i class="fas fa-sync-alt me-2"></i>Refresh
                </button>
              </div>
            </div>
            <div class="card-body">
              <!-- Loading State -->
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading blacklist entities...</p>
              </div>

              <!-- Table -->
              <div v-else>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>#</th>
                        <th>Entity Type</th>
                        <th>Entity Value</th>
                        <th>Source</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(item, index) in paginatedItems"
                        :key="item._id"
                      >
                        <td>
                          {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                        </td>
                        <td>
                          <span class="badge bg-secondary">{{
                            item.entityType
                          }}</span>
                        </td>
                        <td>
                          <code>{{ item.entityValue }}</code>
                        </td>
                        <td>{{ item.source || 'Manual' }}</td>
                        <td>{{ formatDate(item.createdAt) }}</td>
                        <td>
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            @click="deleteEntity(item)"
                            :disabled="item.source === 'BaseProduct'"
                            title="Delete entity"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Empty State -->
                <div v-if="filteredItems.length === 0" class="text-center py-4">
                  <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No blacklist entities found</h5>
                  <p class="text-muted">Add some entities to get started.</p>
                </div>

                <!-- Pagination -->
                <div
                  v-if="totalPages > 1"
                  class="d-flex justify-content-between align-items-center mt-3"
                >
                  <div class="text-muted">
                    Showing {{ startIndex + 1 }} to {{ endIndex }} of
                    {{ filteredItems.length }} entries
                  </div>
                  <nav>
                    <ul class="pagination pagination-sm mb-0">
                      <li
                        class="page-item"
                        :class="{ disabled: currentPage === 1 }"
                      >
                        <button
                          class="page-link"
                          @click="goToPage(currentPage - 1)"
                        >
                          Previous
                        </button>
                      </li>
                      <li
                        v-for="page in visiblePages"
                        :key="page"
                        class="page-item"
                        :class="{ active: page === currentPage }"
                      >
                        <button class="page-link" @click="goToPage(page)">
                          {{ page }}
                        </button>
                      </li>
                      <li
                        class="page-item"
                        :class="{ disabled: currentPage === totalPages }"
                      >
                        <button
                          class="page-link"
                          @click="goToPage(currentPage + 1)"
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Messages -->
    <div
      v-if="alert.show"
      class="alert alert-dismissible"
      :class="alert.type"
      role="alert"
    >
      {{ alert.message }}
      <button type="button" class="btn-close" @click="clearAlert"></button>
    </div>
  </div>
</template>

<script>
  import { ref, computed, onMounted, watch } from 'vue'
  import axios from 'axios'

  export default {
    name: 'BlacklistManagement',
    setup() {
      const loading = ref(false)
      const blacklistItems = ref([])
      const searchTerm = ref('')
      const currentPage = ref(1)
      const itemsPerPage = ref(10)
      const alert = ref({ show: false, type: '', message: '' })

      const newEntity = ref({
        entityType: '',
        entityValue: '',
      })

      // Computed properties
      const filteredItems = computed(() => {
        if (!searchTerm.value) return blacklistItems.value

        return blacklistItems.value.filter(
          item =>
            item.entityType
              .toLowerCase()
              .includes(searchTerm.value.toLowerCase()) ||
            item.entityValue
              .toLowerCase()
              .includes(searchTerm.value.toLowerCase()) ||
            (item.source &&
              item.source
                .toLowerCase()
                .includes(searchTerm.value.toLowerCase()))
        )
      })

      const totalPages = computed(() =>
        Math.ceil(filteredItems.value.length / itemsPerPage.value)
      )
      const startIndex = computed(
        () => (currentPage.value - 1) * itemsPerPage.value
      )
      const endIndex = computed(() =>
        Math.min(
          startIndex.value + itemsPerPage.value,
          filteredItems.value.length
        )
      )

      const paginatedItems = computed(() => {
        return filteredItems.value.slice(startIndex.value, endIndex.value)
      })

      const visiblePages = computed(() => {
        const pages = []
        const maxVisible = 5
        let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
        let end = Math.min(totalPages.value, start + maxVisible - 1)

        if (end - start + 1 < maxVisible) {
          start = Math.max(1, end - maxVisible + 1)
        }

        for (let i = start; i <= end; i++) {
          pages.push(i)
        }

        return pages
      })

      // Methods
      const showAlert = (type, message) => {
        alert.value = { show: true, type: `alert-${type}`, message }
        setTimeout(() => {
          clearAlert()
        }, 5000)
      }

      const clearAlert = () => {
        alert.value = { show: false, type: '', message: '' }
      }

      const fetchBlacklist = async () => {
        try {
          loading.value = true
          const response = await axios.get('/api/blacklist')
          blacklistItems.value = response.data.blackListItems || []
        } catch (error) {
          console.error('Error fetching blacklist:', error)
          showAlert('danger', 'Failed to load blacklist entities.')
        } finally {
          loading.value = false
        }
      }

      const addToBlacklist = async () => {
        try {
          if (!newEntity.value.entityType || !newEntity.value.entityValue) {
            showAlert('danger', 'Please fill in all required fields.')
            return
          }

          const payload = {
            entityType: newEntity.value.entityType,
            entityValue: newEntity.value.entityValue,
            tenant_name: 'current-tenant', // This should come from your auth context
          }

          const response = await axios.post('/api/blacklist/add', payload)

          if (response.status === 200) {
            showAlert('success', 'Entity added to blacklist successfully.')
            newEntity.value = { entityType: '', entityValue: '' }
            await fetchBlacklist()
          }
        } catch (error) {
          console.error('Error adding to blacklist:', error)
          showAlert('danger', 'Failed to add entity to blacklist.')
        }
      }

      const deleteEntity = async item => {
        if (item.source === 'BaseProduct') {
          showAlert('warning', 'Cannot delete entities from BaseProduct.')
          return
        }

        if (!confirm('Are you sure you want to delete this entity?')) {
          return
        }

        try {
          const payload = {
            entityType: item.entityType,
            entityValue: item.entityValue,
            tenant_name: 'current-tenant', // This should come from your auth context
          }

          const response = await axios.post('/api/blacklist/delete', payload)

          if (response.status === 200) {
            showAlert('success', 'Entity deleted from blacklist successfully.')
            await fetchBlacklist()
          }
        } catch (error) {
          console.error('Error deleting from blacklist:', error)
          showAlert('danger', 'Failed to delete entity from blacklist.')
        }
      }

      const handleSearch = () => {
        currentPage.value = 1
      }

      const refreshBlacklist = async () => {
        await fetchBlacklist()
      }

      const goToPage = page => {
        if (page >= 1 && page <= totalPages.value) {
          currentPage.value = page
        }
      }

      const formatDate = dateString => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString()
      }

      // Watch for search changes
      watch(searchTerm, () => {
        currentPage.value = 1
      })

      onMounted(() => {
        fetchBlacklist()
      })

      return {
        loading,
        blacklistItems,
        searchTerm,
        currentPage,
        itemsPerPage,
        alert,
        newEntity,
        filteredItems,
        totalPages,
        startIndex,
        endIndex,
        paginatedItems,
        visiblePages,
        showAlert,
        clearAlert,
        fetchBlacklist,
        addToBlacklist,
        deleteEntity,
        handleSearch,
        refreshBlacklist,
        goToPage,
        formatDate,
      }
    },
  }
</script>

<style scoped>
  .blacklist-management {
    padding: 20px;
  }

  .alert {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1050;
    min-width: 300px;
  }

  .table th {
    font-weight: 600;
    background-color: #f8f9fa;
  }

  .badge {
    font-size: 0.75em;
  }

  code {
    background-color: #f8f9fa;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.875em;
  }

  .pagination {
    margin-bottom: 0;
  }
</style>
