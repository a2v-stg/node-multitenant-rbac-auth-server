<template>
  <div class="app-layout" :class="{ 'sample-app-theme': isSampleApp }">
    <!-- Sidebar -->
    <component :is="sidebarComponent" />

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Header -->
      <component :is="headerComponent" />

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script>
  import AppHeader from './AppHeader.vue'
  import AppSidebar from './AppSidebar.vue'

  export default {
    name: 'AppLayout',
    components: {
      AppHeader,
      AppSidebar,
    },
    inject: {
      sampleAppSidebar: { default: null },
      sampleAppHeader: { default: null },
      isSampleApp: { default: false },
      sampleAppTheme: { default: null }
    },
    computed: {
      sidebarComponent() {
        // Use sample-app sidebar if available and we're in sample-app context
        return this.isSampleApp && this.sampleAppSidebar ? this.sampleAppSidebar : AppSidebar
      },
      headerComponent() {
        // Use sample-app header if available and we're in sample-app context
        return this.isSampleApp && this.sampleAppHeader ? this.sampleAppHeader : AppHeader
      }
    }
  }
</script>

<style scoped>
  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  .app-layout.sample-app-theme {
    background-color: #e2eaef;
  }

  .main-content {
    flex: 1;
    margin-left: 250px;
    display: flex;
    flex-direction: column;
  }

  .app-layout.sample-app-theme .main-content {
    background-color: #e2eaef;
  }

  .page-content {
    flex: 1;
    padding: 2rem;
    background-color: #f8f9fa;
    min-height: calc(100vh - 80px);
  }

  .app-layout.sample-app-theme .page-content {
    background-color: #e2eaef;
  }
</style>
