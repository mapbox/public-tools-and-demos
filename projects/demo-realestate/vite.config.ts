import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/demo-realestate',
  envDir: '../',
  resolve: {
    // `mapbox-demo-components` is a symlinked workspace package with no React of
    // its own, so it resolves the hoisted React 18 at the repo root while this
    // project uses its own nested React 19. Two React copies in one tree throws
    // "Invalid hook call" the moment a shared component uses a hook.
    dedupe: ['react', 'react-dom', 'mapbox-gl']
  }
})
