// Given a point coordinate, renders a static map image with a marker from the Mapbox Static Images API
import PropTypes from 'prop-types'
import { useEffect, useState, useRef } from 'react'

import { accessToken } from './Map'

const StaticMapImage = ({ lng, lat }) => {
  const [width, setWidth] = useState(0)
  const [height] = useState(160)

  const ref = useRef(null)

  useEffect(() => {
    setWidth(ref.current.clientWidth)
  }, [])

  const staticImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ea580b(${lng},${lat})/${lng},${lat},15,0,0/${width}x${height}@2x?access_token=${accessToken}`

  return (
    <div
      ref={ref}
      className='bg-cover rounded-lg h-40 lg:h-40'
      style={{
        backgroundImage: width && `url("${staticImageUrl}")`
      }}
    />
  )
}

StaticMapImage.propTypes = {
  lat: PropTypes.any,
  lng: PropTypes.any
}

export default StaticMapImage
