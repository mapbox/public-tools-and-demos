// The Map component instantiates a Mapbox GL JS map, adds mouse event listeners,
// sets constraints on the max bounds of the map (to the continental US), uses
// queryRenderedFeatures to return GeoJSON features after any movement (at high zoom
// levels) and utilizes useEffects to implement map.flyTo() animations based on state
// changes.  Note that we store our map instance in a Ref so we can use it in the Markers
'use client'

import PropTypes from 'prop-types'
import { useRef, useEffect, useState, useContext } from 'react'
import mapboxgl from 'mapbox-gl'
import Marker from '../Marker'
import { AppContext } from '../Context/AppContext';
import { addUserLocationPulse } from './pulse';
import { accessToken } from 'mapbox-demo-components'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

const Map = ({ onLoad }) => {
  const mapContainer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { 
    setActiveFeature, 
    activeLocation,
    features,
    setFeatures, 
    denyLocation
  } = useContext(AppContext);

  let mapRef = useRef(null);
  const pulseRef = useRef(null);

  // This demo inherits accessToken from  `demo-components/accessToken`, to use this project
  // for your purposes, uncomment the line below and replace YOUR_MAPBOX_ACCESS_TOKEN with
  // the token from you mapbox account (https://account.mapbox.com/) - This token is also
  // used in SearchBoxWrapper
  // mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'

  mapboxgl.accessToken = accessToken;
  
  useEffect(() => {
    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/examples/cm0foo08s01tn01qq2dzccr6i', 
      center:  [
        -97.76095065780527,
        39.15132376255781
        ],
      zoom: 4
    }))

    map.addControl(new mapboxgl.NavigationControl())

    map.on('load', () => {
      onLoad(map)
      setMapLoaded(true)
    })

    // Set the max bounds of the map to the extent of your dataset
    map.setMaxBounds([
      [-164.00944, 24.83458], // SouthWest coordinates
      [-68.52300, 70.17738] // Northeast coordinates
    ]);

    // Change the cursor to a pointer when the mouse is over a feature in the layer.  
    map.on('mouseenter', 'store-locations', () => {  
      map.getCanvas().style.cursor = 'pointer';  
    });  

    // Change it back to a pointer when it leaves.  
    map.on('mouseleave', 'store-locations', () => {  
      map.getCanvas().style.cursor = '';  
    });

    map.on('moveend', () => {
      const zoom = map.getZoom();

      // Set minimum zoom to query & render locations
      if (Math.round(zoom) >= 10 ) {

        // This query requests features from the unclustered layer in our tileset and 
        // retrieves all features visible in the map viewport
        const locationsInView = mapRef.current.queryRenderedFeatures({ layers: ['store-locations'] });
        setFeatures(locationsInView)
      }
    });

    map.on('zoomend', () => {
      const zoom = map.getZoom();
      // Set minimum zoom to query & render locations
      if (Math.round(zoom) <= 10 ) {
        setFeatures([]);
      }
    });

    // Add a click event listener to the map
    map.on('click', function(e) {
      // Query the features under the clicked point
      var feature = map.queryRenderedFeatures(e.point, {layers: ['store-locations']});
      // If there is a feature under the clicked point, set the ActiveFeature
      if (feature.length) {
          setActiveFeature(feature[0]);
      }
    });

  }, [])

  // Move Map to searched location or User's location
  useEffect(() => {
    if (activeLocation !== null) {

      // if the activeLocation is userbased and we haven't added the pulse yet - Add it
      if (activeLocation.type == 'user' && pulseRef.current == null) {
        addUserLocationPulse(mapRef, pulseRef, activeLocation);
      }

      // Fly to the activeLocation
      mapRef.current.flyTo({
        center: activeLocation.coords,
        essential: true,
        zoom: 11
      });
    }

  }, [activeLocation])

  // If user does not share location 
  useEffect(() => {
    if(denyLocation) {

      setTimeout(() => {
        // Fly to Demo City (Seattle)
        mapRef.current.flyTo({
          center: [-122.33935, 47.60774],
          essential: true, 
          zoom: 11
        });

      }, 2000)
    } 
  }, [denyLocation])

  return (
    <>
      <div ref={mapContainer} className='grow' />
      {mapLoaded &&
        features &&
          <Marker mapRef={mapRef.current} />
      }
    </>
  )
}

Map.propTypes = {
  onLoad: PropTypes.func
}

export default Map
