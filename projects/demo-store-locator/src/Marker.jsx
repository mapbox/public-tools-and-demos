// The Markers component contains logic and GL JS functions to render and remove an 
// 'activeMarker' and a 'hoveredMarker' to the GL JS Map. It also renders a pop-up 
// (on mobile only) to display store info - the locations listing in the sidebar is 
// hidden on small screens.
'use client'

import PropTypes from 'prop-types'
import { useEffect, useRef, useContext } from 'react'
import mapboxgl from 'mapbox-gl'
import { LocationData } from './Card'
import { createRoot } from 'react-dom/client';
import { AppContext } from './Context/AppContext'
import { AppContextProvider } from './Context/AppContext';

const Marker = ({ mapRef }) => {
    const prevSearchResultRef = useRef();
    const popupRef = useRef();
    const activeMarkerRef = useRef();
    const hoveredMarker = useRef();
    const { hoveredFeature, isMobile, searchResult, activeFeature } = useContext(AppContext);

    // This creates a 'hover' marker on the map when the corresponding
    // feature is hovered in CardList
    useEffect(() => {
        // Remove previous marker if it exists
        if (hoveredMarker.current) {
          hoveredMarker.current.remove();
        }
      
        if (!hoveredFeature) return;
      
        // Create marker for the hover state
        const el = document.createElement('div');
        el.className = 'hover-marker';
      
        // Add marker to the map 
        hoveredMarker.current = new mapboxgl.Marker(el)
          .setLngLat(hoveredFeature.geometry.coordinates)
          .addTo(mapRef);
      
      }, [hoveredFeature]);
      

    // Remove marker on new SearchBox Query
    useEffect(() => {
        const prevSearchResult = prevSearchResultRef.current;
        if (searchResult && prevSearchResult !== searchResult) { 
            if(activeMarkerRef.current) {
                activeMarkerRef.current.remove();
            }
        }
        // Update the ref with the current searchResult after the effect
        prevSearchResultRef.current = searchResult;
    }, [searchResult])

    // Adds Marker & Popup (if mobile) to active Feature
    useEffect(() => {

        if(!activeFeature) {
            return;
        }

        // Create the marker element
        const markerEl = document.createElement('div');
        const markerInner = document.createElement('div');
        markerInner.className = 'marker marker-pop';
        markerEl.appendChild(markerInner);

        // Add marker to the map 
        const marker  = new mapboxgl.Marker(markerEl, {
            offset: [0,-33]
        }).setLngLat(activeFeature.geometry.coordinates)
          .addTo(mapRef)  
          
        activeMarkerRef.current = marker;

        // Generate pop up only on Mobile
        if (isMobile) {

            // Create a container for the popup content
            const popupContentEl = document.createElement('div');
            popupContentEl.className = `${isMobile ? '' : 'hidden'} bg-white rounded-md cursor-pointer p-4`;

            // Render the React content inside the container
            const root = createRoot(popupContentEl);
            root.render(
                <AppContextProvider>
                    <LocationData feature={activeFeature} />
                </AppContextProvider>
            );
            
            let popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: true,
                closeOnMove: true,
                maxWidth: '300px',
                offset: 57
            })
            .setDOMContent(popupContentEl)

            popupRef.current = popup;
            
            // if popup is undefined, this will remove the popup from the marker
           activeMarkerRef.current.setPopup(popup);
           activeMarkerRef.current.togglePopup();
        }

        return () => {
             // Cleanup popup and marker
             if (activeMarkerRef.current) {
                if(isMobile) {
                    popupRef.current.remove();
                }
                activeMarkerRef.current.remove();
            }
        };

    },[activeFeature, isMobile])


    return (
        <>  
        {/* The Markers returns GL JS DOM elements (not React elements) */}
        </>
    )
}

export default Marker;

Marker.propTypes = {
    mapRef: PropTypes.any
}