import PropTypes from 'prop-types'

const Link = ({ to, children }) => (
  <a
    className='text-blue-600 hover:text-blue-500 font-bold hover:underline'
    href={to}
    rel='noopener noreferrer'
  >
    {children}
  </a>
)

Link.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

const Instructions = () => (
  <div className='sm:absolute top-6 left-6 right-6 bg-white z-10 text-xs rounded-md sm:p-4 sm:max-w-96 sm:shadow'>
    <p className='mb-3'>
      Drag the truck icon to a new location to simulate a shipment in progress.
    </p>

    <p className='mb-3'>
      When the truck stops, the app initiates a{' '}
      <Link to='https://docs.mapbox.com/api/search/geocoding/#reverse-geocoding'>
        reverse geocoding request
      </Link>{' '}
      to fetch a human-readable address from its GPS coordinates
    </p>

    <p className=''>
      You can then use this location text, along with a{' '}
      <Link to='https://docs.mapbox.com/api/maps/static-images/'>
        static map image
      </Link>
      , to show the shipment&apos;s location in a consumer-facing app.
    </p>
  </div>
)

export default Instructions
