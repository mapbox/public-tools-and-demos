import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { LocationData } from './Card'
import Marker from './Marker'

const MarkerList = ({features, mapRef, searchResult, activeFeature}) => {
    const renderedMarkersList = useRef([]);
    const renderedFeaturesList = useRef([]);
    const prevSearchResultRef = useRef();

    console.log("features into MarkerList", features);
    
    // Function to clear all markers
    function clearMarkers() {
        for (var i = renderedMarkersList.current.length - 1; i >= 0; i--) {
            renderedMarkersList.current[i].remove();
        }
        renderedMarkersList.current = [];
        renderedFeaturesList.current = [];
    }

    // Remove markers on new SearchBox Query
    useEffect(() => {
        const prevSearchResult = prevSearchResultRef.current;
        if (searchResult && prevSearchResult !== searchResult) { 
            // Call the function to clear all markers
            console.log("markers cleared");
            clearMarkers();
        }
        // Update the ref with the current searchResult after the effect
        prevSearchResultRef.current = searchResult;
    }, [searchResult])

    return (
        <>
        { features &&
        features.map((feature) => (
            <Marker
                feature={feature}
                renderedFeatures={renderedFeaturesList}
                renderedMarkers={renderedMarkersList}
                mapRef={mapRef}
                activeFeature={activeFeature}>
            </Marker>
         ))} 
        </> 
    )
}

export default MarkerList;

MarkerList.propTypes = {
    features: PropTypes.array,
    mapRef: PropTypes.any,
    searchResult: PropTypes.object
}