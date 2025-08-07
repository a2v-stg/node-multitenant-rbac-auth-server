import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import TenantSelection from '../views/TenantSelection.vue'
import CoreData from '../views/CoreData.vue'
import TenantManagement from '../views/TenantManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import Mfa from '../views/Mfa.vue'
import MfaSetup from '../views/MfaSetup.vue'
import MfaSettings from '../views/MfaSettings.vue'
import Blacklist from '../views/Blacklist.vue'
import Settings from '../views/Settings.vue'
import OrganizationMfa from '../views/OrganizationMfa.vue'
import RbacManagement from '../views/RbacManagement.vue'

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
    path: '/mfa-settings',
    name: 'MfaSettings',
    component: MfaSettings,
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
    path: '/rbac',
    name: 'RbacManagement',
    component: RbacManagement,
    meta: { requiresAuth: true, requiresAdmin: true },
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
]

export default routes
