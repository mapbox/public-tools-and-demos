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
            <div className='flex flex-col p-4 w-96 '>

              <div className="sticky top-0">
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
              </div>
              
              <LocationListing />

            </div>
    
        )
}

export default Sidebar;