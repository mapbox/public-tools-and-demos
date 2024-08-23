// Card Layout, used in both Map Popups and in the List view
import PropTypes from 'prop-types'
import MarkerIcon from './MarkerIcon';

export const pluralize = (number, word) => {
  return `${number} ${word}${number === 1 ? '' : 's'} `
}

export const PropertyData = ({ feature }) => {
  const {
    address,
    name,
    city,
    phone,
    id,
    state
  } = feature.properties

  return (
    <div className="bg-white">
      <div className="flex">
        <MarkerIcon /> Store # {id}
      </div>
      <h3 className="text-lg font-bold">{name}</h3>
      <address>{address}</address>
      <address>{city}, {state}</address>
      <a href={`tel:+1${phone}`}>{phone}</a>
    </div>
  )
}

PropertyData.propTypes = {
  feature: PropTypes.shape({
    properties: PropTypes.shape({
      sale_price: PropTypes.any,
      number_of_bedrooms: PropTypes.any,
      number_of_bathrooms: PropTypes.any,
      total_livable_area: PropTypes.any,
      location: PropTypes.any
    })
  }),
  large: PropTypes.bool
}

const Card = ({ feature, onClick, activeFeature }) => {
  const handleClick = () => {
    onClick(feature)
  }

  if(activeFeature) {
    console.log("this is the active feature", activeFeature);
  }
  const isActiveFeature = (feature == activeFeature) ? true : false;

  return (
    <div 
      className={`rounded-md cursor-pointer p-4 ${isActiveFeature ? 'bg-tintgreen border-deepgreen border-2' : 'hover:bg-slate-100'}`} 
     onClick={handleClick}>
        <PropertyData feature={feature} activeFeature={activeFeature} />
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
