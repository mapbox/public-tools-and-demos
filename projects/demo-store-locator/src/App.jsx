// Top Level App component
// This imports AppContext, Sets up the app layout and imports our
// Navbar, Sidebar (search & location listing)  & Map

'use client'

import { useRef, useEffect, useContext } from 'react'
import { AppContext } from './Context/AppContext'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

import Map from './Map'
import getUserLocation from './utils'

import './styles.css'

export default function Home() {
  // All Application state is stored in AppContext
  const { setActiveLocation, setDenyLocation, setLoadingUserLocation } =
    useContext(AppContext)

  // A ref to hold the Mapbox GL JS Map instance
  const mapInstanceRef = useRef()

  // Use Effect to request Users Location on App mount
  useEffect(() => {
    setLoadingUserLocation(true)
    getUserLocation(setActiveLocation, setLoadingUserLocation, setDenyLocation)
  }, [])

  // // when the map loads
  const handleMapLoad = (map) => {
    mapInstanceRef.current = map
  }

  return (
    <>
      <main className='flex flex-col h-screen relative'>
        <Navbar />

        {/* Main Content Wrapper */}
        <div className='flex grow relative'>
          <Sidebar mapInstanceRef={mapInstanceRef} />

          <Map onLoad={handleMapLoad} />
        </div>
      </main>
    </>
  )
}
