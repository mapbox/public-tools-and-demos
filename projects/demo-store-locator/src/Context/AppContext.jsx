import React, { createContext, useState, useEffect, useMemo } from 'react';

// Create context to store the Maps active location across the app. This is dependent
// on whether userLocation is allowed through navigator.geolocation & usage of the Searchbox
export const AppContext = createContext();

// Create a provider component
export const AppContextProvider = ({ children }) => {

  // stores the feature that the user is currently viewing (triggers the popup)
  const [activeFeature, setActiveFeature] = useState()
  // activeLocation rendered on the map
  const [ activeLocation, setActiveLocation ] = useState(null);
  // the data to be displayed on the map (this is static, but could be updated dynamically as the map view changes)
  const [ features, setFeatures ] = useState([])
  // Allow/Deny location sharing for app
  const [ denyLocation, setDenyLocation ] = useState(null);
  // hoveredFeature set by hovering store listing in LocationsListing
  const [ hoveredFeature, setHoveredFeature ] = useState(null);
  // Loading state to manage loading spinner
  const [ loadingUserLocation, setLoadingUserLocation ] = useState(false);
  // the current search value, used in the controlled mapbox-search-js input
  const [searchValue, setSearchValue] = useState('')
  // the selected search result, chosen from suggestions
  const [searchResult, setSearchResult] = useState(null)
  // set state based on screen size for responsive component rendering
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
  }), [activeFeature, activeLocation, features, denyLocation, hoveredFeature, loadingUserLocation, searchResult, searchValue, isMobile,]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
