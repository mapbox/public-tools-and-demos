import PropTypes from 'prop-types'
import { useRef, useEffect, useState, useContext } from 'react'
import mapboxgl from 'mapbox-gl'
import MarkerList from '../MarkerList'
import { AppContext } from '../Context/AppContext';
import { addUserLocationPulse } from './pulse';

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

export const accessToken = (mapboxgl.accessToken =
  'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2lqbmp1MzNhMDBud3VvbHhqbjY1cnV2cCJ9.uGJJU2wgtXzcBNc62vY4_A')

const Map = ({ setData, onLoad, activeFeature, setActiveFeature, searchResult, denyLocation }) => {
  const mapContainer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [features, setFeatures] = useState();
  const { activeLocation } = useContext(AppContext);

  let mapRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
 //     style: 'mapbox://styles/examples/cm1qimluf00il01pdhpbcf5wg', Mapbox streets
      style: 'mapbox://styles/examples/cm0foo08s01tn01qq2dzccr6i', // Standard 
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

    map.on('style.load', () => {

      // This source loads a custom tileset utliizing MTS Clustering to group 
      // locations by region
      map.addSource('clustered-locations', {
        type: 'vector',
        url: 'mapbox://examples.store-locations-clustering'
      });

      // We style these clustered points with opacity & radius to show larger
      // circles where more density of locations exist see or example of styling
      // clustered data here https://docs.mapbox.com/mapbox-gl-js/example/cluster/
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "clustered-locations",
        "source-layer": "store-locations-clustered",
        filter: ["has", "count"],
        maxzoom: 6,
        paint: {
          "circle-color": "#006241",
          "circle-opacity": [
            "step",
            ["get", "count"],
            1,
            10,
            .75,
            30,
            .5,
          ],
          "circle-radius": ["step", ["get", "count"], 20, 10, 30, 50, 40],
        },
      });
      
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "clustered-locations",
        "source-layer": "store-locations-clustered",
        filter: ["has", "count"],
        maxzoom: 6,
        layout: {
          "text-field": ["get", "count"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 16,
        },
        paint: {
          "text-color": "#FFFFFF"
        }
      });
    });

    map.on('zoomend', () => {
      const zoom = map.getZoom();

      // Set minimum zoom to query & render locations
      if (Math.round(zoom) >= 10 ) {

        // This query requests features from the unclustered layer in our tileset
        const locationsInView = mapRef.current.queryRenderedFeatures({ layers: ['store-locations'] });
        setFeatures(locationsInView)
        setData(locationsInView);
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
          essential: true, // this animation is considered essential with respect to prefers-reduced-motion
          zoom: 11
        });

      }, 2000)
    } 
  }, [denyLocation])

  // Pan to active feature
  useEffect(() => {
   
   if(!activeFeature) {
    return;
   }
    mapRef.current.easeTo({
      center: activeFeature.geometry.coordinates,
      duration: 250,
      easing(t) {
          return t;
      }
    });
  }, [activeFeature])

  return (
    <>
      <div ref={mapContainer} className='h-full w-full' />
      {mapLoaded &&
        features &&
        <MarkerList 
          features={features}
          mapRef={mapRef.current}
          searchResult={searchResult}
          setActiveFeature={setActiveFeature}
          activeFeature={activeFeature}/>
      }
    </>
  )
}

Map.propTypes = {
  data: PropTypes.any,
  onFeatureClick: PropTypes.func,
  onLoad: PropTypes.func
}

export default Map
