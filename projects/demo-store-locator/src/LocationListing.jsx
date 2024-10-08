import React, { useRef, useEffect } from 'react';
import Card from './Card';

const LocationListing = ({currentViewData, handleFeatureClick, activeFeature}) => {
    const locationRefs = useRef([]);

    // Reset locationRefs when the locations array changes
    useEffect(() => {
      locationRefs.current = []; // Clear the refs array when new locations are populated
    }, [currentViewData]);

    // Scroll to the active location when it changes
    useEffect(() => {
        if (activeFeature && locationRefs.current[activeFeature.properties.id]) {
        locationRefs.current[activeFeature.properties.id].scrollIntoView({
            behavior: 'smooth', // Optionally smooth scrolling
            block: 'start',   // Align the element to the top of the container
        });
        }
    }, [activeFeature]);

    return (
        <div className='overflow-y-auto flex-grow flex flex-col justify-start grid grid-cols-1 gap-4 z-0'>
              {currentViewData.length > 0 && currentViewData.map((feature, i) => {
                return (
                  <div 
                    key={i} 
                    ref={(el) => (locationRefs.current[feature.properties.id] = el)}
                    className='mb-1.5'>
                    <Card feature={feature} onClick={handleFeatureClick} activeFeature={activeFeature}/>
                  </div>
                )
              })}

              {currentViewData.length == 0 &&
              <div className="my-4 mx-5">
                <h3 className="font-bold text-2xl border-b-4 border-deepgreen mb-2">Zoomed out too far</h3>
                <p className="text-slate-400">Please search or zoom in to retrieve listing for this area.</p>
              </div>
            }
        </div>
    )

}

export default LocationListing;