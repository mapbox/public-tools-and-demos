// Mapbox Tooltip - for adding hints about Mapbox features

import PropTypes from 'prop-types'
import { Tooltip } from 'react-tooltip'
import Markdown from 'react-markdown'
import classNames from 'classnames'

const LogoSVG = () => (
  <svg
    width='14'
    height='14'
    viewBox='0 0 178 178'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M89.025 0.100006C39.925 0.100006 0.125 39.9 0.125 89C0.125 138.1 39.925 177.9 89.025 177.9C138.125 177.9 177.925 138.1 177.925 89C177.925 39.9 138.125 0.100006 89.025 0.100006ZM131.225 110.8C100.825 141.2 46.525 131.5 46.525 131.5C46.525 131.5 36.725 77.3 67.225 46.8C84.125 29.9 112.125 30.6 129.825 48.2C147.525 65.8 148.125 93.9 131.225 110.8Z'
      fill='black'
    />
    <path
      d='M99.2251 52.2L90.525 70.1L72.6249 78.8L90.525 87.5L99.2251 105.4L107.925 87.5L125.825 78.8L107.925 70.1L99.2251 52.2Z'
      fill='black'
    />
  </svg>
)

const Content = ({ markdownString }) => {
  return (
    <Markdown
      components={{
        h2(props) {
          const { ...rest } = props
          return <h2 className='font-bold mb-3' {...rest} />
        },
        // Rewrite `em`s (`*like so*`) to `i` with a red foreground color.
        em(props) {
          // eslint-disable-next-line
          const { node, ...rest } = props
          return <i style={{ color: 'red' }} {...rest} />
        },
        a(props) {
          const { ...rest } = props
          return (
            <a
              className='text-blue-600 hover:text-blue-800'
              target='_blank'
              {...rest}
            />
          )
        },
        p(props) {
          const { ...rest } = props
          return <p className='mb-2' {...rest} />
        },
        li(props) {
          const { ...rest } = props
          return <li className='list-disc ml-3' {...rest} />
        }
      }}
    >
      {markdownString}
    </Markdown>
  )
}

Content.propTypes = {
  markdownString: PropTypes.any
}

const MapboxTooltip = ({ className, title, children }) => {
  return (
    <>
      <div className='block'>
        <div
          className={classNames(
            'inline-block rounded-lg px-2 py-1.5 hover:cursor-pointer z-40 border border-transparent hover:border-gray-400',
            className
          )}
          style={{ backgroundColor: '#ECEFF5' }}
        >
          <div
            className='flex items-center text-nowrap'
            data-tooltip-id={`tooltip-${title}`}
          >
            <div className='mr-1'>
              <LogoSVG />
            </div>
            <span className='text-sm pr-1 font-medium'>{title}</span>
          </div>
          <Tooltip
            id={`tooltip-${title}`}
            content={<Content markdownString={children} />}
            events={['click']}
            className='z-50 w-96 bg-white text-sm font-normal px-4 py-3 rounded-lg !opacity-100'
            disableStyleInjection
            style={{
              boxShadow: `0px 3px 10px 0px rgba(0, 0, 0, 0.2)`
            }}
            place='bottom-start'
          />
        </div>
      </div>
    </>
  )
}

MapboxTooltip.propTypes = {
  children: PropTypes.any,
  className: PropTypes.any,
  title: PropTypes.any
}

export default MapboxTooltip
