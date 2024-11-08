import React from 'react'
import BasePlatform from './BasePlatform'
import { format } from './utils'

const Android = (props) => {
  function processCenter(centerObj) {
    return `Point.fromLngLat(${format(centerObj.lng, 5)}, ${format(
      centerObj.lat,
      5
    )})`
  }

  function formatBoundsArray(bounds) {
    return `CoordinateBounds(
  Point.fromLngLat(${format(bounds._sw.lng, 5)} ${format(bounds._sw.lat, 5)}),
  Point.fromLngLat(${format(bounds._ne.lng, 5)}, ${format(bounds._ne.lat, 5)}),
  false
)`
  }

  function formatBoundingBox(bbox) {
    return `CoordinateBounds(
  Point.fromLngLat( ${format(bbox[0], 5)} ${format(bbox[1], 5)}),
  Point.fromLngLat(${format(bbox[2], 5)}, ${format(bbox[3], 5)}),
  false
)`
  }

  return (
    <BasePlatform
      {...props}
      formatCenter={processCenter}
      formatBounds={formatBoundsArray}
      formatBbox={formatBoundingBox}
    />
  )
}

export default Android
