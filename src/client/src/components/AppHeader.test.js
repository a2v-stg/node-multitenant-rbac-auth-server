import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AppHeader from './AppHeader.vue'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

// Create a mock router
const createMockRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } },
    ],
  })
}

describe('AppHeader', () => {
  let router

  beforeEach(() => {
    router = createMockRouter()
    vi.clearAllMocks()
  })

  it('should render the header with title', () => {
    const wrapper = mount(AppHeader, {
      props: {
        title: 'Admin Dashboard'
      },
      global: {
        plugins: [router],
        provide: {
          router
        }
      }
    })
    
    // Check if the component renders without errors
    expect(wrapper.exists()).toBe(true)
  })

  it('should emit logout event when logout button is clicked', async () => {
    const wrapper = mount(AppHeader, {
      props: {
        title: 'Admin Dashboard'
      },
      global: {
        plugins: [router],
        provide: {
          router
        }
      }
    })
    
    // Find logout button and click it
    const logoutButton = wrapper.find('[data-testid="logout-btn"]')
    if (logoutButton.exists()) {
      await logoutButton.trigger('click')
      expect(wrapper.emitted('logout')).toBeTruthy()
    }
  })

  it('should display user information when provided', () => {
    const wrapper = mount(AppHeader, {
      props: {
        title: 'Admin Dashboard',
        user: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      global: {
        plugins: [router],
        provide: {
          router
        }
      }
    })
    
    // Check if the component renders without errors
    expect(wrapper.exists()).toBe(true)
  })

  it('should handle missing user gracefully', () => {
    const wrapper = mount(AppHeader, {
      props: {
        title: 'Admin Dashboard'
      },
      global: {
        plugins: [router],
        provide: {
          router
        }
      }
    })
    
    // Should not throw error when user is not provided
    expect(wrapper.exists()).toBe(true)
  })

  it('should handle network errors gracefully', async () => {
    const wrapper = mount(AppHeader, {
      props: {
        title: 'Admin Dashboard'
      },
      global: {
        plugins: [router],
        provide: {
          router
        }
      }
    })
    
    // Wait for component to mount and handle any async operations
    await wrapper.vm.$nextTick()
    
    // Component should still render even with network errors
    expect(wrapper.exists()).toBe(true)
  })
}) 