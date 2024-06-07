import PropTypes from 'prop-types'
const ExternalLink = ({ to, children }) => {
  return (
    <a className='link' href={to} target='_blank' rel='noopener noreferrer'>
      {children}
    </a>
  )
}

ExternalLink.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string
}

export default ExternalLink
