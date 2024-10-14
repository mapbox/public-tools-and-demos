// The Sidebar component holds a Location UI component, the Mapbox Search JS 'SearchBox'
// component, the LocationListing component and a nested flex layout via Tailwind classes
// This component hides portions of itself on mobile, reducing down to just the UseMyLocation
// and SearchBoxWrapper on small screens.
'use client'

import React, { useContext } from 'react'
import LocationListing from './LocationListing.jsx'
import SearchBoxWrapper from './SearchBoxWrapper'
import { AppContext } from './Context/AppContext'
import UseMyLocation from './UseMyLocation'

const Sidebar = ({ mapInstanceRef }) => {

    const { 
    features,
    denyLocation,
    setDenyLocation,
    setSearchValue,

  } = useContext(AppContext);

        return (
            <div 
              /* Manually set the height of sidebar minus header to enable proper flex height & overflow scrolling */
              style={{ height: `calc(100vh - 6rem)`}}
              className='absolute sm:relative flex flex-col p-4 w-96'>

                <div className="relative sticky top-0 z-20">
                    <UseMyLocation denyLocation={denyLocation} setDenyLocation={setDenyLocation} setSearchValue={setSearchValue}/>
                    <SearchBoxWrapper mapInstanceRef={mapInstanceRef} />
                </div>
              
                <div className="hidden sm:block">
                  <div className='text-2xl text-black font-semibold w-full mb-1.5 mt-6 z-0'>
                    Stores
                  </div>
                  <div className='mb-4 font-medium text-gray-500'>
                    <span className="text-deepgreen font-bold">{features.length}</span> Stores nearby
                  </div>
                </div>
              
              <LocationListing />

            </div>
        )
}

export default Sidebar;