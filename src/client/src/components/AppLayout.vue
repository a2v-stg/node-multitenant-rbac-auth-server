<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Header -->
      <AppHeader />

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
  }
</script>

<style scoped>
  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    margin-left: 250px;
    display: flex;
    flex-direction: column;
  }

  .page-content {
    flex: 1;
    padding: 2rem;
    background-color: #f8f9fa;
    min-height: calc(100vh - 80px);
  }
</style>
