import React from 'react'

import { AppProvider } from './context/AppContext'
import MapContainer from './components/MapContainer'
import Navbar from './components/NavBar'

import './style.css'

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <AppProvider>
        <MapContainer />
      </AppProvider>
    </>
  )
}

export default App
