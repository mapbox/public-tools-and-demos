import PropTypes from 'prop-types'
import CurrentLocationMap from './CurrentLocationMap'

const BoxIcon = () => (
  <div className='bg-gray-100 p-3 rounded-lg'>
    <div
      className=''
      style={{
        backgroundImage: `url(/demo-delivery-app/img/icon-box.svg)`,
        height: 16,
        width: 16,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat'
      }}
    />
  </div>
)

export default function DeliveryAppUI({ location, point }) {
  return (
    <div className='min-h-screen bg-gray-100 p-4 font-sans'>
      <div
        className='text-center mx-auto my-5'
        style={{
          backgroundImage: `url(/demo-delivery-app/img/parcelgo-logo.svg)`,
          height: 30,
          width: 127,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Header */}
      <div className='flex flex-col  justify-between bg-white p-4 rounded-lg shadow mb-4'>
        <div className='mb-3'>
          <h3 className='text-lg font-semibold text-neutral-700 text-sm mb-1'>
            Current Shipment
          </h3>
          <p className='text-xs text-slate-600'>
            On the way • Expected on Friday
          </p>
        </div>
        <div className='mb-3'>
          <CurrentLocationMap point={point} />
        </div>
        <h3 className='text-lg font-semibold text-neutral-700 text-sm mb-1'>
          {location}
        </h3>
      </div>
      <div className='flex flex-col  justify-between bg-white p-4 rounded-lg shadow mb-4'>
        <div>
          <h3 className='text-lg font-semibold text-neutral-700 text-sm mb-1'>
            Package Details
          </h3>
          <p className='text-xs text-slate-600'>
            Express Delivery • 2 items (8 lbs)
          </p>
        </div>
      </div>
      <div className='flex flex-col  justify-between bg-white p-4 rounded-lg shadow mb-4'>
        <div className='mb-3'>
          <h3 className='text-lg font-semibold text-neutral-700 text-sm mb-1'>
            Tracking ID:{' '}
            <span className='font-normal text-slate-600'>TY9860026NM</span>
          </h3>
        </div>
        <div className='flex items-center mb-3'>
          <BoxIcon />
          <div className=' flex-grow font-semibold text-neutral-700 text-xs ml-3'>
            Mapbox Tote Bag
          </div>
          <div className=' text-xs font-normal text-slate-600 '>$39</div>
        </div>
        <div className='flex items-center mb-3'>
          <BoxIcon />
          <div className=' flex-grow font-semibold text-neutral-700 text-xs ml-3'>
            Bulk Vector Tiles
          </div>
          <div className=' text-xs font-normal text-slate-600 '>$1290</div>
        </div>
      </div>
    </div>
  )
}

DeliveryAppUI.propTypes = {
  location: PropTypes.any,
  point: PropTypes.any
}
