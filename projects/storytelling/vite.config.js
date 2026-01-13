import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  base: '/storytelling',
  envDir: '../',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        storytelling: resolve(__dirname, 'storytelling.html')
      }
    }
  }
})
