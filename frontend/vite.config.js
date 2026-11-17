import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(
      process.env.VITE_GOOGLE_CLIENT_ID || '644095720788-r9g3vilicu1c4k3v2dp59e92gskte0qe.apps.googleusercontent.com'
    ),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})
