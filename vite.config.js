import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // 👈 mejor que '0.0.0.0'
    port: 5174,
    strictPort: true,
    cors: true, // 👈 importante para ngrok
    hmr: {
      clientPort: 5174
    }
  }
})