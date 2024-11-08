import React from 'react'
import BasePlatform from './BasePlatform'
import { format } from './utils'

const Web = (props) => {
  function formatCenterArray(center) {
    return `[${format(center.lng, 5)}, ${format(center.lat, 5)}]`
  }

  function formatCenterObject(center) {
    return `{lng: ${format(center.lng, 5)}, lat: ${format(center.lat, 5)}}`
  }

  function formatBoundsArray(bounds) {
    return `[
    [${format(bounds._sw.lng, 5)}, ${format(bounds._sw.lat, 5)}], 
    [${format(bounds._ne.lng, 5)}, ${format(bounds._ne.lat, 5)}]
]`
  }

  function formatBoundingBox(bbox) {
    return `[
    [${format(bbox[0], 5)}, ${format(bbox[1], 5)}],
    [${format(bbox[2], 5)}, ${format(bbox[3], 5)}]
]`
  }

  return (
    <BasePlatform
      {...props}
      formatCenter={formatCenterArray}
      formatCenterObject={formatCenterObject}
      formatBounds={formatBoundsArray}
      formatBbox={formatBoundingBox}
    />
  )
}

export default Web
