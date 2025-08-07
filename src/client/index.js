import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export Vue.js client components
export default {
  // Main Vue app - just export the path, not the component
  App: path.join(__dirname, 'src/App.vue'),
  
  // Router configuration
  router: path.join(__dirname, 'src/router'),
  
  // Components - export paths instead of requiring
  components: {
    AppHeader: path.join(__dirname, 'src/components/AppHeader.vue'),
    AppLayout: path.join(__dirname, 'src/components/AppLayout.vue'),
    AppSidebar: path.join(__dirname, 'src/components/AppSidebar.vue'),
    BlacklistManagement: path.join(__dirname, 'src/components/BlacklistManagement.vue'),
    DataTable: path.join(__dirname, 'src/components/DataTable.vue'),
    MfaOptions: path.join(__dirname, 'src/components/MfaOptions.vue'),
    MfaSetup: path.join(__dirname, 'src/components/MfaSetup.vue'),
    OrganizationMfaSettings: path.join(__dirname, 'src/components/OrganizationMfaSettings.vue'),
    TotpSetup: path.join(__dirname, 'src/components/TotpSetup.vue'),
    UserSettings: path.join(__dirname, 'src/components/UserSettings.vue')
  },
  
  // Views - export paths instead of requiring
  views: {
    Blacklist: path.join(__dirname, 'src/views/Blacklist.vue'),
    CoreData: path.join(__dirname, 'src/views/CoreData.vue'),
    Dashboard: path.join(__dirname, 'src/views/Dashboard.vue'),
    Login: path.join(__dirname, 'src/views/Login.vue'),
    Mfa: path.join(__dirname, 'src/views/Mfa.vue'),
    MfaSetup: path.join(__dirname, 'src/views/MfaSetup.vue'),
    OrganizationMfa: path.join(__dirname, 'src/views/OrganizationMfa.vue'),
    Settings: path.join(__dirname, 'src/views/Settings.vue'),
    TenantManagement: path.join(__dirname, 'src/views/TenantManagement.vue'),
    TenantSelection: path.join(__dirname, 'src/views/TenantSelection.vue'),
    UserManagement: path.join(__dirname, 'src/views/UserManagement.vue')
  },
  
  // Utilities
  utils: {
    logger: path.join(__dirname, 'src/utils/logger')
  },
  
  // Path utilities
  paths: {
    root: path.join(__dirname),
    src: path.join(__dirname, 'src'),
    components: path.join(__dirname, 'src/components'),
    views: path.join(__dirname, 'src/views'),
    utils: path.join(__dirname, 'src/utils'),
    public: path.join(__dirname, 'public')
  }
}; 