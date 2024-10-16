// This returns our Mapbox Tooltips for demo purposes. This is imported from
// `projects/demo-components` in this repo and can easily be removed. 
// The remaining Navbar is for layout purposes only.

'use client'

import React from 'react'
import { MapboxTooltips } from 'mapbox-demo-components'
import cafeLogo from './img/cafe-logo.svg'

const Navbar = () => {

    return (
        <>
            <MapboxTooltips 
                bgColor={'maroon'}
                products={['Mapbox GL JS', 'Mapbox Search JS', 'MTS Clustering', 'Mapbox Standard Style', 'Map Markers', 'Popups', 'Source Code']}/>

            <div className='flex shrink-0 justify-between h-16 py-12 items-center border-b border-gray-200 bg-white z-10'>
                <div className='bg-contain bg-center bg-no-repeat ml-8'
                style={{
                height: 95,
                width: 331,
                backgroundImage: `url(${cafeLogo})`
                }}
                ></div>
            </div>
        </>
    )
}

export default Navbar;