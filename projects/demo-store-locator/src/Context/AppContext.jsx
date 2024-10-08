import React, { createContext, useState, useEffect, useMemo } from 'react';

// Create context to store the Maps active location across the app. This is dependent
// on whether userLocation is allowed through navigator.geolocation & usage of the Searchbox
export const AppContext = createContext();

// Create a provider component
export const AppContextProvider = ({ children }) => {
  const [ activeLocation, setActiveLocation ] = useState(null);
  const [ hoveredFeature, setHoveredFeature ] = useState(null);
  const [ loadingUserLocation, setLoadingUserLocation ] = useState(false);
  // set state based on screen size for responsive component rendering
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize events to update isMobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = useMemo(() => ({
    activeLocation,
    setActiveLocation,
    hoveredFeature,
    setHoveredFeature,
    loadingUserLocation,
    setLoadingUserLocation,
    isMobile,
    setIsMobile,
  }), [activeLocation, hoveredFeature, loadingUserLocation, isMobile]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
