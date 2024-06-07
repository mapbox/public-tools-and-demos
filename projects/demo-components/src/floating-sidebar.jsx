import PropTypes from 'prop-types'
const FloatingSidebar = ({ children }) => {
  return (
    <div className='absolute left mx6 my6 px6 py6 top-ml w360-ml'>
      <div className='bg-white h-auto-ml hmax-full px12 py12 round-ml scroll-auto shadow-darken25 viewport-third'>
        {children}
      </div>
    </div>
  )
}

FloatingSidebar.propTypes = {
  children: PropTypes.node
}

export default FloatingSidebar
