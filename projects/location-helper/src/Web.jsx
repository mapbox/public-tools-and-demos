import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import TableRow from "./TableRow"
import { format } from './utils'

const Web = ({
    center, 
    displayZoom, 
    displayBearing, 
    displayPitch, 
    bounds,
    bbox,
    zxy }) => {

    const [displayBbox, setDisplayBbox ] = useState('use the polygon button to draw a bounding box')

    useEffect(()=> {
        if(bbox) {
            const bounding = formatBoundingBox(bbox);
            setDisplayBbox(bounding)
        }
    }, [bbox])

    function formatCenterArray(center) {
        return `[${format(center.lng, 5)}, ${format(center.lat, 5)}]`
    } 

    function formatCenterObject(center) {
        return `{lng: ${format(center.lng, 5)}, lat: ${format(center.lat, 5)}}`
    } 

    function formatBoundsArray(bounds) {
        return (
`[
    [${format(bounds._sw.lng, 5)}, ${format(bounds._sw.lat, 5)}], 
    [${format(bounds._ne.lng, 5)}, ${format(bounds._ne.lat, 5)}]
]`)
    }

    function formatBoundingBox(bbox) {
        return (
`[
    [${format(bbox[0], 5)}, ${format(bbox[1], 5)}],
    [${format(bbox[2],5)}, ${format(bbox[3], 5)}]
]`)
      }

    return (

        <div className='overflow-auto relative'>
          <TableRow label='center (array)' value={formatCenterArray(center)} />
          <TableRow label='center (object)' value={formatCenterObject(center)} />
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

export default Web

Web.propTypes = {
    center: PropTypes.object,
    displayZoom: PropTypes.string,
    displayBearing: PropTypes.string,
    displayPitch: PropTypes.string,
    bounds: PropTypes.object, 
    displayBbox: PropTypes.any,
    zxy: PropTypes.any
}