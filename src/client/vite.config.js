import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
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
})
