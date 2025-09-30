import React from 'react'
import { AppProvider } from './context/AppContext'
import MapContainer from './components/MapContainer'
import './style.css'

const App: React.FC = () => {
  return (
    <AppProvider>
      <MapContainer />
    </AppProvider>
  )
}

export default App
