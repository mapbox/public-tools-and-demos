'use client'

import { useRef, useEffect, useContext } from 'react'
import classNames from 'classnames'
import SearchBoxWrapper from './SearchBoxWrapper.jsx'
import { AppContext } from './Context/AppContext'
import Navbar from './Navbar.jsx'
import UseMyLocation from './UseMyLocation'
import Sidebar from './Sidebar.jsx'

import Map from './Map'
import getUserLocation from './utils'

import './styles.css'

export default function Home() {
  
  // All Top level App state is stored in AppContext
  const { 
    setActiveLocation,
    denyLocation,
    setDenyLocation,
    setSearchValue,
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
      <main className='flex flex-col h-full relative'>
        
        <Navbar/>
        
        {/* Main Content Wrapper */}
        <div className='relative lg:flex grow shrink min-h-0'>
          
          <Sidebar mapInstanceRef={mapInstanceRef} />
          
          <div
            className={classNames('grow shrink-0 relative h-full lg:h-auto')}
          >
            {/* SearchBox for small screens */}
            <div className="lg:hidden md:w-1/3 w-4/5 absolute top-4 left-4 z-10">

            <UseMyLocation denyLocation={denyLocation} setDenyLocation={setDenyLocation} setSearchValue={setSearchValue}/>

              <SearchBoxWrapper
                mapInstanceRef={mapInstanceRef}
              />
            </div>
           
            <Map onLoad={handleMapLoad} />
          </div>
        </div>
      </main>
    </>
  )
}
