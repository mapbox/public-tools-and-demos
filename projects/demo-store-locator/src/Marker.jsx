import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const Marker = ({ feature, renderedFeatures, renderedMarkers, mapRef, setActiveFeature }) => {
    const markerRef = useRef(null);

    useEffect(() => {
        // Check to see if the marker has already been added
        if (!renderedFeatures.current.some(f => f.properties.address === feature.properties.address)) {
            // Create a new div element for the marker
            const el = document.createElement('div');
            el.className = 'marker';

            // Attach the click event listener
            el.addEventListener('click', () => {
                setActiveFeature(feature);  // Update the state with the clicked feature
            });

            const marker = new mapboxgl.Marker({
                element: el
            })
                .setLngLat(feature.geometry.coordinates)
                .addTo(mapRef);

            // Store the marker for future reference and cleanup
            renderedMarkers.current.push(marker);
            renderedFeatures.current.push(feature);

            markerRef.current = marker;
        }

        // Cleanup the marker and event listener when the component unmounts
        return () => {
            if (markerRef.current) {
                markerRef.current.getElement().removeEventListener('click', () => {
                    setActiveFeature(feature);
                });
                markerRef.current.remove();
            }
        };
    }, [feature, renderedFeatures, renderedMarkers, mapRef, setActiveFeature]);

    return null; // No need to return JSX
};

export default Marker;
