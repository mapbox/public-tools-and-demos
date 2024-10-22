import PropTypes from 'prop-types'
import TableRow from "./TableRow"

const Android = ({
    displayCenterArray,  
    displayZoom, 
    displayBearing, 
    displayPitch, 
    displayBoundsArray, 
    displayBbox,
    zxy }) => {
    return (

        <div className='overflow-x-auto relative'>
          <TableRow label='center' value={displayCenterArray} />
          <TableRow label='zoom' value={displayZoom} />
          <TableRow label='bearing' value={displayBearing} />
          <TableRow label='pitch' value={displayPitch} />
          <TableRow
            label='viewport bounds'
            value={displayBoundsArray}
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

export default Android

Android.propTypes = {
    displayCenterArray: PropTypes.array,
    displayCenterObject: PropTypes.object,
    displayZoom: PropTypes.number,
    displayBearing: PropTypes.number,
    displayPitch: PropTypes.number,
    displayBoundsArray: PropTypes.array, 
    displayBbox: PropTypes.array,
    zxy: PropTypes.any
}