<template>
  <component :is="currentLayout" v-bind="$attrs" :class="{ 'sample-app-theme': isSampleApp }">
    <slot />
  </component>
</template>

<script>
import AppLayout from '@admin/components/AppLayout.vue'

export default {
  name: 'AppLayoutWrapper',
  components: {
    AppLayout
  },
  inject: {
    sampleAppLayout: { default: null },
    isSampleApp: { default: false },
    sampleAppTheme: { default: null }
  },
  computed: {
    currentLayout() {
      // Use sample-app layout if available and we're in sample-app context
      if (this.isSampleApp && this.sampleAppLayout) {
        return this.sampleAppLayout
      }
      // Fall back to admin layout
      return AppLayout
    }
  }
}
</script> 