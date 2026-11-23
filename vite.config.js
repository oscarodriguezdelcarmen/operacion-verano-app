import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/operacion-verano-app/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
