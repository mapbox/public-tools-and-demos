// The Map component instantiates a Mapbox GL JS map, adds mouse event listeners,
// sets constraints on the max bounds of the map (to the continental US), uses
// queryRenderedFeatures to return GeoJSON features after any movement (at high zoom
// levels) and utilizes useEffects to implement map.flyTo() animations based on state
// changes.  Note that we store our map instance in a Ref so we can use it in Markers.jsx
// and our mapContainer in a ref so that the Map does not re-render when the component does.

'use client'

import PropTypes from 'prop-types'
import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import mapboxgl from 'mapbox-gl'
import TruckMarker from './TruckMarker'
import { accessToken } from 'mapbox-demo-components'

import 'mapbox-gl/dist/mapbox-gl.css'
import { ORIGIN_COORDINATES } from './App'

const mapStyle = {
  id: 'custom-style',
  version: 8,
  sources: {
    track: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    }
  },
  layers: [
    {
      id: 'track',
      type: 'line',
      source: 'track',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#007CFF',
        'line-width': 6
      }
    }
  ],
  imports: [
    {
      id: 'basemap',
      url: 'mapbox://styles/mapbox/standard'
    }
  ]
}

const WaypointMarker = ({ coordinates, map }) => {
  // a ref for the mapboxgl.Marker instance
  const markerRef = useRef(null)
  // a ref for an element to hold the marker's content
  const contentRef = useRef(document.createElement('div'))

  // instantiate the marker on mount, remove it on unmount
  useEffect(() => {
    markerRef.current = new mapboxgl.Marker(contentRef.current, {
      anchor: 'center'
    })
      .setLngLat(coordinates)
      .addTo(map)

    return () => {
      markerRef.current.remove()
    }
  }, [])

  return (
    <>
      {createPortal(
        <div
          style={{
            backgroundImage: `url(/demo-delivery-app/img/waypoint.svg)`,
            height: 26,
            width: 26,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />,

        contentRef.current
      )}
    </>
  )
}

WaypointMarker.propTypes = {
  coordinates: PropTypes.any,
  map: PropTypes.any
}

const Map = ({ track, waypoints, onLoad, onMarkerMove }) => {
  const mapContainer = useRef(null)
  const controlRef = useRef(null)
  let mapRef = useRef(null)

  const [mapLoaded, setMapLoaded] = useState(false)

  // This demo imports accessToken from  `demo-components/accessToken`, to use this project
  // for your purposes, replace `accessToken` below with your own Access Token available
  // at (https://account.mapbox.com/) - This token is also used in SearchBoxWrapper

  mapboxgl.accessToken = accessToken

  useEffect(() => {
    if (mapRef.current) return
    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: ORIGIN_COORDINATES,
      zoom: 3.5
    }))

    controlRef.current = new mapboxgl.NavigationControl()
    map.addControl(controlRef.current)

    map.on('load', () => {
      onLoad(map)
      setMapLoaded(true)
    })
  })

  useEffect(() => {
    if (!mapLoaded) return

    mapRef.current.getSource('track').setData(track)
  }, [track])

  return (
    <>
      {mapRef.current &&
        waypoints.length > 0 &&
        waypoints.map((waypoint, i) => (
          <WaypointMarker key={i} coordinates={waypoint} map={mapRef.current} />
        ))}
      <div ref={mapContainer} className='w-full h-full rounded-md' />
      {mapLoaded && <TruckMarker map={mapRef.current} onMove={onMarkerMove} />}
    </>
  )
}

Map.propTypes = {
  onLoad: PropTypes.func,
  onMarkerMove: PropTypes.any,
  track: PropTypes.any,
  waypoints: PropTypes.shape({
    length: PropTypes.number,
    map: PropTypes.func
  })
}

export default Map
