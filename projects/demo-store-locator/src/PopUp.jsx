// Component for Mapbox GL JS custom HTML Markers
// Given a point feature and map instance, it handles the creation of a Marker and its associated Popup
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { LocationData } from './Card';

const PopUp = ({ feature, map, markerRef }) => {
  console.log("runs");
  const popupEl = useRef();

  function handlePopupOpen() {
    console.log("opens")
  }

  function handlePopupClose() {
    console.log("closes")
  }

  // Add popup to active Feature
  useEffect(() => {
    // if(feature) {
    //   console.log("feature ", feature.properties.name, " is active");
    //   console.log("markerRef is", markerRef);
    // }

      let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
        closeOnMove: true,
        maxWidth: '300px',
        offset: 30
      })
      .setDOMContent(popupEl.current)
      .on('open', handlePopupOpen)
      .on('close', handlePopupClose)
    
      // if popup is undefined, this will remove the popup from the marker
      markerRef.setPopup(popup);
    
      // once the map has moved to the 
      map.on('moveend', () => {
        console.log("map finishes move");
        markerRef.togglePopup();       
      });

    return () => {
      // Nuke the PopUp from the DOM on component unmount
    };

  })

  return (
    <>
      <div ref={popupEl} className={`bg-white rounded-md cursor-pointer p-4`}>Hello!</div>
    </>
  )

}

PopUp.propTypes = {
  // children: PropTypes.any,
  // feature: PropTypes.shape({
  //   geometry: PropTypes.shape({
  //     coordinates: PropTypes.any
  //   })
  // }),
  // map: PropTypes.any
}

export default PopUp;
