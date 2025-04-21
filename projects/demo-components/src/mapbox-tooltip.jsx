// Mapbox Tooltip - for adding hints about Mapbox features
import PropTypes from 'prop-types'
import { Tooltip } from 'react-tooltip'
import Markdown from 'react-markdown'
import classNames from 'classnames'
import LogoSVG from './logo-svg'

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
              className={`text-accentColor font-bold hover:opacity-50`}
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

const MapboxTooltip = ({ className, title, content, linkColor }) => {
  return (
    <>
      <div className='block'>
        <div
          className={classNames(
            'inline-block rounded px-2 py-1.5 hover:cursor-pointer z-40 border border-transparent hover:border-gray-400 m-1 sm:mr-2',
            className
          )}
          style={{ backgroundColor: '#ECEFF5' }}
        >
          <div
            className='flex items-center text-nowrap'
            data-tooltip-id={`tooltip-${title}`}
          >
            <div className='mr-1'>
              <LogoSVG fillColor='black' />
            </div>
            <span className='text-sm pr-1 font-medium'>{title}</span>
          </div>
          <Tooltip
            id={`tooltip-${title}`}
            content={<Content linkColor={linkColor} markdownString={content} />}
            openOnClick
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
  content: PropTypes.string,
  className: PropTypes.any,
  title: PropTypes.string,
  linkColor: PropTypes.string
}

export default MapboxTooltip
