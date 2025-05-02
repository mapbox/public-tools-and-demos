import PropTypes from 'prop-types'
import Header from './header'

const FullscreenMapLayout = ({
  headerProps,
  mapComponent,
  children,
  sidebarSize = 'w300'
}) => {
  return (
    <div
      id='container'
      className='flex flex--column-reverse bg-white select-none absolute top right bottom left hmax-full'
    >
      <div className='flex-child-grow relative flex flex--column'>
        {mapComponent}
        {/* medium+ sidebar */}
        <div
          className={`${sidebarSize} absolute left mx6 my6 px6 py6 top-ml none block-ml z4 bottom mb30 hmax-full`}
        >
          <div className='bg-white h-auto-ml hmax-full px12 py12 round-ml scroll-auto shadow-darken25 shadow-none-ml viewport-third overflow-scroll'>
            {children}
          </div>
        </div>
        {/* end medium+ sidebar */}
        <div className='px12 py12 block none-ml hmax240 overflow-scroll'>
          {children}
        </div>
      </div>
      <Header {...headerProps} />
    </div>
  )
}

FullscreenMapLayout.propTypes = {
  children: PropTypes.node,
  headerProps: PropTypes.object,
  mapComponent: PropTypes.node,
  sidebarSize: PropTypes.string
}

export default FullscreenMapLayout
