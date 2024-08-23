import PropTypes from 'prop-types'
import { useRef, useEffect, useState, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'

import Marker from '../Marker'
import { PropertyData } from '../Card'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

export const accessToken = (mapboxgl.accessToken =
  'pk.eyJ1IjoibGFicy1zYW5kYm94IiwiYSI6ImNrMTZuanRmZDA2eGQzYmxqZTlnd21qY3EifQ.Q7DM5HqE5QJzDEnCx8BGFw')

const Map = ({ setData, onLoad, onFeatureClick, userLocation, activeFeature }) => {
  const mapContainer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [features, setFeatures] = useState();

  let mapRef = useRef(null)

  useEffect(() => {
    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/andrewsepic1/clzws087r005901o1h46j4adt',
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

  }, [])

  useEffect(() => {
    if (userLocation !== null) {

      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
        zoom: 11
      });

      mapRef.current.on('zoomend', () => {
        const locationsInView = mapRef.current.queryRenderedFeatures({ layers: ['usa-location-ac9rzv'] });
        setFeatures(locationsInView)
        setData(locationsInView);
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
        features.map((d, i) => (
          <Marker 
            activeFeature={activeFeature}
            setActiveFeature={onFeatureClick}
            key={i} 
            feature={d}
            map={mapRef.current}>
            <PropertyData className="bg-white" feature={d} />
          </Marker>
        ))}
    </>
  )
}

Map.propTypes = {
  data: PropTypes.array,
  onFeatureClick: PropTypes.func,
  onLoad: PropTypes.func
}

export default Map
