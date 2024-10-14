// Card Layout, used in both Map Popups and in the LocationListing view
// This component also makes use of turf.js (https://turfjs.org) to calculate
// the distance from the activeLocation (either user location or search location)
// to the store location. The results are returned in miles and added to the card
// LocationData is used in both Popups and in the Sidebar, while the Card component
// with additional hover logic is only used in the Sidebar

'use client'

import React from 'react';
import PropTypes from 'prop-types'
import MarkerIcon from './MarkerIcon';
import { distance } from "@turf/distance";
import { useContext } from 'react';
import { AppContext } from './Context/AppContext';

export const pluralize = (number, word) => {
  return `${number} ${word}${number === 1 ? '' : 's'} `
}

export const LocationData = ({ feature }) => {
  const { coordinates } = feature.geometry;
  const { activeLocation } = useContext(AppContext);
  const {
    address,
    name,
    city,
    phone,
    id,
    state
  } = feature.properties
  
  // Use turf.js to calculate distance from map Center (userLocation or search Location) to Feature
  function getDistance(feature, location) {
    var options = {units: 'miles'};
    var distanceTo = distance(location, feature, options).toFixed(1);
    return distanceTo;
  }

  return (
    <div className="flex justify-between w-full">
      <div className="grow">
        <div className="flex">
          <MarkerIcon/> Store # {id}
        </div>
        <h3 className="text-lg font-bold">{name}</h3>
        <address>{address}</address>
        <address>{city}, {state}</address>
        <a className="text-deepgreen font-bold" href={`tel:+1${phone}`}>{phone}</a>
      </div>      
      <div className="text-slate-400 min-w-16 text-right">
        {activeLocation ? `${getDistance(coordinates, activeLocation.coords)} mi`: ''}
      </div>
    </div>
  )
}

LocationData.propTypes = {
  feature: PropTypes.shape({
    properties: PropTypes.shape({
      address: PropTypes.string,
      name: PropTypes.string,
      phone: PropTypes.any,
      id: PropTypes.string,
      state: PropTypes.string
    })
  })
}

const Card = ({ feature, onClick, activeFeature }) => {
  const { hoveredFeature, setHoveredFeature } = useContext(AppContext);

  const handleClick = () => {
    onClick(feature)
  }

  function handleMouseEnter() {
    setHoveredFeature(feature)
  }
  function handleMouseLeave() {
    setHoveredFeature('')
  }

  const isActiveFeature = (feature.properties.name == activeFeature?.properties.name) ? true : false;
  
  let isMarkerHovered;
  
  if(hoveredFeature) {
    isMarkerHovered = (feature.properties.address == hoveredFeature.properties.address) ? true : false;
  }

  return (
    <div 
      className={
          `rounded-md cursor-pointer p-4 
          ${isActiveFeature ? 'bg-tintgreen border-deepgreen border-2' : 'hover:bg-slate-100'}
          ${isMarkerHovered ? 'bg-slate-100' : ''}`} 
      onClick={handleClick}
      onMouseOver={handleMouseEnter}
      onMouseOut={handleMouseLeave}>
        <LocationData feature={feature} activeFeature={activeFeature}/>
    </div>
  )
}

Card.propTypes = {
  feature: PropTypes.shape({
    properties: PropTypes.shape({
      imageUrl: PropTypes.string
    })
  }),
  onClick: PropTypes.func,
  shortImage: PropTypes.bool,
  width: PropTypes.string
}

export default Card
