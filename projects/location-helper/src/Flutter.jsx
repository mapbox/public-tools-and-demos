import React from 'react'
import PropTypes from 'prop-types'

import { format } from './utils'
import BasePlatform from './BasePlatform'

const Flutter = (props) => {
  function processCenter(centerArray) {
    return `Point(
  coordinates: Position(
    ${format(centerArray.lat, 5)}, 
    ${format(centerArray.lng, 5)}
))`
  }

  function formatBoundsArray(bounds) {
    return `CoordinateBounds(
  southwest: Point(
    coordinates: Position(
      ${format(bounds._sw.lat, 5)}, ${format(bounds._sw.lng, 5)}
  )),
  northeast: Point(
    coordinates: Position(
      ${format(bounds._ne.lat, 5)},  ${format(bounds._ne.lng, 5)}
  )),
  infiniteBounds: false
)`
  }

  function formatBoundingBox(bbox) {
    return `CoordinateBounds(
    southwest: Point(
      coordinates: Position(
        ${format(bbox[1], 5)}, ${format(bbox[0], 5)}
    )),
    northeast: Point(
      coordinates: Position(
        ${format(bbox[3], 5)},  ${format(bbox[2], 5)}
    )),
    infiniteBounds: false
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

export default Flutter
