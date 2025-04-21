// AppContextProvider wraps main App.jsx

'use client'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './Context/AppContext'
import { PageShell } from 'mapbox-demo-components'

import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <PageShell>
      <BrowserRouter>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </BrowserRouter>
    </PageShell>
  </React.StrictMode>
)
