import PropTypes from 'prop-types'
import { useEffect, useRef, useContext } from 'react'
import mapboxgl from 'mapbox-gl'
import { LocationData } from './Card'
import { AppContext } from './Context/AppContext'

const Markers = ({ mapRef }) => {
    const prevSearchResultRef = useRef();
    const popupEl = useRef();
    const markerElRef = useRef();
    const activeMarkerRef = useRef();
    const hoveredMarker = useRef();
    const { hoveredFeature, isMobile, searchResult, activeFeature } = useContext(AppContext);

    // This creates a 'hover' marker on the map when the corresponding
    // feature is hovered in LocationListing.jsx
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
            console.log("activeMarkerRef", activeMarkerRef);
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

        // Remove green dot when marker takes it's place
        // This is not working.
        mapRef.setFilter('store-locations', ['!=', 'id', activeFeature.id]);
        

        // Generate pop up only on Mobile
        if (isMobile) {
            let popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: true,
                closeOnMove: true,
                maxWidth: '300px',
                offset: 57
            })
            .setDOMContent(popupEl.current)
            
            // if popup is undefined, this will remove the popup from the marker
           activeMarkerRef.current.setPopup(popup);
           activeMarkerRef.current.togglePopup();
        }

        return () => {
             // Cleanup popup and marker
             if (activeMarkerRef.current) {
                activeMarkerRef.current.setPopup(null);
                activeMarkerRef.current.remove();
            }
        };

    },[activeFeature, isMobile])


    return (
        <>
            { activeFeature &&
                <div ref={popupEl} className={`${isMobile ? '' : 'hidden'} bg-white rounded-md cursor-pointer p-4`}>
                    <LocationData feature={activeFeature}/> 
                </div> 
            }
        </>
    )
}

export default Markers;

Markers.propTypes = {
    mapRef: PropTypes.any
}