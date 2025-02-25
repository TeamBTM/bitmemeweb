import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'supabase': ['@supabase/supabase-js']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 4096
  },
  server: {
    port: 3000,
    strictPort: true,
    cors: true,
    proxy: {}
  },
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', '@supabase/supabase-js']
  }
})
