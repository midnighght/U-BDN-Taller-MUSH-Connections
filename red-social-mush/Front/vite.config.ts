import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    port: 5174, // ✅ Cambia a 5174 (o el puerto que quieras)
    // port: 3001, // O cualquier otro puerto disponible
  }
})
