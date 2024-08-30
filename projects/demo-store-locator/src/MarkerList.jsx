import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

const MarkerList = ({features, map, searchResult}) => {
    const renderedMarkersList = useRef([]);
    const renderedFeaturesList = useRef([]);
    const prevSearchResultRef = useRef();

    // Function to clear all markers
    function clearMarkers() {
        for (var i = renderedMarkersList.length - 1; i >= 0; i--) {
            renderedMarkersList.current[i].remove();
        }
        renderedMarkersList.current = [];
    }

    useEffect(() => {
        features.forEach((feature) => {
            
            // Check to see if marker has already been added for this feature
            if(!renderedFeaturesList.current.includes(feature)) {
                
                // Need to 'reactify' this
                const el = document.createElement('div');
                el.className = 'marker';

                const marker = new mapboxgl.Marker(el)
                .setLngLat(feature.geometry.coordinates)
                .addTo(map)

                console.log("Marker added for", feature.properties.name);
                
                // Add marker objects to list for removal later
                renderedMarkersList.current.push(marker);
                // Add feature objects to list for checking to avoid duplicates
                renderedFeaturesList.current.push(feature);
            }
           
        })
        
    }, [features])

    // Remove markers on new SearchBox Query
    useEffect(() => {
        const prevSearchResult = prevSearchResultRef.current;
        console.log("searchResult Changes");
        if (prevSearchResult && prevSearchResult !== searchResult) { 
            console.log("markers cleared");
            // Call the function to clear all markers
            clearMarkers();
        }
        // Update the ref with the current searchResult after the effect
        prevSearchResultRef.current = searchResult;
    }, [searchResult])



    // features.map((d, i) => (
    //     <Marker 
    //       activeFeature={activeFeature}
    //       setActiveFeature={onFeatureClick}
    //       key={i} 
    //       feature={d}
    //       map={mapRef.current}
    //       searchResult={searchResult}>
    //       <LocationData feature={d} />
    //     </Marker>
    //   ))}
}

export default MarkerList;