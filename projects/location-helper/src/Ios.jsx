import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import TableRow from "./TableRow"
import { format } from './utils'

const Ios = ({
    center,
    displayZoom, 
    displayBearing, 
    displayPitch, 
    bounds, 
    bbox,
    zxy }) => {
     
    console.log("center", center)
    const [displayBbox, setDisplayBbox ] = useState('use the polygon button to draw a bounding box')

    useEffect(()=> {
        if(bbox) {
            const bounding = formatBoundingBox(bbox);
            setDisplayBbox(bounding)
        }
    }, [bbox])
    
    function processCenter(centerArray) {
        const iosCenter = `CLLocationCoordinate2D(latitude: ${format(centerArray.lat, 5)}, longitude: ${format(centerArray.lng, 5)})`
        return iosCenter
    }

    function formatBoundsArray(bounds) {
        return `CoordinateBounds(
                    southwest: CLLocationCoordinate2D(latitude:  ${format(bounds._sw.lat, 5)}, longitude: ${format(bounds._sw.lng, 5)}),
                    northeast: CLLocationCoordinate2D(latitude: ${format(bounds._ne.lat, 5)}, longitude: ${format(bounds._ne.lng, 5)})
                )`
    }

    function formatBoundingBox(bbox) {
        return `CoordinateBounds(
                    southwest: CLLocationCoordinate2D(latitude:  ${format(bbox[1], 5)}, longitude: ${format(bbox[0], 5)}),
                    northeast: CLLocationCoordinate2D(latitude: ${format(bbox[3], 5)}, longitude: ${format(bbox[2], 5)})
                )`
    }
     
    return (

        <div className='overflow-x-auto relative'>
          <TableRow label='center' value={processCenter(center)} />
          <TableRow label='zoom' value={displayZoom} />
          <TableRow label='bearing' value={displayBearing} />
          <TableRow label='pitch' value={displayPitch} />
          <TableRow
            label='viewport bounds'
            value={formatBoundsArray(bounds)}
            noBorder
          />
          <TableRow
            label='user-drawn bounding box'
            value={displayBbox}
            noBorder
          />
          <TableRow label='z/x/y tile' value={zxy} noBorder />
        </div>
    )
}

export default Ios

Ios.propTypes = {
    displayCenterArray: PropTypes.array,
    displayCenterObject: PropTypes.object,
    displayZoom: PropTypes.number,
    displayBearing: PropTypes.number,
    displayPitch: PropTypes.number,
    displayBoundsArray: PropTypes.array, 
    displayBbox: PropTypes.array,
    zxy: PropTypes.any
}