import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error internal build script, no shipped types
import { sriManifestPlugin } from './scripts/sri-plugin.mjs'

export default defineConfig({
  plugins: [react(), sriManifestPlugin()],
  resolve: {
    alias: { '@': '/src' },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          motion: ['gsap'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
