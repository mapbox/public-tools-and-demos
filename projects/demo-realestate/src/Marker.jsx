// Component for Mapbox GL JS custom HTML Markers
// Given a point feature and map instance, it handles the creation of a Marker and its associated Popup
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import numeral from 'numeral'
import mapboxgl from 'mapbox-gl'

const Marker = ({ feature, map, children }) => {
  const markerRef = useRef()
  const markerEl = useRef()
  const popupEl = useRef()

  const [active, setActive] = useState(false)

  const handlePopupOpen = () => {
    setActive(true)
  }

  const handlePopupClose = () => {
    setActive(false)
  }

  useEffect(() => {
    const marker = new mapboxgl.Marker({
      element: markerEl.current
    })
      .setLngLat(feature.geometry.coordinates)
      .addTo(map)

    marker.addTo(map)

    markerRef.current = marker
  }, [feature])

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return

    let popup

    if (children) {
      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
        closeOnMove: true,
        maxWidth: '300px',
        offset: 14
      })
        .setDOMContent(popupEl.current)
        .on('open', handlePopupOpen)
        .on('close', handlePopupClose)
    }

    // if popup is undefined, this will remove the popup from the marker
    marker.setPopup(popup)
  }, [children])

  if (!feature) return null
  const { sale_price: salePrice } = feature.properties

  return (
    <div>
      <div
        ref={markerEl}
        className={classNames(
          'marker px-3 py-3 rounded-full box-content shadow hover:bg-gray-200 border hover:border-gray-400 mapboxgl-marker mapboxgl-marker-anchor-center font-bold text-base hover:cursor-pointer',
          {
            'bg-gray-200 border-gray-400': active,
            'bg-white border-transparent': !active
          }
        )}
        style={{
          boxShadow: '0px 3px 15px 0px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div
          style={{
            lineHeight: '12px'
          }}
        >
          ${numeral(salePrice).format('0a').toUpperCase()}
        </div>
      </div>
      <div ref={popupEl}>{children}</div>
    </div>
  )
}

Marker.propTypes = {
  children: PropTypes.any,
  feature: PropTypes.shape({
    geometry: PropTypes.shape({
      coordinates: PropTypes.any
    }),
    properties: PropTypes.shape({
      sale_price: PropTypes.any
    })
  }),
  map: PropTypes.any
}

export default Marker
