// Card Layout, used in both Map Popups and in the List view
import PropTypes from 'prop-types'
import MarkerIcon from './MarkerIcon';

export const pluralize = (number, word) => {
  return `${number} ${word}${number === 1 ? '' : 's'} `
}

export const LocationData = ({ feature }) => {
  const {
    address,
    name,
    city,
    phone,
    id,
    state
  } = feature.properties

  return (
    <div>
      <div className="flex">
        <MarkerIcon/> Store # {id}
      </div>
      <h3 className="text-lg font-bold">{name}</h3>
      <address>{address}</address>
      <address>{city}, {state}</address>
      <a className="text-deepgreen font-bold" href={`tel:+1${phone}`}>{phone}</a>
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
  const handleClick = () => {
    onClick(feature)
  }

  const isActiveFeature = (feature == activeFeature) ? true : false;

  return (
    <div 
      className={`rounded-md cursor-pointer p-4 ${isActiveFeature ? 'bg-tintgreen border-deepgreen border-2' : 'hover:bg-slate-100'}`} 
     onClick={handleClick}>
        <LocationData feature={feature} activeFeature={activeFeature} />
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
