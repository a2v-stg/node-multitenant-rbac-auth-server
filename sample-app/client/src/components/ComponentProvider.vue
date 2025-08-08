<template>
  <div class="sample-app-theme">
    <slot />
  </div>
</template>

<script>
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppLayout from './AppLayout.vue'
import '../assets/scss/sample-app-theme.scss'

export default {
  name: 'ComponentProvider',
  provide() {
    return {
      // Provide sample-app specific components
      sampleAppSidebar: AppSidebar,
      sampleAppHeader: AppHeader,
      sampleAppLayout: AppLayout,
      // Flag to indicate we're in sample-app context
      isSampleApp: true,
      // Provide theme information
      sampleAppTheme: {
        primary: '#002e6d',
        secondary: '#b8252b',
        tertiary: '#66b3ff',
        light: '#f4f8fa',
        grey: '#e9f1f5',
        textLight: '#f0f0f0',
        primaryFontColor: '#002e6d',
        primaryTextColor: 'black',
        primaryFontFamily: 'Noto Sans, Avenir, Helvetica, Arial, sans-serif'
      }
    }
  }
}
</script> 