// Component for Mapbox GL JS custom HTML Markers
// Given a point feature and map instance, it handles the creation of a Marker and its associated Popup
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { LocationData } from './Card';

const PopUp = ({ feature, map, markerRef }) => {
  console.log("runs");
  const popupEl = useRef();



  

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
