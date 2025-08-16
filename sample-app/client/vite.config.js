import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    // Proxy removed since client and server will run on same port
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure assets are built with relative paths for single-port deployment
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable code splitting for simpler deployment
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@admin': path.resolve(__dirname, '../../src/client/src'),
      '@admin/components': path.resolve(__dirname, '../../src/client/src/components'),
      '@admin/views': path.resolve(__dirname, '../../src/client/src/views'),
      '@admin/utils': path.resolve(__dirname, '../../src/client/src/utils'),
      '@admin/router': path.resolve(__dirname, '../../src/client/src/router'),
      '@admin/services': path.resolve(__dirname, '../../src/client/src/services'),
      '@admin/stores': path.resolve(__dirname, '../../src/client/src/stores'),
      '@sample': path.resolve(__dirname, 'src'),
      '@sample/views': path.resolve(__dirname, 'src/views'),
      '@sample/router': path.resolve(__dirname, 'src/router')
    }
  }
}) 