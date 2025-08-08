<template>
  <component :is="currentLayout" v-bind="$attrs" :class="{ 'sample-app-theme': isParentApp }">
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
    parentAppLayout: { default: null },
    isParentApp: { default: false },
    parentAppTheme: { default: null }
  },
  computed: {
    currentLayout() {
      // Use sample-app layout if available and we're in sample-app context
      if (this.isParentApp && this.parentAppLayout) {
        return this.parentAppLayout
      }
      // Fall back to admin layout
      return AppLayout
    }
  }
}
</script> 