import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { RecommendedNeighborhood } from '../types'
import './MapView.css'

/** Compute centroid of a GeoJSON Polygon or MultiPolygon */
function getCentroid(geometry: GeoJSON.Geometry): [number, number] | null {
  let rings: number[][][] = []
  if (geometry.type === 'Polygon') rings = geometry.coordinates
  else if (geometry.type === 'MultiPolygon') rings = geometry.coordinates.flat()
  else return null

  let sumLng = 0, sumLat = 0, count = 0
  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      sumLng += lng; sumLat += lat; count++
    }
  }
  return count > 0 ? [sumLng / count, sumLat / count] : null
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const NYC_CENTER: [number, number] = [-73.9857, 40.7484]
const NYC_ZOOM = 11

const GEOJSON_URL =
  'https://raw.githubusercontent.com/chriswhong/nyc-neighborhood-boundaries/main/dist/nyc-neighborhood-boundaries.geojson'

type Props = {
  recommendedNeighborhoods: RecommendedNeighborhood[]
  hoveredNeighborhood: string | null
  boundsToFit: [[number, number], [number, number]] | null
  geojsonFeatures: Map<string, GeoJSON.Feature>
  onNeighborhoodClick: (name: string) => void
}

export default function MapView({ recommendedNeighborhoods, hoveredNeighborhood, boundsToFit, geojsonFeatures, onNeighborhoodClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapLoadedRef = useRef(false)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    if (!MAPBOX_TOKEN) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: NYC_CENTER,
      zoom: NYC_ZOOM,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('load', () => {
      map.addSource('neighborhoods', {
        type: 'geojson',
        data: GEOJSON_URL,
        generateId: true,
      })

      // Base fill — subtle for all neighborhoods
      map.addLayer({
        id: 'neighborhoods-fill',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': '#94a3b8',
          'fill-opacity': 0.1,
        },
      })

      // Recommended fill — colored per neighborhood
      map.addLayer({
        id: 'neighborhoods-recommended',
        type: 'fill',
        source: 'neighborhoods',
        filter: ['in', ['get', 'name'], ['literal', []]],
        paint: {
          'fill-color': '#ccc',
          'fill-opacity': 0.45,
        },
      })

      // Hovered highlight — on top
      map.addLayer({
        id: 'neighborhoods-hovered',
        type: 'fill',
        source: 'neighborhoods',
        filter: ['==', ['get', 'name'], ''],
        paint: {
          'fill-color': '#1d4ed8',
          'fill-opacity': 0.55,
        },
      })

      // Outline for recommended
      map.addLayer({
        id: 'neighborhoods-recommended-outline',
        type: 'line',
        source: 'neighborhoods',
        filter: ['in', ['get', 'name'], ['literal', []]],
        paint: {
          'line-color': '#334155',
          'line-width': 1.5,
          'line-opacity': 0.6,
        },
      })

      // Base outlines
      map.addLayer({
        id: 'neighborhoods-outline',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#94a3b8',
          'line-width': 0.5,
          'line-opacity': 0.4,
        },
      })

      // Labels
      map.addLayer({
        id: 'neighborhoods-labels',
        type: 'symbol',
        source: 'neighborhoods',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 9, 14, 13],
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#1e293b',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5,
        },
      })

      // Click recommended neighborhoods on map
      map.on('click', 'neighborhoods-recommended', (e) => {
        const name = e.features?.[0]?.properties?.name
        if (name) onNeighborhoodClick(name)
      })

      map.on('mouseenter', 'neighborhoods-recommended', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'neighborhoods-recommended', () => {
        map.getCanvas().style.cursor = ''
      })

      mapLoadedRef.current = true
      mapRef.current = map
    })

    return () => {
      map.remove()
      mapRef.current = null
      mapLoadedRef.current = false
    }
  }, [])

  // Update recommended layer when neighborhoods change
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return

    const names = recommendedNeighborhoods.map(n => n.name)

    map.setFilter('neighborhoods-recommended', ['in', ['get', 'name'], ['literal', names]])
    map.setFilter('neighborhoods-recommended-outline', ['in', ['get', 'name'], ['literal', names]])

    // Build a match expression for per-neighborhood colors (requires at least one pair)
    if (recommendedNeighborhoods.length > 0) {
      const colorMatch: unknown[] = ['match', ['get', 'name']]
      for (const n of recommendedNeighborhoods) {
        colorMatch.push(n.name, n.color)
      }
      colorMatch.push('#94a3b8') // fallback
      map.setPaintProperty('neighborhoods-recommended', 'fill-color', colorMatch as mapboxgl.Expression)
    } else {
      map.setPaintProperty('neighborhoods-recommended', 'fill-color', '#94a3b8')
    }

  }, [recommendedNeighborhoods])

  // Rebuild label markers whenever recommendations or feature data changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return

    // Remove old markers
    for (const m of markersRef.current) m.remove()
    markersRef.current = []

    for (const n of recommendedNeighborhoods) {
      const feature = geojsonFeatures.get(n.name.toLowerCase())
      if (!feature) continue

      const centroid = getCentroid(feature.geometry)
      if (!centroid) continue

      const el = document.createElement('div')
      el.className = 'neighborhood-map-label'
      el.style.setProperty('--dot-color', n.color)
      el.innerHTML = `<span class="neighborhood-map-label-dot"></span><span class="neighborhood-map-label-text">${n.name}</span>`
      el.addEventListener('click', () => onNeighborhoodClick(n.name))

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat(centroid)
        .addTo(map)

      markersRef.current.push(marker)
    }
  }, [recommendedNeighborhoods, geojsonFeatures, onNeighborhoodClick])

  // Fly to show all recommended neighborhoods whenever bounds are computed
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current || !boundsToFit) return

    map.fitBounds(boundsToFit, { padding: 80, maxZoom: 14, duration: 800 })
  }, [boundsToFit])

  // Update hover layer when hoveredNeighborhood changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return

    if (hoveredNeighborhood) {
      map.setFilter('neighborhoods-hovered', ['==', ['get', 'name'], hoveredNeighborhood])

      // Find the color of the hovered neighborhood
      const n = recommendedNeighborhoods.find(r => r.name === hoveredNeighborhood)
      map.setPaintProperty('neighborhoods-hovered', 'fill-color', n?.color ?? '#1d4ed8')
    } else {
      map.setFilter('neighborhoods-hovered', ['==', ['get', 'name'], ''])
    }
  }, [hoveredNeighborhood, recommendedNeighborhoods])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="map-panel map-missing-token">
        <p>Add <code>VITE_MAPBOX_TOKEN</code> to your <code>.env</code> file to load the map.</p>
      </div>
    )
  }

  return <div className="map-panel" ref={containerRef} />
}
