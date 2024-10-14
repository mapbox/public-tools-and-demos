import React, { createContext, useState, useEffect, useMemo } from 'react';

// Create App level context
export const AppContext = createContext();

// Create a provider component
export const AppContextProvider = ({ children }) => {

  // Stores the feature that the user is currently viewing (triggers the marker/popup)
  const [activeFeature, setActiveFeature] = useState()
  // activeLocation rendered on the map
  const [ activeLocation, setActiveLocation ] = useState(null);
  // The data returned from the visible viewport of the map. Rendered in LocationListing
  const [ features, setFeatures ] = useState([])
  // Allow/Deny location sharing for app
  const [ denyLocation, setDenyLocation ] = useState(null);
  // hoveredFeature set by hovering store listing in LocationsListing
  const [ hoveredFeature, setHoveredFeature ] = useState(null);
  // Loading state to manage loading spinner
  const [ loadingUserLocation, setLoadingUserLocation ] = useState(false);
  // The current search value, used in the controlled SearchBox input
  const [searchValue, setSearchValue] = useState('')
  // The selected search result, chosen from SearchBox suggestions
  const [searchResult, setSearchResult] = useState(null)
  // Set state based on screen size for responsive component rendering
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize events to update isMobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = useMemo(() => ({
    activeFeature,
    setActiveFeature,
    activeLocation,
    setActiveLocation,
    features,
    setFeatures,
    denyLocation,
    setDenyLocation,
    hoveredFeature,
    setHoveredFeature,
    loadingUserLocation,
    setLoadingUserLocation,
    searchResult,
    setSearchResult,
    searchValue,
    setSearchValue,
    isMobile,
    setIsMobile,
  }), [activeFeature, activeLocation, features, denyLocation, hoveredFeature, loadingUserLocation, searchResult, searchValue, isMobile]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
