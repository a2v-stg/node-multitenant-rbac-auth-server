<template>
  <AppLayout>
    <div class="dashboard-container">
      <!-- Main Content -->
      <main class="dashboard-main">
        <div class="container-fluid">
          <!-- Welcome Section -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="welcome-card">
                <h2>Welcome to Fraud Detection Engine!</h2>
                <p class="text-muted">
                  Manage your applications and data efficiently.
                </p>
              </div>
            </div>
          </div>

          <!-- Dashboard Grid -->
          <div class="row">
            <!-- Application Summary Card -->
            <div class="col-lg-8 col-md-12 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-chart-bar me-2"></i>
                    Application Summary
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-3 col-sm-6 mb-3">
                      <div class="stat-card bg-primary text-white">
                        <div class="stat-number">{{ summary.total || 0 }}</div>
                        <div class="stat-label">Total Applications</div>
                      </div>
                    </div>
                    <div class="col-md-3 col-sm-6 mb-3">
                      <div class="stat-card bg-success text-white">
                        <div class="stat-number">
                          {{ summary.success || 0 }}
                        </div>
                        <div class="stat-label">Accepted</div>
                      </div>
                    </div>
                    <div class="col-md-3 col-sm-6 mb-3">
                      <div class="stat-card bg-danger text-white">
                        <div class="stat-number">{{ summary.failed || 0 }}</div>
                        <div class="stat-label">Rejected</div>
                      </div>
                    </div>
                    <div class="col-md-3 col-sm-6 mb-3">
                      <div class="stat-card bg-warning text-white">
                        <div class="stat-number">{{ summary.refer || 0 }}</div>
                        <div class="stat-label">Referred</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- System Status Card -->
            <div class="col-lg-4 col-md-12 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-server me-2"></i>
                    System Status
                  </h5>
                </div>
                <div class="card-body">
                  <p>
                    <strong>Database:</strong>
                    <span class="badge bg-success">Connected</span>
                  </p>
                  <p>
                    <strong>API Status:</strong>
                    <span class="badge bg-success">Online</span>
                  </p>
                  <p>
                    <strong>Last Updated:</strong> {{ formatDate(new Date()) }}
                  </p>
                  <p>
                    <strong>Version:</strong>
                    <span class="badge bg-info">v1.0.0</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="row">
            <div class="col-lg-6 col-md-12 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-clock me-2"></i>
                    Recent Activity
                  </h5>
                </div>
                <div class="card-body">
                  <div class="activity-item">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    <span>System initialized successfully</span>
                    <small class="text-muted d-block">Just now</small>
                  </div>
                  <div class="activity-item">
                    <i class="fas fa-database text-info me-2"></i>
                    <span>Test data loaded</span>
                    <small class="text-muted d-block">2 minutes ago</small>
                  </div>
                  <div class="activity-item">
                    <i class="fas fa-users text-primary me-2"></i>
                    <span>User authentication active</span>
                    <small class="text-muted d-block">5 minutes ago</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="col-lg-6 col-md-12 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-bolt me-2"></i>
                    Quick Actions
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 col-sm-6 mb-3">
                      <button
                        class="btn btn-outline-primary w-100"
                        @click="navigateTo('/users')"
                      >
                        <i class="fas fa-users me-2"></i>
                        Manage Users
                      </button>
                    </div>
                    <div class="col-md-6 col-sm-6 mb-3">
                      <button
                        class="btn btn-outline-success w-100"
                        @click="navigateTo('/rbac')"
                      >
                        <i class="fas fa-user-tag me-2"></i>
                        Manage Roles
                      </button>
                    </div>
                    <div class="col-md-6 col-sm-6 mb-3">
                      <button
                        class="btn btn-outline-info w-100"
                        @click="navigateTo('/core-data')"
                      >
                        <i class="fas fa-database me-2"></i>
                        Core Data
                      </button>
                    </div>
                    <div class="col-md-6 col-sm-6 mb-3">
                      <button
                        class="btn btn-outline-warning w-100"
                        @click="navigateTo('/settings')"
                      >
                        <i class="fas fa-cog me-2"></i>
                        Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </AppLayout>
</template>

<script>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  import AppLayout from '../components/AppLayout.vue'

  export default {
    name: 'Dashboard',
    components: {
      AppLayout,
    },
    setup() {
      const router = useRouter()

      const summary = ref({
        total: 0,
        success: 0,
        failed: 0,
        refer: 0,
      })

      const formatDate = dateString => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString()
      }

      const navigateTo = path => {
        // Navigate to the specified route
        router.push(path)
      }

      const loadSummaryData = async () => {
        try {
          // Load real data from the core API
          const response = await axios.get('/api/core/dashboard-stats')
          const stats = response.data.data

          // Map the stats to our summary format
          summary.value = {
            total: stats.counts.decisions || 0,
            success: stats.counts.documents || 0,
            failed: stats.counts.errors || 0,
            refer: stats.counts.events || 0,
          }
        } catch (error) {
          console.error('Error loading summary data:', error)
          // Fallback to mock data if API fails
          summary.value = {
            total: 0,
            success: 0,
            failed: 0,
            refer: 0,
          }
        }
      }

      onMounted(() => {
        loadSummaryData()
      })

      return {
        summary,
        formatDate,
        navigateTo,
      }
    },
  }
</script>

<style scoped>
  .dashboard-container {
    background-color: #f8f9fa;
  }

  .dashboard-main {
    padding: 2rem 0;
  }

  .activity-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .activity-item:last-child {
    border-bottom: none;
  }

  .welcome-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
  }

  .welcome-card h2 {
    margin-bottom: 0.5rem;
  }

  .card {
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    border-radius: 10px 10px 0 0 !important;
  }

  .card-title {
    color: #495057;
    font-weight: 600;
  }

  .badge {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }

  .btn {
    border-radius: 8px;
    font-weight: 500;
  }

  .btn-outline-primary:hover,
  .btn-outline-success:hover,
  .btn-outline-info:hover,
  .btn-outline-warning:hover {
    transform: translateY(-1px);
    transition: transform 0.2s;
  }

  .stat-card {
    padding: 1.5rem;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.875rem;
    opacity: 0.9;
  }
</style>
