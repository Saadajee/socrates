// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',          // Allows access from network (useful for testing)
    port: 3000,               // Default Vite port (or change to 3000 if you prefer)
    strictPort: true,         // Fail if port is already in use
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8000',  // Your FastAPI backend
        changeOrigin: true,
        secure: false,
      },
      '/rag': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
