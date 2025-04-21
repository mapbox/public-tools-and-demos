import { useEffect } from 'react'

const PageShell = ({ children }) => {
  useEffect(() => {
    // @mapbox/web-analytics is inline in the HTML index.html for each project
    // set mapbox metadata before initializing analytics
    window.mbxMetadata = {
      content_type: 'developer-tool'
    }

    // eslint-disable-next-line no-undef
    initializeMapboxAnalytics({
      marketoMunchkin: false
    })
  }, [])
  return children
}

export default PageShell
