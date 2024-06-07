import PropTypes from 'prop-types'
const BoatImage = ({ color }) => {
  return (
    <svg
      className='h12 w12 mr6 mb3'
      style={{ transform: 'rotate(30deg)' }}
      width='15'
      height='15'
      viewBox='0 0 15 15'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M 7.5 1 C 7 1 4 5 4 8 L 4 12.5 C 4 13.328 4.672 14 5.5 14 L 9.5 14 C 10.328 14 11 13.329 11 12.501 L 11 8 C 11 5 8 1 7.5 1 Z'
        stroke='black'
        strokeWidth='1'
        fill={color}
      />
    </svg>
  )
}

BoatImage.propTypes = {
  color: PropTypes.string
}

export default BoatImage
