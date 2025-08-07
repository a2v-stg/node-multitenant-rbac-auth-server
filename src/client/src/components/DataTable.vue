<template>
  <div class="data-table-container">
    <!-- Header -->
    <div class="table-header">
      <div class="row align-items-center">
        <div class="col">
          <h4 class="mb-0">{{ title }}</h4>
          <p class="text-muted mb-0">{{ subtitle }}</p>
        </div>
        <div class="col-auto">
          <div class="d-flex gap-2">
            <!-- Search -->
            <div class="input-group" style="width: 300px">
              <input
                type="text"
                class="form-control"
                placeholder="Search..."
                v-model="searchTerm"
                @input="handleSearch"
              />
              <button class="btn btn-outline-secondary" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>

            <!-- Filters -->
            <div class="dropdown">
              <button
                class="btn btn-outline-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i class="fas fa-filter me-1"></i>
                Filters
              </button>
              <ul class="dropdown-menu">
                <li v-for="filter in availableFilters" :key="filter.key">
                  <a
                    class="dropdown-item"
                    href="#"
                    @click="toggleFilter(filter.key)"
                  >
                    {{ filter.label }}
                  </a>
                </li>
              </ul>
            </div>

            <!-- Refresh -->
            <button class="btn btn-outline-primary" @click="loadData">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <!-- Data Table -->
    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="column.style"
            >
              <div class="d-flex align-items-center">
                {{ column.label }}
                <button
                  v-if="column.sortable"
                  class="btn btn-link btn-sm ms-1 p-0"
                  @click="sortBy(column.key)"
                >
                  <i class="fas fa-sort"></i>
                </button>
              </div>
            </th>
            <th style="width: 100px">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedData" :key="item._id">
            <td v-for="column in columns" :key="column.key">
              <span v-if="column.type === 'date'">
                {{ formatDate(item[column.key]) }}
              </span>
              <span v-else-if="column.type === 'boolean'">
                <span
                  :class="
                    item[column.key] ? 'badge bg-success' : 'badge bg-secondary'
                  "
                >
                  {{ item[column.key] ? 'Yes' : 'No' }}
                </span>
              </span>
              <span v-else-if="column.type === 'status'">
                <span :class="getStatusClass(item[column.key])">
                  {{ item[column.key] }}
                </span>
              </span>
              <span v-else-if="column.type === 'truncate'">
                {{ truncateText(item[column.key], 50) }}
              </span>
              <span v-else>
                {{ item[column.key] }}
              </span>
            </td>
            <td>
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-primary btn-sm"
                  @click="viewItem(item)"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  class="btn btn-outline-info btn-sm"
                  @click="editItem(item)"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination && pagination.total > 0"
      class="d-flex justify-content-between align-items-center mt-3"
    >
      <div class="text-muted">
        Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
        {{ pagination.total }} entries
      </div>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: pagination.page === 1 }">
            <a
              class="page-link"
              href="#"
              @click.prevent="changePage(pagination.page - 1)"
            >
              Previous
            </a>
          </li>
          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: page === pagination.page }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">
              {{ page }}
            </a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: pagination.page === pagination.pages }"
          >
            <a
              class="page-link"
              href="#"
              @click.prevent="changePage(pagination.page + 1)"
            >
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && !error && (!data || data.length === 0)"
      class="text-center py-5"
    >
      <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">No data found</h5>
      <p class="text-muted">
        There are no {{ title.toLowerCase() }} to display.
      </p>
    </div>
  </div>
</template>

<script>
  import { ref, computed, onMounted, watch } from 'vue'
  import axios from 'axios'

  export default {
    name: 'DataTable',
    props: {
      title: {
        type: String,
        required: true,
      },
      subtitle: {
        type: String,
        default: '',
      },
      apiEndpoint: {
        type: String,
        required: true,
      },
      columns: {
        type: Array,
        required: true,
      },
      availableFilters: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['view-item', 'edit-item'],
    setup(props, { emit }) {
      const data = ref([])
      const loading = ref(false)
      const error = ref(null)
      const searchTerm = ref('')
      const pagination = ref(null)
      const currentPage = ref(1)
      const sortBy = ref('createdTime')
      const sortOrder = ref('desc')
      const activeFilters = ref({})

      const paginatedData = computed(() => {
        return data.value
      })

      const visiblePages = computed(() => {
        if (!pagination.value) return []

        const pages = []
        const current = pagination.value.page
        const total = pagination.value.pages

        // Show up to 5 pages around current page
        const start = Math.max(1, current - 2)
        const end = Math.min(total, current + 2)

        for (let i = start; i <= end; i++) {
          pages.push(i)
        }

        return pages
      })

      const loadData = async () => {
        loading.value = true
        error.value = null

        try {
          const params = {
            page: currentPage.value,
            limit: 20,
            sortBy: sortBy.value,
            sortOrder: sortOrder.value,
            ...activeFilters.value,
          }

          if (searchTerm.value) {
            params.search = searchTerm.value
          }

          const response = await axios.get(props.apiEndpoint, { params })

          if (response.data.success) {
            data.value = response.data.data
            pagination.value = response.data.pagination
          } else {
            error.value = response.data.error || 'Failed to load data'
          }
        } catch (err) {
          console.error('Error loading data:', err)
          error.value = err.response?.data?.error || 'Failed to load data'
        } finally {
          loading.value = false
        }
      }

      const handleSearch = () => {
        currentPage.value = 1
        loadData()
      }

      const changePage = page => {
        if (page >= 1 && page <= pagination.value?.pages) {
          currentPage.value = page
          loadData()
        }
      }

      const sortByColumn = column => {
        if (sortBy.value === column) {
          sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        } else {
          sortBy.value = column
          sortOrder.value = 'desc'
        }
        loadData()
      }

      const toggleFilter = filterKey => {
        // Implementation for filter toggle
        console.log('Toggle filter:', filterKey)
      }

      const viewItem = item => {
        emit('view-item', item)
      }

      const editItem = item => {
        emit('edit-item', item)
      }

      const formatDate = dateString => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString()
      }

      const truncateText = (text, length) => {
        if (!text) return ''
        return text.length > length ? text.substring(0, length) + '...' : text
      }

      const getStatusClass = status => {
        const statusClasses = {
          success: 'badge bg-success',
          error: 'badge bg-danger',
          warning: 'badge bg-warning',
          info: 'badge bg-info',
          pending: 'badge bg-secondary',
        }
        return statusClasses[status?.toLowerCase()] || 'badge bg-secondary'
      }

      onMounted(() => {
        loadData()
      })

      return {
        data,
        loading,
        error,
        searchTerm,
        pagination,
        paginatedData,
        visiblePages,
        loadData,
        handleSearch,
        changePage,
        sortBy: sortByColumn,
        toggleFilter,
        viewItem,
        editItem,
        formatDate,
        truncateText,
        getStatusClass,
      }
    },
  }
</script>

<style scoped>
  .data-table-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .table-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;
  }

  .table {
    margin-bottom: 0;
  }

  .table th {
    border-top: none;
    font-weight: 600;
    color: #495057;
  }

  .table td {
    vertical-align: middle;
  }

  .btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  .pagination {
    margin-bottom: 0;
  }

  .page-link {
    color: #007bff;
    border-color: #dee2e6;
  }

  .page-item.active .page-link {
    background-color: #007bff;
    border-color: #007bff;
  }

  .page-item.disabled .page-link {
    color: #6c757d;
    pointer-events: none;
    background-color: #fff;
    border-color: #dee2e6;
  }
</style>
