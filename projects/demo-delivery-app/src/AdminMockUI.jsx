import PropTypes from 'prop-types'

const AdminMockUI = ({ data }) => {
  return (
    <div className=' bg-gray-100 p-3 rounded-md h-full flex flex-col '>
      {/* Header Row */}
      <header className='flex items-center bg-white shadow-sm px-4 py-2 rounded-t-md mb-0 border-b'>
        {/* Logo */}
        <div
          className='h-6 w-24 bg-no-repeat bg-contain'
          style={{
            backgroundImage: 'url(/demo-delivery-app/img/parcelgo-logo.svg)'
          }}
        />
        {/* Title */}
        <h1 className='text-sm font-semibold text-gray-800 ml-4'>
          Trip Admin Panel
        </h1>
      </header>

      {/* Trip Summary Info */}
      <div className='bg-white shadow px-4 py-3 rounded-b-md mb-3 text-xs text-gray-700 flex flex-wrap gap-x-8 gap-y-2'>
        <div>
          <span className='font-semibold'>Driver:</span> Leslie Smith
        </div>
        <div>
          <span className='font-semibold'>Vehicle #:</span> TX-4521
        </div>
        <div>
          <span className='font-semibold'>Start City:</span> San Francisco, CA
        </div>
        <div>
          <span className='font-semibold'>Destination:</span> New York, NY
        </div>
        <div>
          <span className='font-semibold'>Trip ID:</span> 982374
        </div>
        <div>
          <span className='font-semibold'>Estimated Arrival:</span> June 14,
          2025
        </div>
      </div>

      {/* Table */}
      <div className='bg-white shadow rounded-lg overflow-hidden h-full flex flex-col'>
        <div className='overflow-auto h-full'>
          <table className='min-w-full table-fixed'>
            {/* Fixed header */}
            <thead className='bg-gray-50 sticky top-0 z-10'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Timestamp
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Location
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Fuel Status (%)
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Average Speed (km/h)
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Leg Distance (km)
                </th>
              </tr>
            </thead>
            {/* Scrollable body */}
            <tbody className='divide-y divide-gray-200'>
              {data.map(
                (
                  {
                    timestamp,
                    location,
                    fuelStatus,
                    averageSpeed,
                    legDistance
                  },
                  i
                ) => (
                  <tr key={i}>
                    <td className='px-6 py-2 whitespace-nowrap text-xs text-gray-700'>
                      {timestamp}
                    </td>
                    <td className='px-6 py-2 whitespace-nowrap text-xs text-gray-700'>
                      {location}
                    </td>
                    <td
                      className={`px-6 py-2 whitespace-nowrap text-xs ${
                        parseInt(fuelStatus) > 60
                          ? 'text-green-600'
                          : parseInt(fuelStatus) > 30
                          ? 'text-yellow-500'
                          : 'text-red-600'
                      }`}
                    >
                      {fuelStatus}
                    </td>
                    <td className='px-6 py-2 whitespace-nowrap text-xs text-gray-700'>
                      {averageSpeed}
                    </td>
                    <td className='px-6 py-2 whitespace-nowrap text-xs text-gray-700'>
                      {legDistance}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

AdminMockUI.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      fuelStatus: PropTypes.string.isRequired,
      averageSpeed: PropTypes.string.isRequired,
      legDistance: PropTypes.string.isRequired
    })
  )
}

export default AdminMockUI
