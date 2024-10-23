import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import {
  pointToTile,
  tileToQuadkey,
  quadkeyToTile,
  tileToBBOX
} from '@mapbox/tilebelt'
import Web from './Web'
import Ios from './Ios'
import Android from './Android'
import bboxPolygon from '@turf/bbox-polygon'
import { ExternalLink, FullscreenMapLayout, Map } from 'mapbox-demo-components'
import Tabs from '@mapbox/mr-ui/tabs'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode'
import turfBbox from '@turf/bbox'
import { format } from './utils'

import '@mapbox/mbx-assembly/dist/assembly.js'
import MapboxGLButtonControl from './MapboxGLButtonControl'
import StyleSwitcherControl from './vendor/mapbox-gl-style-switcher'
import styleSwitcherConfig from './styleSwitcherConfig'

import '@mapbox/mbx-assembly/dist/assembly.css'
import './App.css'

const INITIAL_CENTER = { lng: -73.9718, lat: 40.77709 }
const INITIAL_ZOOM = 3
const INITIAL_BEARING = -60.59
const INITIAL_PITCH = 49
const INITIAL_BOUNDS = {
  _sw: {
    lng: 0,
    lat: 0
  },
  _ne: {
    lng: 0,
    lat: 0
  }
}

function App() {
  const [center, setCenter] = useState(INITIAL_CENTER)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [bearing, setBearing] = useState(INITIAL_BEARING)
  const [pitch, setPitch] = useState(INITIAL_PITCH)
  const [bounds, setBounds] = useState(INITIAL_BOUNDS)
  const [mapInstance, setMap] = useState(null)
  const [quadkey, setQuadkey] = useState(null)
  const [bbox, setBbox] = useState(null)
  const drawRef = useRef()
  const [activeTab, setActiveTab] = useState('web')

  const startDrawingBbox = () => {
    if (
      Object.keys(mapInstance.getStyle().sources).includes(
        'mapbox-gl-draw-cold'
      )
    ) {
      drawRef.current.changeMode('draw_rectangle')
    } else {
      mapInstance.addControl(drawRef.current)
    }
    mapInstance.getCanvas().style.cursor = 'crosshair'
  }

  const onRectangleDraw = (e) => {
    drawRef.current.deleteAll()
    mapInstance.getCanvas().style.cursor = ''

    const feature = e.features[0]

    mapInstance.getSource('bbox').setData(feature)

    const newBbox = turfBbox(feature)

    setBbox(newBbox)
  }

  const addSourcesAndLayers = (mapInstance) => {
    mapInstance.addSource('tile-bbox', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    })

    mapInstance.addSource('bbox', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    })

    mapInstance.addLayer({
      id: 'tile-bbox-outline',
      type: 'line',
      source: 'tile-bbox',
      paint: {
        'line-color': 'rgba(50,100,255,0.3)'
      }
    })

    mapInstance.addLayer({
      id: 'tile-bbox-fill',
      type: 'fill',
      source: 'tile-bbox',
      paint: { 'fill-color': 'rgba(50,100,255, 0.04)' }
    })

    mapInstance.addLayer({
      id: 'bbox-outline',
      type: 'line',
      source: 'bbox',
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': '#fbb03b',
        'line-dasharray': [0.2, 2],
        'line-width': 2
      }
    })

    mapInstance.addLayer({
      id: 'bbox-fill',
      type: 'fill',
      source: 'bbox',
      paint: {
        'fill-color': '#fbb03b',
        'fill-outline-color': '#fbb03b',
        'fill-opacity': 0.1
      }
    })
  }

  useEffect(() => {
    if (!mapInstance) return

    addSourcesAndLayers(mapInstance)

    mapInstance.addControl(
      new MapboxGLButtonControl({
        className: '',
        title: 'Set bbox',
        eventHandler: startDrawingBbox,
        icon: 'polygon'
      })
    )

    mapInstance.addControl(
      new StyleSwitcherControl(styleSwitcherConfig),
      'bottom-right'
    )

    // initialize mapbox gl draw
    const bboxDrawModes = MapboxDraw.modes
    bboxDrawModes.draw_rectangle = DrawRectangle
    drawRef.current = new MapboxDraw({
      modes: bboxDrawModes,
      defaultMode: 'draw_rectangle',
      displayControlsDefault: false
    })
    mapInstance.on('draw.create', onRectangleDraw)

    return () => {
      mapInstance.removeLayer('tile-bbox-fill')
      mapInstance.removeLayer('tile-bbox-outline')
      mapInstance.removeSource('tile-bbox')
    }
  }, [mapInstance])

  useEffect(() => {
    if (!mapInstance || !quadkey) return
    mapInstance
      .getSource('tile-bbox')
      .setData(bboxPolygon(tileToBBOX(quadkeyToTile(quadkey))))
  }, [mapInstance, quadkey])

  const updatePosition = (e) => {
    const map = e.target
    if (!mapInstance) setMap(map)
    setCenter(map.getCenter())
    setZoom(map.getZoom())
    setBearing(map.getBearing())
    setPitch(map.getPitch())
    setBounds(map.getBounds())
  }

  const updateTile = (e) => {
    const map = e.target
    const center = map.getCenter()
    const zoom = map.getZoom()
    setQuadkey(
      tileToQuadkey(pointToTile(center.lng, center.lat, Math.ceil(zoom)))
    )
  }

  const onLoad = (e) => {
    updatePosition(e)
    updateTile(e)

    const map = e.target
    map.on('style.load', () => {
      addSourcesAndLayers(map)
      if (
        map.getStyle().name === 'Mapbox Satellite Streets' &&
        map.getZoom() >= 13
      ) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        })
        // add the DEM source as a terrain layer with exaggerated height
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })

        map.flyTo({
          pitch: 77
        })
      } else {
        map.flyTo({
          pitch: 0
        })
      }
    })
  }

  const displayZoom = format(zoom, 2)
  const displayBearing = format(bearing, 2)
  const displayPitch = format(pitch, 2)
  
  const tile = quadkey ? quadkeyToTile(quadkey) : []
  const zxy = quadkey ? `${tile[2]}/${tile[0]}/${tile[1]}` : ''

  return (
    <div className='App h-viewport-full'>
      <FullscreenMapLayout
        headerProps={{
          title: 'Location Helper',
          githubLink:
            'https://github.com/mapbox/public-tools-and-demos/tree/main/projects/location-helper'
        }}
        /* pass in sidebar width via assembly class */
        sidebarSize={'w-1/3'}
        mapComponent={
          <Map
            center={center}
            zoom={zoom}
            onMapLoad={onLoad}
            onMapDrag={updatePosition}
            onMapZoom={updatePosition}
            onMapRotate={updatePosition}
            onMapPitch={updatePosition}
            onMapMoveend={updatePosition}
            onMapMove={updateTile}
            addGeocoder
            hash
          >
            <div
              id='target'
              className='flex flex--center-main flex--center-cross z1 absolute'
              style={{
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                margin: 'auto',
                pointerEvents: 'none'
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}/img/target.svg`}
                alt='center of map'
                style={{ width: 40, height: 40 }}
              />
            </div>
          </Map>
        }
      >
        <div className='mb12 txt-s'>
          <span className='txt-bold'>Pan</span>,{' '}
          <span className='txt-bold'>Zoom</span>,{' '}
          <span className='txt-bold'>Rotate</span>, and{' '}
          <span className='txt-bold'>Pitch</span> the map.
        </div>
        <div className='mb12 txt-s'>
          The map&apos;s current center point, zoom level, rotation angle, and
          pitch angle are displayed below. You can use these values to set the
          camera position in
          <ExternalLink to='https://docs.mapbox.com/mapbox-gl-js'> Mapbox GL JS </ExternalLink>
          or the
          <ExternalLink to='https://docs.mapbox.com/ios/maps/guides'> iOS </ExternalLink> or the 
          <ExternalLink to='https://docs.mapbox.com/android/maps/guides'> Android </ExternalLink>mobile SDK's.
        </div>

        <Tabs
          onChange={(id) => setActiveTab(id)}
          active={activeTab}
          themeTabsContainer="mb12"
          items={[
            { id: 'web', label: 'Web', content: <Web  
                center={center}
                displayZoom={displayZoom} 
                displayBearing={displayBearing}
                displayPitch={displayPitch}
                bounds={bounds}
                bbox={bbox}
                zxy={zxy}
                /> 
            },
            { id: 'ios', label: 'iOS', content: <Ios
                center={center}
                displayZoom={displayZoom} 
                displayBearing={displayBearing}
                displayPitch={displayPitch}
                bounds={bounds}
                bbox={bbox}
                zxy={zxy}
              /> },
            { id: 'android', label: 'Android', content: <Android 
                center={center}
                displayZoom={displayZoom} 
                displayBearing={displayBearing}
                displayPitch={displayPitch}
                bounds={bounds}                
                bbox={bbox}
                zxy={zxy}
                />  },
          ]}
        />

      </FullscreenMapLayout>
    </div>
  )
}

export default App
