'use client'

import { useRef, useEffect, useContext } from 'react'
import SearchBoxWrapper from './SearchBoxWrapper.jsx'
import { AppContext } from './Context/AppContext'
import Header from './Header.jsx'
import UseMyLocation from './UseMyLocation'
import Sidebar from './Sidebar.jsx'

import Map from './Map'
import getUserLocation from './utils'

import './styles.css'

export default function Home() {
  
  // All Top level App state is stored in AppContext
  const { 
    setActiveLocation,
    setDenyLocation,
    setLoadingUserLocation, 
  } = useContext(AppContext);

  // a ref to hold the Mapbox GL JS Map instance
  const mapInstanceRef = useRef()

  // Use Effect to request Users Location on App mount
  useEffect(() => {
    setLoadingUserLocation(true);
    getUserLocation(setActiveLocation, setLoadingUserLocation, setDenyLocation);
  }, []);

  // // when the map loads
  const handleMapLoad = (map) => {
    mapInstanceRef.current = map
  }

  return (
    <>
      <main className='flex flex-col h-screen relative'>
        
        <Header/>
        
        {/* Main Content Wrapper */}
        <div className='flex grow relative'>
          
          <Sidebar mapInstanceRef={mapInstanceRef} />
           
          <Map onLoad={handleMapLoad} />
          
        </div>
      </main>
    </>
  )
}
