import PropTypes from 'prop-types'
import { useEffect, useRef, useState, useContext } from 'react'
import mapboxgl from 'mapbox-gl'
import { LocationData } from './Card'
import { AppContext } from './Context/AppContext'

const MarkerList = ({features, mapRef, searchResult, activeFeature, setActiveFeature}) => {
    // const renderedMarkersList = useRef([]);
    // const renderedFeaturesList = useRef([]);
    const prevSearchResultRef = useRef();
    const popupEl = useRef();
    const markerElRef = useRef();
    const activeMarkerRef = useRef();
    const [ activeMarker, setActiveMarker ] = useState();
    const { hoveredFeature, setHoveredFeature } = useContext(AppContext);

    // Function to clear all markers
    function clearMarkers() {
            // Remove previous activeMarker
              if(activeMarkerRef.current) {
                activeMarkerRef.current.remove();
            }
    }

    useEffect(() => {
        // Remove any hovered class on all markers
            // renderedMarkersList.current.forEach((marker) => marker.removeClassName('hovered'))
    
            // // When hoveredFeature is set to null or is not set 
            // if (!hoveredFeature) {
            //     return;
            // }
            
            // // Add hovered class to corresponding marker ref (gl js marker in the DOM)     
            // const index = renderedFeaturesList.current.findIndex(
            //     (feature) => hoveredFeature.properties.address === feature.properties.address);
                    
            // renderedMarkersList.current[index].addClassName('hovered')

    }, [hoveredFeature])

    useEffect(() => {
        features.forEach((feature) => {
          // Check to see if marker has already been added for this feature
            // if (!renderedFeaturesList.current.some(f => f.properties.address === feature.properties.address)) {
                
            //     // Need to 'reactify' this
            //     const el = document.createElement('div');
            //     el.className = 'marker';

            //     // Add marker to the map 
            //     const marker = new mapboxgl.Marker(el)
            //     .setLngLat(feature.geometry.coordinates)
            //     .addTo(mapRef)
                
            //     // Add marker objects to refs list for removal later
            //     renderedMarkersList.current.push(marker);
            //     // Add feature objects to refs list for checking later
            //     renderedFeaturesList.current.push(feature);
            // }  
        })
    }, [features])

    // Remove markers on new SearchBox Query
    useEffect(() => {
        const prevSearchResult = prevSearchResultRef.current;
        if (searchResult && prevSearchResult !== searchResult) { 
            // Call the function to clear all markers
            clearMarkers();
        }
        // Update the ref with the current searchResult after the effect
        prevSearchResultRef.current = searchResult;
    }, [searchResult])

    // Add popup to active Feature
    useEffect(() => {

        if(!activeFeature) {
            return;
        }
        
        // Remove previous activeMarker
        if(activeMarkerRef.current) {
            activeMarkerRef.current.remove();
        }

        // Reactify this? ie: no document

        //  Here we add an inner DIV element to the marker in order
        // to use css transform animations
        // const el = document.createElement('div');
        // const innerEl = document.createElement('div');
        // innerEl.className = 'marker marker-pop';
        // el.appendChild(innerEl);

        // Add marker to the map 
        const marker = new mapboxgl.Marker({
            element: markerElRef.current,
            offset: [0,-10]
        }).setLngLat(activeFeature.geometry.coordinates)
          .addTo(mapRef)

        activeMarkerRef.current = marker;
                
        
        // // Remove popUp from previous active Marker
        // if(activeMarkerRef.current) {
        //     activeMarkerRef.current.setPopup(null);
        // }

        // // Find Active Feature/Marker to instantiate Popup
        // const matchingIndex = renderedFeaturesList.current.findIndex(
        //     (feature) => feature.properties.address === activeFeature.properties.address
        // );

        // if (matchingIndex !== -1) {
             
        //     let popup = new mapboxgl.Popup({
        //         closeButton: false,
        //         closeOnClick: true,
        //         closeOnMove: true,
        //         maxWidth: '300px',
        //         offset: 30
        //     })
        //     .setDOMContent(popupEl.current)
            
        //     // if popup is undefined, this will remove the popup from the marker
        //     renderedMarkersList.current[matchingIndex].setPopup(popup);

        //     setActiveMarker(renderedMarkersList.current[matchingIndex]);

        //     activeMarkerRef.current = renderedMarkersList.current[matchingIndex];

        // } else {
        //     console.log('Cant find the active Feature in renderedFeatures');
        // }

    },[activeFeature])

    useEffect(() => {
        if (activeMarker) {
            activeMarker.togglePopup();       
        }
    })

    return (
        <div ref={markerElRef}>
            {/* We create an inner DIV in our marker element so we can apply css animations via transform */}
            <div className="marker marker-pop">
            </div>
        </div>
    )
}

export default MarkerList;

MarkerList.propTypes = {
    features: PropTypes.array,
    mapRef: PropTypes.any,
    searchResult: PropTypes.object,
    activeFeature: PropTypes.object,
    setActiveFeature: PropTypes.any
}

{ /* Return a Popup only for the activeFeature */
    // activeFeature && 
      //<div ref={popupEl} className={`bg-white rounded-md cursor-pointer p-4`}>
              {/*<LocationData feature={activeFeature}/> */}
      //</div> 
    }