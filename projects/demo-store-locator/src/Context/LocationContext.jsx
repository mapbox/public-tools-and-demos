import React, { createContext, useState } from 'react';

// Create context to store the Maps active location across the app. This is dependent
// on whether userLocation is allowed through navigator.geolocation & usage of the Searchbox
export const LocationContext = createContext();

// Create a provider component
export const LocationProvider = ({ children }) => {
  const [activeLocation, setActiveLocation] = useState(null);

  return (
    <LocationContext.Provider value={{ activeLocation, setActiveLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
