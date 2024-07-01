import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import ExternalLink from './external-link'

const Header = ({ title, githubLink }) => {
  return (
    <div
      className='unselectable flex-child-no-shrink relative color-white'
      style={{ height: 42 }}
    >
      <div className='bg-gray-dark px12 w-full h-full'>
        <div className='flex flex--space-between-main h-full'>
          <div>
            <div className='flex flex--center-cross h-full'>
              <div
                className='bg-no-repeat bg-center ml-2'
                style={{
                  height: 24,
                  width: 24,
                  backgroundSize: '24px 24px',
                  backgroundImage:
                    'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTc5IiBoZWlnaHQ9IjE3OSIgdmlld0JveD0iMCAwIDE3OSAxNzkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik04OS4xIDAuODAwMDAzQzM5LjkgMC44MDAwMDMgMCA0MC43IDAgODkuOUMwIDEzOS4xIDM5LjkgMTc5IDg5LjEgMTc5QzEzOC4zIDE3OSAxNzguMiAxMzkuMSAxNzguMiA4OS45QzE3OC4yIDQwLjcgMTM4LjMgMC44MDAwMDMgODkuMSAwLjgwMDAwM1pNOTguMyAzNS40QzEwOS43IDM1LjcgMTIxLjIgNDAuMiAxMzAgNDkuMUMxNDcuNyA2Ni44IDE0OC4zIDk0LjggMTMxLjQgMTExLjhDMTAwLjkgMTQyLjMgNDYuNiAxMzIuNSA0Ni42IDEzMi41QzQ2LjYgMTMyLjUgMzYuOCA3OC4yIDY3LjMgNDcuN0M3NS44IDM5LjMgODcgMzUuMiA5OC4zIDM1LjRaTTk5LjMgNTNMOTAuNiA3MUw3Mi43IDc5LjdMOTAuNiA4OC40TDk5LjMgMTA2LjRMMTA4LjEgODguNEwxMjYgNzkuN0wxMDguMSA3MUw5OS4zIDUzWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==)'
                }}
              />
              <div className='txt-bold ml12'>{title}</div>
            </div>
          </div>
          <div className='relative flex flex--center-cross'>
            <div className='flex flex--center-cross'>
              {githubLink && (
                <div className='flex-child-no-shrink'>
                  <div className='flex'>
                    <div className='px12'>
                      <ExternalLink to={githubLink}>
                        <button className='block color-white flex cursor-pointer color-gray-lighter-on-hover'>
                          <FontAwesomeIcon icon={faGithub} size='lg' />
                        </button>
                      </ExternalLink>
                    </div>
                  </div>
                </div>
              )}
              <div className='border-l pl12 border--lighten10 flex-child-no-shrink none flex-mm flex--center-cross'>
                <div style={{ lineHeight: 0 }}>
                  <ExternalLink to='https://account.mapbox.com/auth/signup/'>
                    <button type='button' className='btn txt-s py3 round px12'>
                      Sign up for Mapbox
                    </button>
                  </ExternalLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Header.propTypes = {
  githubLink: PropTypes.string,
  title: PropTypes.string
}

export default Header
