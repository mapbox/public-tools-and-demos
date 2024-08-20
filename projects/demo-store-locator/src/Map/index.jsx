import PropTypes from 'prop-types'
import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

import Marker from '../Marker'
import Card from '../Card'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

export const accessToken = (mapboxgl.accessToken =
  'pk.eyJ1IjoibGFicy1zYW5kYm94IiwiYSI6ImNrMTZuanRmZDA2eGQzYmxqZTlnd21qY3EifQ.Q7DM5HqE5QJzDEnCx8BGFw')

const Map = ({ data, setData, onLoad, onFeatureClick, userLocation, activeFeature }) => {
  const mapContainer = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

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
        zoom: 12
      });

      mapRef.current.on('moveend', () => {
        const features = mapRef.current.queryRenderedFeatures({ layers: ['usa-location-ac9rzv'] });
        setData(features);
      });

    }

  }, [userLocation])

  // Move to active feature
  useEffect(() => {
   console.log("feature in Map.js", activeFeature);
   
   if(!activeFeature) {
    return;
   }
    // const long = activeFeature._geometry.coordinates[0];
    // const lat = activeFeature._geometry.coordinates
      mapRef.current.flyTo({
        center: activeFeature.geometry.coordinates,
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });
  }, [activeFeature])

  return (
    <>
      <div ref={mapContainer} className='h-full w-full' />
      {mapLoaded &&
        data &&
        data.map((d, i) => (
          <Marker key={i} feature={d} map={mapRef.current}>
            <Card feature={d} width={300} shortImage onClick={onFeatureClick} />
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
