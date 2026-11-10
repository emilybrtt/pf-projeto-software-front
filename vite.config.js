import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em dev, /api/... é redirecionado para o back local (igual ao vercel.json em produção)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
