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
    isMobile 
  } = useContext(AppContext);

   if(!isMobile)  {
        return (
            <div className='flex absolute lg:static flex-col top-0 p-4 lg:w-96 lg:min-w-96 z-20 lg:z-30 h-full lg:h-auto bg-white'>

              {/* Searchbox for Large screens */}
              <div>
                <UseMyLocation denyLocation={denyLocation} setDenyLocation={setDenyLocation} setSearchValue={setSearchValue}/>
                
                <SearchBoxWrapper mapInstanceRef={mapInstanceRef} />
              </div>
            
               
              <div className='text-2xl text-black font-semibold w-full mb-1.5 mt-6 z-0'>
                Stores
              </div>
              <div className='mb-4 z-0'>
                <div className='font-medium text-gray-500'>
                  <span className="text-deepgreen font-bold">{features.length}</span> Stores nearby
                </div>
              </div>
              
              <LocationListing />

            </div>
    
        )
   }
}

export default Sidebar;