import { useRef, useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './App.css'
import UseCasePanel from './components/UseCasePanel'
import MapControls from './components/MapControls'
import TopBar from './components/TopBar'
import {
  CUSTOM_LAYERS,
  CUSTOM_SOURCES,
  COLOR_THEME_FILTERS,
  GLOBE_BOUNDS,
  ROTATION_SPEED_FACTOR
} from './constants'
import { activateGlobe } from './scenes/globe'
import { activate3DBuildings } from './scenes/buildings'
import { activateMarkers } from './scenes/markers'
import { activateDataOverlay } from './scenes/dataOverlay'
import { activateRaster } from './scenes/raster'
import { activateNavigation } from './scenes/navigation'
import { activateAssetTracking } from './scenes/assetTracking'
import { activateTerrain } from './scenes/terrain'

export default function App() {
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const markersRef = useRef([])
  const animFrameRef = useRef(null)
  const globeRotatingRef = useRef(false)
  const rotationTypeRef = useRef(null) // 'globe' | 'terrain'
  const startCameraRotationRef = useRef(null)
  const pendingTimeoutRef = useRef(null)
  const resumeTimeoutRef = useRef(null)
  const activationIdRef = useRef(0)

  const [activeUseCase, setActiveUseCase] = useState('globe')
  const [mapLoaded, setMapLoaded] = useState(false)

  // Controls state
  const [lightPreset, setLightPreset] = useState('day')
  const [colorTheme, setColorTheme] = useState('default')
  const [isSatellite, setIsSatellite] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [showLandmarks, setShowLandmarks] = useState(true)

  // ─── Map Init ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const cooperativeGestures =
      new URLSearchParams(window.location.search).get('cooperativeGestures') ===
      'true'

    mapRef.current = new mapboxgl.Map({
      accessToken: import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN,
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/standard',
      bounds: GLOBE_BOUNDS,
      pitch: 0,
      bearing: 0,
      cooperativeGestures
    })

    const startCameraRotation = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      globeRotatingRef.current = true
      const step = () => {
        if (!globeRotatingRef.current || !mapRef.current) return
        if (
          rotationTypeRef.current === 'terrain' ||
          rotationTypeRef.current === 'buildings'
        ) {
          mapRef.current.setBearing(mapRef.current.getBearing() + 0.05)
        } else {
          const center = mapRef.current.getCenter()
          mapRef.current.setCenter([
            center.lng - ROTATION_SPEED_FACTOR,
            center.lat
          ])
        }
        animFrameRef.current = requestAnimationFrame(step)
      }
      animFrameRef.current = requestAnimationFrame(step)
    }
    startCameraRotationRef.current = startCameraRotation

    const stopCameraRotation = () => {
      // Don't interfere with scenes that manage their own animation loop
      if (rotationTypeRef.current === 'navigation') return
      if (rotationTypeRef.current === 'asset-tracking') return
      globeRotatingRef.current = false
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      // Resume after 10s of idle if a rotation-capable use case is active
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
      if (rotationTypeRef.current) {
        resumeTimeoutRef.current = setTimeout(() => {
          resumeTimeoutRef.current = null
          startCameraRotation()
        }, 10000)
      }
    }

    mapRef.current.on('load', () => {
      setMapLoaded(true)
      rotationTypeRef.current = 'globe'
      startCameraRotation()
    })

    // Stop rotation when user interacts directly with the map; resumes after idle
    mapRef.current.on('mousedown', stopCameraRotation)
    mapRef.current.on('touchstart', stopCameraRotation)
    mapRef.current.on('wheel', stopCameraRotation)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      mapRef.current.remove()
    }
  }, [])

  // ─── Config effects ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mapLoaded) return
    mapRef.current.setConfigProperty('basemap', 'lightPreset', lightPreset)
  }, [lightPreset, mapLoaded])

  useEffect(() => {
    if (!mapLoaded) return
    mapRef.current.setConfigProperty(
      'basemap',
      'showPointOfInterestLabels',
      showLandmarks
    )
    mapRef.current.setConfigProperty(
      'basemap',
      'showTransitLabels',
      showLandmarks
    )
  }, [showLandmarks, mapLoaded])

  useEffect(() => {
    if (!mapLoaded) return
    mapRef.current.setConfigProperty('basemap', 'showPlaceLabels', showLabels)
  }, [showLabels, mapLoaded])

  // Color theme via CSS filter on the map container
  useEffect(() => {
    if (!mapContainerRef.current) return
    mapContainerRef.current.style.filter =
      COLOR_THEME_FILTERS[colorTheme] ?? 'none'
  }, [colorTheme])

  // Satellite layer
  useEffect(() => {
    if (!mapLoaded) return
    const map = mapRef.current

    if (isSatellite) {
      map.setConfigProperty('basemap', 'show3dObjects', false)
      if (!map.getSource('satellite-source')) {
        map.addSource('satellite-source', {
          type: 'raster',
          url: 'mapbox://mapbox.satellite',
          tileSize: 256
        })
      }
      if (!map.getLayer('satellite-layer')) {
        map.addLayer({
          id: 'satellite-layer',
          type: 'raster',
          source: 'satellite-source',
          slot: 'middle'
        })
      }
    } else {
      map.setConfigProperty('basemap', 'show3dObjects', true)
      if (map.getLayer('satellite-layer')) map.removeLayer('satellite-layer')
      if (map.getSource('satellite-source'))
        map.removeSource('satellite-source')
    }
  }, [isSatellite, mapLoaded])

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    activationIdRef.current++
    globeRotatingRef.current = false
    rotationTypeRef.current = null
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current)
      pendingTimeoutRef.current = null
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
      resumeTimeoutRef.current = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const map = mapRef.current
    CUSTOM_LAYERS.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id)
    })
    CUSTOM_SOURCES.forEach((id) => {
      if (id === 'mapbox-dem') {
        map.setTerrain(null)
      }
      if (map.getSource(id)) map.removeSource(id)
    })
  }, [])

  // ─── Use Case Router ───────────────────────────────────────────────────────

  const handleUseCaseSelect = useCallback(
    (id) => {
      if (!mapLoaded) return

      const ctx = {
        map: mapRef.current,
        markersRef,
        activationIdRef,
        pendingTimeoutRef,
        animFrameRef,
        startCameraRotationRef,
        rotationTypeRef,
        setLightPreset,
        setColorTheme,
        setIsSatellite
      }

      // Globe View: re-clicking restarts the rotation
      if (id === 'globe') {
        cleanup()
        setActiveUseCase('globe')
        setIsSatellite(false)
        activateGlobe(ctx)
        return
      }

      if (id === activeUseCase) return

      cleanup()
      setActiveUseCase(id)
      if (id !== 'terrain') setIsSatellite(false)

      switch (id) {
        case 'buildings':
          activate3DBuildings(ctx)
          break
        case 'markers':
          activateMarkers(ctx)
          break
        case 'data-overlay':
          activateDataOverlay(ctx)
          break
        case 'raster':
          activateRaster(ctx)
          break
        case 'navigation':
          activateNavigation(ctx)
          break
        case 'asset-tracking':
          activateAssetTracking(ctx)
          break
        case 'terrain':
          activateTerrain(ctx)
          break
      }
    },
    [
      mapLoaded,
      activeUseCase,
      cleanup,
      setLightPreset,
      setColorTheme,
      setIsSatellite
    ]
  )

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div id='map-container' ref={mapContainerRef} />
      <UseCasePanel activeId={activeUseCase} onSelect={handleUseCaseSelect} />
      <MapControls
        lightPreset={lightPreset}
        setLightPreset={setLightPreset}
        colorTheme={colorTheme}
        setColorTheme={setColorTheme}
        isSatellite={isSatellite}
        setIsSatellite={setIsSatellite}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        showLandmarks={showLandmarks}
        setShowLandmarks={setShowLandmarks}
      />
      <TopBar
        activeId={activeUseCase}
        onSelect={handleUseCaseSelect}
        lightPreset={lightPreset}
        setLightPreset={setLightPreset}
        colorTheme={colorTheme}
        setColorTheme={setColorTheme}
        isSatellite={isSatellite}
        setIsSatellite={setIsSatellite}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        showLandmarks={showLandmarks}
        setShowLandmarks={setShowLandmarks}
      />
    </>
  )
}
