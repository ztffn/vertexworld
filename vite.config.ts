import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    open: true,
    strictPort: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    sourcemap: true
  }
})
