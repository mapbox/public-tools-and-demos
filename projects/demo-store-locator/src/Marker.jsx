// Component for Mapbox GL JS custom HTML Markers
// Given a point feature and map instance, it handles the creation of a Marker and its associated Popup
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

const Marker = ({ feature, map, children, activeFeature, searchResult }) => {
  const markerRef = useRef()
  const popupEl = useRef()

  //console.log("marker renders for", feature.properties.name);

  useEffect(() => {
    // Remove previous marker if it exists
    if(markerRef.current) {
      //console.log("marker removed for", markerRef.current)
      markerRef.current.remove()
    }

    // const el = <div 
    //             style={{
    //               //backgroundImage: `url('img/location-marker.svg')`,
    //               backgroundColor: "red",
    //               backgroundSize: "cover",
    //               width: "50px",
    //               height: "50px",
    //               borderRadius: "50%",
    //               cursor: "pointer"
    //           }}>
    //         </div>;

    // Need to 'react' this
    const el = document.createElement('div');
    el.className = 'marker';

    const marker = new mapboxgl.Marker(el)
      .setLngLat(feature.geometry.coordinates)
      .addTo(map)

    console.log("Marker added for", feature.properties.name);

    markerRef.current = marker
  
  }, [])

  // Add popup to active Feature
  useEffect(() => {
    if (feature == activeFeature) {
      let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
        closeOnMove: true,
        maxWidth: '300px',
        offset: 30
      }).setDOMContent(popupEl.current)
    
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
      <div className={` ${(feature == activeFeature ) ? '' : 'hidden'} bg-white rounded-md cursor-pointer p-4`} ref={popupEl}>{children}</div>
    </>
  )

}

Marker.propTypes = {
  children: PropTypes.any,
  feature: PropTypes.shape({
    geometry: PropTypes.shape({
      coordinates: PropTypes.any
    })
  }),
  map: PropTypes.any
}

export default Marker
