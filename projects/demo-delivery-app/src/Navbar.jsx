// This returns our Mapbox Tooltips for demo purposes. This is imported from
// `projects/demo-components` in this repo and can easily be removed.
// The remaining Navbar is for layout purposes only.

'use client'

import { MapboxTooltips } from 'mapbox-demo-components'
// import cafeLogo from './img/cafe-logo.svg'

const Navbar = () => {
  return (
    <>
      <MapboxTooltips
        products={[
          'Geocoding API',
          'Static Images API',
          'Mapbox GL JS',
          'Mapbox Standard Style',
          'Map Markers',
          'Source Code'
        ]}
      />

      <div className='flex shrink-0 h-16 py-6 items-center border-b border-gray-200 bg-white z-10 font-bold text-md sm:text-xl'>
        <div
          className='bg-contain bg-center bg-no-repeat ml-8 mr-3'
          style={{
            height: 30,
            width: 30,
            backgroundImage: `url(/demo-delivery-app/img/mapbox-logo.svg)`
          }}
        ></div>
        Mapbox Delivery App Demo
      </div>
    </>
  )
}

export default Navbar
