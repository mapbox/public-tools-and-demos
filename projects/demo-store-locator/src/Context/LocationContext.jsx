import React, { createContext, useState, useMemo } from 'react';

// Create context to store the Maps active location across the app. This is dependent
// on whether userLocation is allowed through navigator.geolocation & usage of the Searchbox
export const LocationContext = createContext();

// Create a provider component
export const LocationProvider = ({ children }) => {
  const [ activeLocation, setActiveLocation ] = useState(null);
  const [ hoveredFeature, setHoveredFeature ] = useState(null);

  const value = useMemo(() => ({
    activeLocation,
    setActiveLocation,
    hoveredFeature,
    setHoveredFeature
  }), [activeLocation, hoveredFeature]);

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
