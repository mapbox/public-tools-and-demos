import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PageShell from 'mapbox-demo-components/src/page-shell'

import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageShell>
      <App />
    </PageShell>
  </StrictMode>
)
