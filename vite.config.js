import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy /api/* to the real backend to avoid CORS in dev
      '/api': {
        target: 'https://api.vita-balans.uz',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxy for vita-backend promotions API
      '/vita-api': {
        target: 'https://vita-backend.jprq.live',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/vita-api/, ''),
      },
    },
  },
})