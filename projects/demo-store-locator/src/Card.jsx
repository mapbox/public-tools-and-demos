// Card Layout, used in both Map Popups and in the List view
import PropTypes from 'prop-types'
import MarkerIcon from './MarkerIcon';

export const pluralize = (number, word) => {
  return `${number} ${word}${number === 1 ? '' : 's'} `
}

export const PropertyData = ({ feature, large = false }) => {
  const {
    address,
    name,
    city,
    phone,
    id,
    state
  } = feature.properties

  const largerTextClass = large ? 'text-2xl' : 'text-xl'
  const smallerTextClass = large ? 'text-base' : 'text-sm'
  const xPaddingClass = large ? 'p-0' : 'p-3'

  return (
    <div className=" bg-slate-200 hover:bg-sky-200 p-4 rounded-md">
      <div className="flex">
        <MarkerIcon /> Store # {id}
      </div>
      <h3 className="text-lg font-bold">{name}</h3>
      <address>{address}, {state}</address>
      <tel>{phone}</tel>
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

const Card = ({ feature, width = 'auto', shortImage = false, onClick }) => {
  const handleClick = () => {
    onClick(feature)
  }

  const { imageUrl } = feature.properties

  return (
    <div className='cursor-pointer' onClick={handleClick}>
        <PropertyData feature={feature} />
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
