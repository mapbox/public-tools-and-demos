// BaseComponent.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TableRow from './TableRow';

const BasePlatform = ({
    center,
    displayZoom,
    displayBearing,
    displayPitch,
    bounds,
    bbox,
    zxy,
    formatCenter,
    formatCenterObject,
    formatBounds,
    formatBbox
}) => {
    const [displayBbox, setDisplayBbox] = useState('Use the polygon button to draw a bounding box');

    useEffect(() => {
        if (bbox) {
            const bounding = formatBbox(bbox);
            setDisplayBbox(bounding);
        }
    }, [bbox, formatBbox]);
    
    const isWeb = formatCenterObject ? true : false;

    return (
        <div className='overflow-x-auto relative'>
            <TableRow label={isWeb ? 'center(array)' : 'center'} value={formatCenter(center)} /> 
            {
                isWeb &&
                <TableRow label='center (object)' value={formatCenterObject(center)} />
            }
            <TableRow label='zoom' value={displayZoom} />
            <TableRow label='bearing' value={displayBearing} />
            <TableRow label='pitch' value={displayPitch} />
            <TableRow label='viewport bounds' value={formatBounds(bounds)} noBorder />
            <TableRow label='user-drawn bounding box' value={displayBbox} noBorder />
            <TableRow label='z/x/y tile' value={zxy} noBorder />
        </div>
    );
};

BasePlatform.propTypes = {
    center: PropTypes.object,
    displayZoom: PropTypes.string,
    displayBearing: PropTypes.string,
    displayPitch: PropTypes.string,
    bounds: PropTypes.object,
    bbox: PropTypes.array,
    zxy: PropTypes.any,
    formatCenter: PropTypes.func.isRequired,
    formatCenterObject: PropTypes.func,
    formatBounds: PropTypes.func.isRequired,
    formatBbox: PropTypes.func.isRequired
};

export default BasePlatform;
