import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import mapboxGeocoder from '@mapbox/mapbox-gl-geocoder'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import accessToken from './access-token'

mapboxgl.accessToken = accessToken

const Map = (
  {
    center = [0, 0],
    zoom = 2,
    style = 'mapbox://styles/mapbox/streets-v12',
    addGeocoder = false,
    addNavigationControl = true,
    onMapLoad,
    onMapRender,
    onMapDrag,
    onMapZoom,
    onMapRotate,
    onMapPitch,
    onMapMove,
    onMapMoveend,
    onMapClick,
    geocoderRef,
    accessToken,
    projection = 'globe',
    hash = false,
    children
  },
  ref
) => {
  const mapContainer = useRef(null)

  let mapRef = ref

  if (!mapRef) {
    mapRef = useRef(null)
  }

  useEffect(() => {
    if (mapRef.current) {
      //debugger;
      if (onMapRender) {
        mapRef.current.on('load', onMapRender)
      }
      return //initialize map once
    }
    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style,
      center,
      zoom,
      projection,
      accessToken,
      hash
    }))

    if (addGeocoder) {
      const geocoder = new mapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      })
      map.addControl(geocoder)

      if (geocoderRef) {
        geocoderRef.current = geocoder
      }
    }

    if (addNavigationControl) {
      map.addControl(new mapboxgl.NavigationControl())
    }

    if (onMapLoad) {
      map.on('load', onMapLoad)
    }

    if (onMapDrag) {
      map.on('drag', onMapDrag)
    }

    if (onMapZoom) {
      map.on('zoom', onMapZoom)
    }

    if (onMapRotate) {
      map.on('rotate', onMapRotate)
    }

    if (onMapPitch) {
      map.on('pitch', onMapPitch)
    }

    if (onMapMoveend) {
      map.on('moveend', onMapMoveend)
    }

    if (onMapMove) {
      map.on('move', onMapMove)
    }

    if (onMapClick) {
      map.on('click', onMapClick)
    }
  })
  return (
    <div ref={mapContainer} className='map-container h-full'>
      {children}
    </div>
  )
}

Map.propTypes = {
  accessToken: PropTypes.string,
  addGeocoder: PropTypes.bool,
  addNavigationControl: PropTypes.bool,
  center: PropTypes.array,
  children: PropTypes.node,
  geocoderRef: PropTypes.shape({
    current: PropTypes.any
  }),
  hash: PropTypes.bool,
  onMapClick: PropTypes.func,
  onMapDrag: PropTypes.func,
  onMapLoad: PropTypes.func,
  onMapMove: PropTypes.func,
  onMapMoveend: PropTypes.func,
  onMapPitch: PropTypes.func,
  onMapRender: PropTypes.func,
  onMapRotate: PropTypes.func,
  onMapZoom: PropTypes.func,
  projection: PropTypes.string,
  style: PropTypes.string,
  zoom: PropTypes.number
}

export default React.forwardRef(Map)
