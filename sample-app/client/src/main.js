import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import App from './App.vue'
import routes from './router'

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Configure axios - using relative URLs with Vite proxy
axios.defaults.withCredentials = true

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log('Axios request:', config.method?.toUpperCase(), config.url)
    return config
  },
  error => {
    console.error('Axios request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log('Axios response:', response.status, response.config.url)
    return response
  },
  error => {
    console.error(
      'Axios response error:',
      error.response?.status,
      error.config?.url
    )
    return Promise.reject(error)
  }
)

// Router guards
router.beforeEach(async (to, from, next) => {
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    try {
      // Check if user is authenticated by making a request to a protected endpoint
      const response = await axios.get('/api/auth/me')
      if (!response.data.success) {
        return next('/login')
      }

      // Check if route requires admin permissions
      if (to.meta.requiresAdmin) {
        // Check if user has admin permissions
        const permissionsResponse = await axios.get('/api/rbac/permissions')
        if (!permissionsResponse.data.success) {
          return next('/dashboard')
        }

        // Check if user has admin permissions
        const userPermissions = response.data.user?.permissions || []
        const hasAdminPermission = userPermissions.some(permission => 
          permission === 'system:admin' || 
          permission === 'roles:read' || 
          permission === 'settings:read'
        )

        if (!hasAdminPermission) {
          alert('Access denied. Admin permissions required.')
          return next('/dashboard')
        }
      }

      next()
    } catch (error) {
      console.error('Authentication check failed:', error)
      return next('/login')
    }
  } else {
    next()
  }
})

// Create Vue app
const app = createApp(App)

// Global properties
app.config.globalProperties.$http = axios

// Use router
app.use(router)

// Mount app
app.mount('#app') 