// Card Layout, used in both Map Popups and in the List view
import PropTypes from 'prop-types'
import MarkerIcon from './MarkerIcon';
import { distance } from "@turf/distance";
import { useContext } from 'react';
import { LocationContext } from './Context/LocationContext';

export const pluralize = (number, word) => {
  return `${number} ${word}${number === 1 ? '' : 's'} `
}

export const LocationData = ({ feature }) => {
  const { coordinates } = feature.geometry;
  const { activeLocation } = useContext(LocationContext);
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
    <div className="flex justify-between">
      <div>
        <div className="flex">
          <MarkerIcon/> Store # {id}
        </div>
        <h3 className="text-lg font-bold">{name}</h3>
        <address>{address}</address>
        <address>{city}, {state}</address>
        <a className="text-deepgreen font-bold" href={`tel:+1${phone}`}>{phone}</a>
      </div>      
      <div className="text-slate-400">
        {activeLocation ? `${getDistance(coordinates, activeLocation)} mi`: ''}
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

const Card = ({ feature, onClick, activeFeature, userLocation }) => {
  const handleClick = () => {
    onClick(feature)
  }

  const isActiveFeature = (feature == activeFeature) ? true : false;

  return (
    <div 
      className={`rounded-md cursor-pointer p-4 ${isActiveFeature ? 'bg-tintgreen border-deepgreen border-2' : 'hover:bg-slate-100'}`} 
     onClick={handleClick}>
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
