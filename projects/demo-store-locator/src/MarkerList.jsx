import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import PopUp from './PopUp';
import { render } from 'react-dom';

const MarkerList = ({features, map, searchResult, activeFeature}) => {
    const renderedMarkersList = useRef([]);
    const renderedFeaturesList = useRef([]);
    const prevSearchResultRef = useRef();

    // Function to clear all markers
    function clearMarkers() {
        for (var i = renderedMarkersList.current.length - 1; i >= 0; i--) {
            renderedMarkersList.current[i].remove();
        }
        renderedMarkersList.current = [];
    }

    useEffect(() => {
        features.forEach((feature) => {

            console.log("rendered FeaturesList", renderedFeaturesList.current);
            // console.log(typeof renderedFeaturesList.current);
            console.log("feature", feature);
            //console.log(typeof feature);

            // Check to see if marker has already been added for this feature
            if (!renderedFeaturesList.current.some(f => f.properties.address === feature.properties.address)) {

                console.log("marker hasn't been added for", feature.properties.name);
                
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
        if (searchResult && prevSearchResult !== searchResult) { 
            // Call the function to clear all markers
            console.log("markers cleared");
            clearMarkers();
        }
        // Update the ref with the current searchResult after the effect
        prevSearchResultRef.current = searchResult;
    }, [searchResult])

    // useEffect(() => {
    //     if(activeFeature) {
    //         console.log("active Feature ", activeFeature.properties.name);
    //     }
    // }, [activeFeature])

    // Remove popups of inactive Features
    //  if (feature !== activeFeature) {
    //     markerRef.current.setPopup(null);
    //   }

    // 'react' marker?
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

    return (
        <>
            {renderedFeaturesList.current && 
            renderedFeaturesList.current.map((feature, index) => (
                feature == activeFeature ? 
                    <PopUp 
                        feature={feature} 
                        key={index} 
                        map={map} 
                        markerRef={renderedMarkersList.current[index]}/> 
                    : ''
            ))}
        </> 
    )
}

export default MarkerList;

MarkerList.propTypes = {
    features: PropTypes.array,
    map: PropTypes.any,
    searchResult: PropTypes.string
}