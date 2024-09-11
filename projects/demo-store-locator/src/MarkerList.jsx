import PropTypes from 'prop-types'
import { useEffect, useRef, useState, useContext } from 'react'
import mapboxgl from 'mapbox-gl'
import { LocationData } from './Card'
import { LocationContext } from './Context/LocationContext'

const MarkerList = ({features, mapRef, searchResult, activeFeature, setActiveFeature}) => {
    const renderedMarkersList = useRef([]);
    const renderedFeaturesList = useRef([]);
    const prevSearchResultRef = useRef();
    const popupEl = useRef();
    const activeMarkerRef = useRef();
    const hoveredMarkerRef = useRef();
    const [ activeMarker, setActiveMarker ] = useState();
    const { hoveredFeature } = useContext(LocationContext);


    // Function to clear all markers
    function clearMarkers() {
        for (var i = renderedMarkersList.current.length - 1; i >= 0; i--) {
            renderedMarkersList.current[i].remove();
        }
        renderedMarkersList.current = [];
        renderedFeaturesList.current = [];
    }

    // For debugging
    // function handlePopupOpen() {
    //     console.log("opens")
    //   }
    
    //   function handlePopupClose() {
    //     console.log("closes")
    //   }

    useEffect(() => {
        
        if (!hoveredFeature) {
            if (hoveredMarkerRef.current) {
                hoveredMarkerRef.current.removeClassName('hovered');
                hoveredMarkerRef.current = null; // Reset the reference
            }
            return; // Prevent further code from executing when no feature is hovered
        }

        const index = renderedFeaturesList.current.findIndex(
            (feature) => hoveredFeature.properties.address === feature.properties.address);
        
        console.log("you are hovering", renderedMarkersList.current[index]);
        
        renderedMarkersList.current[index].addClassName('hovered')
        hoveredMarkerRef.current = renderedMarkersList.current[index];

    }, [hoveredFeature])

    useEffect(() => {
        features.forEach((feature) => {

            // Check to see if marker has already been added for this feature
            if (!renderedFeaturesList.current.some(f => f.properties.address === feature.properties.address)) {
                
                // Need to 'reactify' this
                const el = document.createElement('div');
                el.className = 'marker';

                 // Attach the click event listener
                el.addEventListener('click', () => {
                    setActiveFeature(feature);  // Update the state with the clicked feature
                });

                // el.addEventListener('mouseOver', () => {
                //     setHoveredFeature(feature);
                // } )

                const marker = new mapboxgl.Marker(el)
                .setLngLat(feature.geometry.coordinates)
                .addTo(mapRef)
                
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

    // Add popup to active Feature
    useEffect(() => {

        if(!activeFeature) {
            return;
        }
        
        // Remove popUp from previous active Marker
        if(activeMarkerRef.current) {
            activeMarkerRef.current.setPopup(null);
        }

        // Find Active Feature/Marker to instantiate Popup
        const matchingIndex = renderedFeaturesList.current.findIndex(
            (feature) => feature.properties.address === activeFeature.properties.address
        );

        if (matchingIndex !== -1) {
             
            let popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: true,
                closeOnMove: true,
                maxWidth: '300px',
                offset: 30
            })
            .setDOMContent(popupEl.current)
            // .on('open', handlePopupOpen)
            // .on('close', handlePopupClose)
            
            // if popup is undefined, this will remove the popup from the marker
            renderedMarkersList.current[matchingIndex].setPopup(popup);

            setActiveMarker(renderedMarkersList.current[matchingIndex]);

            activeMarkerRef.current = renderedMarkersList.current[matchingIndex];

        } else {
            console.log('Cant find the active Feature in renderedFeatures');
        }

    },[activeFeature])

    useEffect(() => {
        if (activeMarker) {
            // once the map has moved
            mapRef.on('moveend', () => {
              activeMarker.togglePopup();       
          });
        }
    })

    return (
        <>
          { /* Return a Popup only for the activeFeature */
          activeFeature && 
            <div ref={popupEl} className={`bg-white rounded-md cursor-pointer p-4`}>
                    <LocationData feature={activeFeature}/>
            </div>
          }
        </> 
    )
}

export default MarkerList;

MarkerList.propTypes = {
    features: PropTypes.array,
    mapRef: PropTypes.any,
    searchResult: PropTypes.object
}