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

// Import Sentry configuration
import { initSentry, captureError, setUser, setTags, createTransaction } from './config/sentry'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Configure axios - using relative URLs with Vite proxy
axios.defaults.withCredentials = true

// Add request interceptor for debugging and Sentry tracking
axios.interceptors.request.use(
  config => {
    console.log('Axios request:', config.method?.toUpperCase(), config.url)
    
    // Add Sentry transaction for API requests
    const transaction = createTransaction(`api.${config.method?.toLowerCase() || 'request'}`, 'http', {
      url: config.url,
      method: config.method
    });
    
    if (transaction) {
      config.metadata = { transaction };
    }
    
    return config
  },
  error => {
    console.error('Axios request error:', error)
    captureError(error, { context: 'axios.request', url: error.config?.url });
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging and Sentry tracking
axios.interceptors.response.use(
  response => {
    console.log('Axios response:', response.status, response.config.url)
    
    // Finish Sentry transaction
    if (response.config.metadata?.transaction) {
      const transaction = response.config.metadata.transaction;
      transaction.setStatus(response.status < 400 ? 'ok' : 'internal_error');
      transaction.finish();
    }
    
    return response
  },
  error => {
    console.error(
      'Axios response error:',
      error.response?.status,
      error.config?.url
    )
    
    // Finish Sentry transaction with error
    if (error.config?.metadata?.transaction) {
      const transaction = error.config.metadata.transaction;
      transaction.setStatus('internal_error');
      transaction.finish();
    }
    
    captureError(error, { 
      context: 'axios.response', 
      status: error.response?.status,
      url: error.config?.url 
    });
    
    return Promise.reject(error)
  }
)

// Create Vue app
const app = createApp(App)

// Initialize Sentry
initSentry(app, {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE || 'development',
  enableTracing: import.meta.env.VITE_SENTRY_TRACING_ENABLED === 'true'
});

// Global properties
app.config.globalProperties.$http = axios

// Use router
app.use(router)

// Router guards with Sentry tracking
router.beforeEach(async (to, from, next) => {
  // Create transaction for route navigation
  const transaction = createTransaction(`navigation.${to.name || to.path}`, 'navigation', {
    from: from.path,
    to: to.path
  });
  
  try {
    // Check if route requires authentication
    if (to.meta.requiresAuth) {
      try {
        // Check if user is authenticated by making a request to a protected endpoint
        const response = await axios.get('/api/auth/me')
        if (!response.data.success) {
          if (transaction) {
            transaction.setStatus('unauthenticated');
            transaction.finish();
          }
          return next('/login')
        }

        // Check if route requires admin permissions
        if (to.meta.requiresAdmin) {
          // Check if user has admin permissions
          const permissionsResponse = await axios.get('/api/rbac/permissions')
          if (!permissionsResponse.data.success) {
            if (transaction) {
              transaction.setStatus('unauthorized');
              transaction.finish();
            }
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
            if (transaction) {
              transaction.setStatus('unauthorized');
              transaction.finish();
            }
            return next('/dashboard')
          }
        }

        // Set user context for Sentry
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        if (transaction) {
          transaction.setStatus('ok');
          transaction.finish();
        }
        
        next()
      } catch (error) {
        console.error('Authentication check failed:', error)
        captureError(error, { context: 'router.auth-check', route: to.path });
        
        if (transaction) {
          transaction.setStatus('internal_error');
          transaction.finish();
        }
        
        return next('/login')
      }
    } else {
      if (transaction) {
        transaction.setStatus('ok');
        transaction.finish();
      }
      next()
    }
  } catch (error) {
    captureError(error, { context: 'router.beforeEach', route: to.path });
    
    if (transaction) {
      transaction.setStatus('internal_error');
      transaction.finish();
    }
    
    next()
  }
})

// Mount app
app.mount('#app')
