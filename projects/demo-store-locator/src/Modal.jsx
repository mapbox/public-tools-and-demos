import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import StaticMapImage from './StaticMap'
import MapboxTooltip from './MapboxTooltip'
import { PropertyData } from './Card'

const Modal = ({ feature, onClose }) => {
  const [lng, lat] = feature.geometry.coordinates
  const { imageUrl } = feature.properties

  return (
    <>
      {/* gray out background */}
      <div className='justify-center items-start flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none'>
        {/* modal outer container */}
        <div
          className=' shadow-lg absolute flex flex-col px-3 '
          style={{
            width: 550,
            maxWidth: '100%'
          }}
        >
          {/* modal inner container */}
          <div className='bg-white outline-none focus:outline-none overflow-scroll rounded-2xl my-12 relative'>
            <div className='absolute top-0 right-0 m-6'>
              <button
                className='z-50 h-8 w-8 bg-gray-100 hover:bg-gray-200 flex justify-center items-center rounded-md '
                onClick={onClose}
              >
                <FontAwesomeIcon
                  icon={faTimes}
                  size='lg'
                  className='text-gray-500'
                />
              </button>
            </div>
            <div
              className='bg-cover h-80 lg:h-80 '
              style={{
                backgroundImage: `url("${
                  import.meta.env.BASE_URL
                }/${imageUrl}")`
              }}
            />
            <div className='p-6'>
              <PropertyData feature={feature} large />
              <p className='mb-6'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                sed erat rutrum, eleifend sem eu, blandit nisi. Nullam finibus
                aliquet nisi nec pharetra. Ut suscipit laoreet est. Cras
                fringilla justo in rutrum commodo. Nam vehicula lectus id
                condimentum lacinia.
              </p>
              <div>
                <div className='relative'>
                  <MapboxTooltip
                    title='Static Images API'
                    className='absolute top-3 left-3'
                  >
                    {`
The [Mapbox Static Images API](https://docs.mapbox.com/api/maps/static-images/) serves standalone, static map images generated from Mapbox Studio styles. These images can be displayed on web and mobile devices without the aid of a mapping library or API. They look like an embedded map, but do not have interactivity or controls.

This demo uses a custom React component which calculates the dimensions of the containing div, then sets its background image to a map image from the Static Images API with the same dimensions.

* [Static Images API Playground](https://docs.mapbox.com/playground/static/)
* [Static Images API Documentation](https://docs.mapbox.com/api/maps/static-images/)
                                `}
                  </MapboxTooltip>

                  <StaticMapImage lng={lng} lat={lat} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='opacity-25 fixed inset-0 z-40 bg-black'></div>
    </>
  )
}

Modal.propTypes = {
  feature: PropTypes.shape({
    geometry: PropTypes.shape({
      coordinates: PropTypes.any
    }),
    properties: PropTypes.shape({
      imageUrl: PropTypes.any
    })
  }),
  onClose: PropTypes.any
}

export default Modal
