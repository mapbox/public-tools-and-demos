import PropTypes from 'prop-types'
import Header from './header'

const FullscreenLayout = ({ headerProps, children }) => {
  return (
    <div
      id='container'
      className='flex flex--column-reverse bg-white select-none absolute top right bottom left hmax-full'
    >
      <div className='flex-child-grow relative flex flex--column'>
        {children}
      </div>
      <Header {...headerProps} />
    </div>
  )
}

FullscreenLayout.propTypes = {
  children: PropTypes.node,
  headerProps: PropTypes.object
}

export default FullscreenLayout
