// The Map component instantiates a Mapbox GL JS map, adds mouse event listeners,
// sets constraints on the max bounds of the map (to the continental US), uses
// queryRenderedFeatures to return GeoJSON features after any movement (at high zoom
// levels) and utilizes useEffects to implement map.flyTo() animations based on state
// changes.  Note that we store our map instance in a Ref so we can use it in Markers.jsx
// and our mapContainer in a ref so that the Map does not re-render when the component does.

'use client'

import PropTypes from 'prop-types'
import { useRef, useEffect, useState, useContext } from 'react'
import mapboxgl from 'mapbox-gl'
import Marker from '../Marker'
import { AppContext } from '../Context/AppContext'
import { addUserLocationPulse } from './pulse'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

const Map = ({ onLoad }) => {
  const mapContainer = useRef(null)
  const controlRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const {
    setActiveFeature,
    activeLocation,
    features,
    setFeatures,
    denyLocation,
    isMobile
  } = useContext(AppContext)

  let mapRef = useRef(null)
  const pulseRef = useRef(null)

  // This demo imports accessToken from your .env file, to use this project
  // for your purposes, rename the .env.example file to .env and add your Mapbox access token.

  mapboxgl.accessToken = import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN

  useEffect(() => {
    if (mapRef.current) return // map already initialized

    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      // this is a custom style, created with store location data loaded via Mapbox Tiling Service and styled in Mapbox Studio.
      style: 'mapbox://styles/examples/cm0foo08s01tn01qq2dzccr6i',
      center: [-97.76095065780527, 39.15132376255781],
      zoom: 4
    }))

    controlRef.current = new mapboxgl.NavigationControl()
    if (!isMobile) {
      map.addControl(controlRef.current)
    }

    map.on('load', () => {
      onLoad(map)
      setMapLoaded(true)
    })

    // Set the max bounds of the map to the extent of your dataset
    map.setMaxBounds([
      [-164.00944, 24.83458], // SouthWest coordinates
      [-68.523, 70.17738] // Northeast coordinates
    ])

    // Change the cursor to a pointer when the mouse is over a feature in the store-locations layer.
    map.on('mouseenter', 'store-locations', () => {
      map.getCanvas().style.cursor = 'pointer'
    })

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'store-locations', () => {
      map.getCanvas().style.cursor = ''
    })

    map.on('moveend', () => {
      const zoom = map.getZoom()

      // Set minimum zoom to query & render locations
      if (Math.round(zoom) >= 10) {
        // This query requests features from the unclustered layer in our tileset and
        // retrieves all features visible in the map viewport
        const locationsInView = mapRef.current.queryRenderedFeatures({
          layers: ['store-locations']
        })
        setFeatures(locationsInView)
      }
    })

    map.on('zoomend', () => {
      const zoom = map.getZoom()
      // Set minimum zoom to query & render locations
      if (Math.round(zoom) <= 10) {
        setFeatures([])
      }
    })

    // Add a click event listener to the map
    map.on('click', function (e) {
      // Query the features under the clicked point
      var feature = map.queryRenderedFeatures(e.point, {
        layers: ['store-locations']
      })
      // If there is a feature under the clicked point, set the ActiveFeature
      if (feature.length) {
        setActiveFeature(feature[0])
      }
    })
  }, [])

  // Move Map to searched location or User's location
  useEffect(() => {
    if (activeLocation !== null) {
      // if the activeLocation is userbased and we haven't added the pulse yet - Add it
      if (activeLocation.type == 'user' && pulseRef.current == null) {
        addUserLocationPulse(mapRef, pulseRef, activeLocation)
      }

      // Fly to the activeLocation
      mapRef.current.flyTo({
        center: activeLocation.coords,
        essential: true,
        zoom: 11
      })
    }
  }, [activeLocation])

  // If user does not share location
  useEffect(() => {
    if (denyLocation) {
      setTimeout(() => {
        // Fly to Demo City (Seattle)
        mapRef.current.flyTo({
          center: [-122.33935, 47.60774],
          essential: true,
          zoom: 11
        })
      }, 2000)
    }
  }, [denyLocation])

  useEffect(() => {
    const hasControl = mapRef.current.hasControl(controlRef.current)

    if (hasControl && isMobile) {
      mapRef.current.removeControl(controlRef.current)
    } else if (!hasControl && !isMobile) {
      mapRef.current.addControl(controlRef.current)
    }
  }, [isMobile])

  return (
    <>
      <div ref={mapContainer} className='grow' />
      {mapLoaded && features && <Marker mapRef={mapRef.current} />}
    </>
  )
}

Map.propTypes = {
  onLoad: PropTypes.func
}

export default Map
