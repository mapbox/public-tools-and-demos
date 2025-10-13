// This returns our Mapbox Tooltips for demo purposes. This is imported from
// `projects/demo-components` in this repo and can easily be removed.
// The remaining Navbar is for layout purposes only.

import { MapboxTooltips } from 'mapbox-demo-components'

const Navbar = () => {
  return (
    <>
      <MapboxTooltips
        products={[
          'Search Box API',
          'Details API',
          'Mapbox GL JS',
          'Mapbox Standard Style',
          'Source Code'
        ]}
        projectFolder='gl-js-pin-powered'
      />

      <div className='flex shrink-0 h-16 py-12 md:py-6 items-center border-b border-gray-200 bg-white z-10 font-bold text-md sm:text-xl'>
        <div
          className='bg-contain bg-center bg-no-repeat ml-8 mr-3'
          style={{
            height: 30,
            width: 30,
            backgroundImage: `url(./mapbox-logo.svg)`
          }}
        ></div>
        Mapbox GL JS Pin Powered Demo
      </div>
    </>
  )
}

export default Navbar
