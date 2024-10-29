import React from 'react'
import BasePlatform from './BasePlatform'
import { format } from './utils'

const Ios = (props) => {
    
    function processCenter(centerArray) {
        return (
`CLLocationCoordinate2D(
  latitude: ${format(centerArray.lat, 5)}, 
  longitude: ${format(centerArray.lng, 5)}
)`)
    }

    function formatBoundsArray(bounds) {
        return (
`CoordinateBounds(
  southwest: CLLocationCoordinate2D(
    latitude:  ${format(bounds._sw.lat, 5)}, 
    longitude: ${format(bounds._sw.lng, 5)}
  ),
  northeast: CLLocationCoordinate2D(
    latitude: ${format(bounds._ne.lat, 5)}, 
    longitude: ${format(bounds._ne.lng, 5)}
  )
)`)
    }

    function formatBoundingBox(bbox) {
        return (
`CoordinateBounds(
  southwest: CLLocationCoordinate2D(
    latitude:  ${format(bbox[1], 5)}, 
    longitude: ${format(bbox[0], 5)}
  ),
  northeast: CLLocationCoordinate2D(
    latitude: ${format(bbox[3], 5)}, 
    longitude: ${format(bbox[2], 5)}
  )
)`)
    }
     
    return <BasePlatform { ...props} formatCenter={processCenter} formatBounds={formatBoundsArray} formatBbox={formatBoundingBox}/>
}

export default Ios
