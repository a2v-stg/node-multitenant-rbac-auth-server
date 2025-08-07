// Import shared components from submodule
import Login from '@admin/views/Login.vue'
import Dashboard from '@admin/views/Dashboard.vue'
import TenantSelection from '@admin/views/TenantSelection.vue'
import TenantManagement from '@admin/views/TenantManagement.vue'
import UserManagement from '@admin/views/UserManagement.vue'
import Mfa from '@admin/views/Mfa.vue'
import MfaSetup from '@admin/views/MfaSetup.vue'
import Blacklist from '@admin/views/Blacklist.vue'
import Settings from '@admin/views/Settings.vue'
import OrganizationMfa from '@admin/views/OrganizationMfa.vue'
import RbacManagement from '@admin/views/RbacManagement.vue'
import MfaSettings from '@admin/views/MfaSettings.vue'
// Import sample-app specific components
import CoreData from '@sample/views/CoreData.vue'
import Admin from '@sample/views/Admin.vue'
import Analytics from '@sample/views/Analytics.vue'
import FDEEngine from '@sample/views/FDEEngine.vue'
import Reports from '@sample/views/Reports.vue'
import Config from '@sample/views/Config.vue'
import Sample from '@sample/views/Sample.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/mfa',
    name: 'Mfa',
    component: Mfa,
    meta: { requiresAuth: true },
  },
  {
    path: '/mfa-setup',
    name: 'MfaSetup',
    component: MfaSetup,
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/tenant-selection',
    name: 'TenantSelection',
    component: TenantSelection,
    meta: { requiresAuth: true },
  },
  {
    path: '/core-data',
    name: 'CoreData',
    component: CoreData,
    meta: { requiresAuth: true },
  },
  {
    path: '/blacklist',
    name: 'Blacklist',
    component: Blacklist,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true },
  },
  {
    path: '/tenants',
    name: 'TenantManagement',
    component: TenantManagement,
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true },
  },
  {
    path: '/organization-mfa',
    name: 'OrganizationMfa',
    component: OrganizationMfa,
    meta: { requiresAuth: true },
  },
  {
    path: '/rbac',
    name: 'RbacManagement',
    component: RbacManagement,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  // Sample-app specific routes
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true },
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { requiresAuth: true },
  },
  {
    path: '/fde-engine',
    name: 'FDEEngine',
    component: FDEEngine,
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true },
  },
  {
    path: '/config',
    name: 'Config',
    component: Config,
    meta: { requiresAuth: true },
  },
  {
    path: '/sample',
    name: 'Sample',
    component: Sample,
    meta: { requiresAuth: true },
  },
  {
    path: '/mfa-settings',
    name: 'MfaSettings',
    component: MfaSettings,
    meta: { requiresAuth: true },
  },
]

export default routes
