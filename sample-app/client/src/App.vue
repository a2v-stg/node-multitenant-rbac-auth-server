<template>
  <div id="app" class="parent-app-theme">
    <ComponentProvider>
      <router-view />
    </ComponentProvider>
  </div>
</template>

<script>
  import ComponentProvider from './components/ComponentProvider.vue'
  import './assets/scss/parent-app-theme.scss'

  export default {
    name: 'App',
    components: {
      ComponentProvider
    }
  }
</script>

<style>
  #app {
    font-family: 'Noto Sans', Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #002e6d;
    background-color: #e2eaef;
    min-height: 100vh;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: #e2eaef;
  }
</style> 