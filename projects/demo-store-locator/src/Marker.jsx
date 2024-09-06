import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'
import { LocationData } from './Card'

const Marker = ({feature, renderedFeatures, renderedMarkers, activeFeature, mapRef}) => {
    const markerEl = useRef();
    const popupEl = useRef();
    const markerRef = useRef();
    const activeMarkerRef = useRef();
    const [ activeMarker, setActiveMarker ] = useState();

    function handlePopupOpen(marker) {
        console.log(marker, " opens");
    }

    function handlePopupClose(marker) {
        console.log(marker, " closes");
    }

    // Check to see if marker has already been added to Gl JS for this feature
    // before adding it to the map and storing it in Ref.
    useEffect(() => {

        if (!renderedFeatures.current.some(f => f.properties.address === feature.properties.address)) {
            
            const marker = new mapboxgl.Marker({
                element: markerEl.current
            })
            .setLngLat(feature.geometry.coordinates)
            .addTo(mapRef)

            console.log("Adding marker for ", feature.properties.name, " to the map.")

            markerRef.current = marker;
            // Add marker objects to list for removal later
            renderedMarkers.current.push(marker);
            // Add feature objects to list for checking to avoid duplicates
            renderedFeatures.current.push(feature);
        }   
    })

    // Add popup to active Feature
    useEffect(() => {

        if(!activeFeature) {
            return;
        }
        
        // Remove popUp from if Marker is not active
        if(activeFeature !== feature) {
            console.log("this marker popup should be removed", feature.properties.name);
            markerRef.current.setPopup(null);

            console.log("marker is", markerRef.current.getPopup()); 
        } else {
            // Add popup for active marker
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
            
            markerRef.current.setPopup(popup);

            activeMarkerRef.current = 
            
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
        <div ref={markerEl} className="marker">
              { /* Return a Popup only for the activeFeature */ }
                <div ref={popupEl} className={`${activeFeature == feature ? '' : 'hidden' }bg-white rounded-md cursor-pointer p-4`}>
                    { activeFeature == feature && 
                        <LocationData feature={activeFeature}/>
                    }
                </div>
        
        </div>
    )
}

export default Marker;