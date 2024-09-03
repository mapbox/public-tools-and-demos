import PropTypes from 'prop-types'
import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

import MarkerList from '../MarkerList'
import { LocationData } from '../Card'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

export const accessToken = (mapboxgl.accessToken =
  'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2lqbmp1MzNhMDBud3VvbHhqbjY1cnV2cCJ9.uGJJU2wgtXzcBNc62vY4_A')

const Map = ({ setData, onLoad, onFeatureClick, userLocation, activeFeature, searchResult }) => {
  const mapContainer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [features, setFeatures] = useState();

  let mapRef = useRef(null)

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

    map.on('zoomend', () => {
      const locationsInView = mapRef.current.queryRenderedFeatures({ layers: ['good-locations-c3utwz'] });
      console.log("locationsInView", locationsInView);
      setFeatures(locationsInView)
      setData(locationsInView);
    });

  }, [])

  useEffect(() => {
    if (userLocation !== null) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
        zoom: 11
      });
    }

  }, [userLocation])

  // Move to active feature
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
          map={mapRef.current}
          searchResult={searchResult}
          activeFeature={activeFeature}/>
      }
    </>
  )
}

Map.propTypes = {
  data: PropTypes.array,
  onFeatureClick: PropTypes.func,
  onLoad: PropTypes.func
}

export default Map
