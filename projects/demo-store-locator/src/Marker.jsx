// Component for Mapbox GL JS custom HTML Markers
// Given a point feature and map instance, it handles the creation of a Marker and its associated Popup
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

const Marker = ({ feature, map, children, activeFeature }) => {
  const markerRef = useRef()
  const markerEl = useRef()
  const popupEl = useRef()

  const [active, setActive] = useState(false)

  const handlePopupOpen = () => {
    console.log("pops open");
    setActive(true)
  }

  const handlePopupClose = () => {
    setActive(false)
  }

  useEffect(() => {
    // Remove previous marker if it exists
    if(markerRef.current) {
      markerRef.current.remove()
    }

    const marker = new mapboxgl.Marker({
      element: markerEl.current,
      color: "#006241",
    })
      .setLngLat(feature.geometry.coordinates)
      .addTo(map)

    marker.addTo(map)
    markerRef.current = marker
  
  }, [])

  useEffect(() => {
    // Add popup to active Feature
    if (feature == activeFeature) {
      let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
        closeOnMove: true,
        maxWidth: '300px',
        offset: 30
      })
        .setDOMContent(popupEl.current)
        .on('open', handlePopupOpen)  
  
      // if popup is undefined, this will remove the popup from the marker
      markerRef.current.setPopup(popup)
    
      // once the map has moved to the 
      map.on('moveend', () => {
        markerRef.current.togglePopup();       
      });

    }
    
    // Remove popups of inactive Features
    if (feature !== activeFeature) {
      markerRef.current.setPopup(null);
    }
  }, [activeFeature])

  if (!feature) return null

  return (
    <>
      <div ref={popupEl}>{children}</div>
    </>
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
