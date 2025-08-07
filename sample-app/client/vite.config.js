import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
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