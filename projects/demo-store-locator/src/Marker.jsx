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
       <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M5 7.71428C5 5.15607 7.19204 3 10 3C12.808 3 15 5.15607 15 7.71428C15 9.11527 14.179 10.8133 12.9489 12.6083C12.0915 13.8594 11.1256 15.0366 10.2524 16.1008C10.1673 16.2045 10.0831 16.3071 10 16.4086C9.91686 16.3071 9.83265 16.2045 9.74757 16.1008C8.8744 15.0366 7.9085 13.8594 7.0511 12.6083C5.82101 10.8133 5 9.11527 5 7.71428Z'
      stroke='#006241'
      strokeWidth='2'
    />
  </svg>
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
