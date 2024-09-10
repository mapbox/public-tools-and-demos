import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { LocationData } from './Card'
import Marker from './Marker'

const MarkerList = ({features, mapRef, searchResult, activeFeature}) => {
    const renderedMarkersList = useRef([]);
    const renderedFeaturesList = useRef([]);
    const prevSearchResultRef = useRef();
    const popupEl = useRef();
    const popupRef = useRef();

    function handlePopupOpen(marker) {
        console.log(marker, " opens");
    }

    function handlePopupClose(marker) {
        console.log(marker, " closes");
    }

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

    useEffect(() => {
        if (!activeFeature) {
            return
        }
        // Move popup to activeFeature on Map
        popupRef.current.setLngLat(activeFeature.geometry.coordinates);
        popupRef.current.addTo(mapRef);
 
    },[activeFeature])

    useEffect(() => {
          // Instantiate singular popup to hold data for Active Feature
          let popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true,
            closeOnMove: true,
            maxWidth: '300px',
            offset: 30
        })
        .setDOMContent(popupEl.current)
        .on('open', handlePopupOpen)
        .on('close', handlePopupClose)

        popupRef.current = popup;

        // once the map has moved
        // mapRef.on('moveend', () => {
        //   activeMarker.togglePopup();       
        // });
    })

    return (
        <>
        { features &&
        features.map((feature, index) => (
            <Marker
                key={index}
                feature={feature}
                renderedFeatures={renderedFeaturesList}
                renderedMarkers={renderedMarkersList}
                mapRef={mapRef}>
            </Marker>
         ))} 
            <div ref={popupEl} className={'bg-white rounded-md cursor-pointer p-4'}>
                { activeFeature && 
                    <LocationData feature={activeFeature}/>
                }
            </div>
        </> 
    )
}

export default MarkerList;

MarkerList.propTypes = {
    features: PropTypes.array,
    mapRef: PropTypes.any,
    searchResult: PropTypes.object,
    activeFeature: PropTypes.object
}