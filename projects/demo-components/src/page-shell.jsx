import { useEffect } from 'react'
import '@mapbox/web-analytics'

const PageShell = ({ children }) => {
  useEffect(() => {
    // set mapbox metadata before initializing analytics
    window.mbxMetadata = {
      product: 'Mapbox GL JS', // comma delimited string
      service: 'maps', // comma delimited string
      platform: 'web', // comma delimited string
      content_type: 'public-demos-and-tools' // single value string
    }

    // initialize analytics
    if (window && window.initializeMapboxAnalytics) {
      window.initializeMapboxAnalytics({
        webAnalytics: {
          segmentIntegrations: {
            Drift: false
          }
        }
      })
    }
  }, [])
  return children
}

export default PageShell
