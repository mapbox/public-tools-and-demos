import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mapbox/mbx-assembly/dist/assembly.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
