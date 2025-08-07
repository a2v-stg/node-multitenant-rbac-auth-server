<template>
  <AppLayout>
    <BlacklistManagement />
  </AppLayout>
</template>

<script>
  import AppLayout from '../components/AppLayout.vue'
  import BlacklistManagement from '../components/BlacklistManagement.vue'

  export default {
    name: 'Blacklist',
    components: {
      AppLayout,
      BlacklistManagement,
    },
  }
</script>
