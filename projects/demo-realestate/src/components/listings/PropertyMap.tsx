import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import clsx from 'clsx'

import { DESTINATION_STYLES, destinationLetter } from '../../lib/destinations'
import accessToken from '../../lib/mapbox'
import type { SearchedLocation } from '../../lib/search'
import { NEIGHBORHOOD_ZOOM, neighborhoodUrl } from '../../lib/static-image'
import type { Listing } from '../../types/listing'
import type { RouteState } from './useRoutes'

const HEIGHT = 375
/** Static Images caps each dimension at 1280 logical pixels. */
const MAX_STATIC_WIDTH = 1280
const ROUTES_SOURCE = 'routes'

const destinationMarker = (index: number) => {
  const element = document.createElement('div')
  element.className = clsx(
    'flex size-[30px] items-center justify-center rounded-full border-2 border-white text-base font-bold text-white shadow-[0_1px_4px_rgba(0,0,0,0.25)]',
    DESTINATION_STYLES[index].className
  )
  element.textContent = destinationLetter(index)
  return element
}

/**
 * The full listing's map. It opens as a single Static Images request and only
 * becomes a Mapbox GL JS map when clicked, or as soon as there is a
 * destination to route to, since routes need the live map. Until then, opening
 * a listing costs one image rather than a WebGL context and a style load.
 *
 * The poster is requested at the frame's measured width rather than cropped
 * with object-cover, because cropping would cut off the logo and attribution
 * the API draws into its corners. It shows the same centre and zoom the GL map
 * starts at, and stays until the GL map has loaded, so the switch is a change
 * of style rather than a jump.
 */
export default function PropertyMap({
  listing,
  destinations,
  routes
}: {
  listing: Listing
  destinations: SearchedLocation[]
  routes: Map<string, RouteState>
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [posterFailed, setPosterFailed] = useState(false)
  const [interactive, setInteractive] = useState(false)
  // Only set once the style has loaded, so everything that adds sources,
  // layers or markers can simply wait on it.
  const [map, setMap] = useState<mapboxgl.Map | null>(null)

  // Latches: removing the last destination leaves the live map in place.
  if (destinations.length > 0 && !interactive) setInteractive(true)

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.min(MAX_STATIC_WIDTH, Math.round(entry.contentRect.width)))
    })
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = mapContainerRef.current
    if (!interactive || !container) return

    const instance = new mapboxgl.Map({
      container,
      accessToken,
      style: 'mapbox://styles/mapbox/standard',
      center: listing.coordinates,
      zoom: NEIGHBORHOOD_ZOOM
    })
    instance.addControl(new mapboxgl.NavigationControl(), 'top-right')
    new mapboxgl.Marker({ color: '#1e2136' })
      .setLngLat(listing.coordinates)
      .addTo(instance)

    instance.once('load', () => {
      instance.addSource(ROUTES_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      // The `middle` slot puts routes above roads and below Standard's
      // labels, so street names stay readable across the line.
      instance.addLayer({
        id: 'route-casing',
        type: 'line',
        source: ROUTES_SOURCE,
        slot: 'middle',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 8 }
      })
      instance.addLayer({
        id: 'route-line',
        type: 'line',
        source: ROUTES_SOURCE,
        slot: 'middle',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 4.5 }
      })
      setMap(instance)
    })

    const observer = new ResizeObserver(() => instance.resize())
    observer.observe(container)
    return () => {
      observer.disconnect()
      setMap(null)
      instance.remove()
    }
  }, [interactive, listing.coordinates])

  useEffect(() => {
    if (!map) return
    const markers = destinations.map((destination, index) =>
      new mapboxgl.Marker({ element: destinationMarker(index) })
        .setLngLat(destination.center)
        .addTo(map)
    )
    return () => markers.forEach((marker) => marker.remove())
  }, [map, destinations])

  // The routes Map is rebuilt every render; this key changes only when a
  // route actually arrives, changes profile or goes away, which is when the
  // lines should be redrawn and the view refitted.
  const routesKey = destinations
    .map((destination) => {
      const state = routes.get(destination.id)
      return state?.status === 'ready'
        ? `${destination.id}:${state.route.duration}:${state.route.distance}`
        : `${destination.id}:${state?.status}`
    })
    .join('|')
  const routesRef = useRef(routes)
  routesRef.current = routes

  useEffect(() => {
    if (!map) return
    const features: GeoJSON.Feature<GeoJSON.LineString>[] = []
    destinations.forEach((destination, index) => {
      const state = routesRef.current.get(destination.id)
      if (state?.status !== 'ready') return
      features.push({
        type: 'Feature',
        properties: { color: DESTINATION_STYLES[index].hex },
        geometry: state.route.geometry
      })
    })
    // Reversed so A, the first destination, paints on top.
    features.reverse()
    const source = map.getSource<mapboxgl.GeoJSONSource>(ROUTES_SOURCE)
    source?.setData({ type: 'FeatureCollection', features })

    if (destinations.length === 0) return
    const bounds = new mapboxgl.LngLatBounds(
      listing.coordinates,
      listing.coordinates
    )
    for (const destination of destinations) bounds.extend(destination.center)
    for (const feature of features) {
      for (const point of feature.geometry.coordinates) {
        bounds.extend(point as [number, number])
      }
    }
    map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 600 })
    // routesKey stands in for routes; destinations drives the colour order.
  }, [map, routesKey, destinations, listing.coordinates])

  return (
    <div
      ref={frameRef}
      className='relative w-full overflow-hidden rounded-xl border border-gray-200 bg-surface-sunken'
      style={{ height: HEIGHT }}
    >
      {/* size-full, not absolute inset-0: GL JS gives its container
          `position: relative`, which would collapse an inset-positioned one
          to zero height. */}
      {interactive && <div ref={mapContainerRef} className='size-full' />}

      {!map && width && (
        <button
          type='button'
          onClick={() => setInteractive(true)}
          disabled={interactive}
          aria-label='Explore an interactive map of the area'
          className={clsx(
            'group absolute inset-0 overflow-hidden',
            !interactive && 'cursor-pointer'
          )}
        >
          {!posterFailed && (
            <img
              src={neighborhoodUrl(listing.coordinates, width, HEIGHT)}
              alt=''
              width={width}
              height={HEIGHT}
              onError={() => setPosterFailed(true)}
              className='absolute left-0 top-0 max-w-none'
            />
          )}
          <span className='absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-colors group-hover:bg-surface-inverse group-hover:text-ink-inverse'>
            {interactive ? 'Loading map…' : 'Click to explore the map'}
          </span>
        </button>
      )}
    </div>
  )
}
