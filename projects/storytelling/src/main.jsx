import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { PageShell } from 'mapbox-demo-components'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <PageShell>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PageShell>
  </React.StrictMode>
)
