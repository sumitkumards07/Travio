import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Travelpayouts API to avoid CORS issues in development
      '/api/travelpayouts': {
        target: 'https://api.travelpayouts.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/travelpayouts/, ''),
        headers: {
          'Origin': 'https://www.travelpayouts.com'
        }
      }
    }
  }
})
