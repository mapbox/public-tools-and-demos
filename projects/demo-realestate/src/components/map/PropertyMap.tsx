import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import mapboxgl from 'mapbox-gl'
import clsx from 'clsx'

import expandIcon from '../../img/icons/expand.svg'
import streetViewIcon from '../../img/icons/street-view.svg'
import { useStreetPhoto } from '../../hooks/useStreetPhoto'
import { DESTINATION_STYLES, destinationLetter } from '../../lib/destinations'
import { BASEMAP_CONFIG } from '../../lib/basemap'
import type { StreetPhoto } from '../../lib/kartaview'
import accessToken from '../../lib/mapbox'
import type { SearchedLocation } from '../../lib/search'
import { NEIGHBORHOOD_ZOOM, neighborhoodUrl } from '../../lib/static-image'
import type { Listing } from '../../types/listing'
import type { RouteState } from '../property-panel/useRoutes'
import MaskIcon from '../ui/MaskIcon'
import FullScreenView from './FullScreenView'

const StreetView = lazy(() => import('../street-view/StreetView'))

const HEIGHT = 375
/** Close enough to see which side of the street the camera is on. */
const STREET_ZOOM = 17
/** Static Images caps each dimension at 1280 logical pixels. */
const MAX_STATIC_WIDTH = 1280
const ROUTES_SOURCE = 'routes'

/**
 * Where the street view camera stands and which way it looks: a dot with a
 * view cone. The marker's rotation is the cone's compass bearing, set on every
 * frame the panorama turns.
 */
const cameraMarker = () => {
  const element = document.createElement('div')
  element.className = 'pointer-events-none size-[72px]'
  element.innerHTML = `<svg viewBox="0 0 72 72" width="72" height="72" aria-hidden="true">
    <defs><linearGradient id="street-cone" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#007afc" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#007afc" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="M36 36 L18 4 A36 36 0 0 1 54 4 Z" fill="url(#street-cone)"/>
    <circle cx="36" cy="36" r="7" fill="#007afc" stroke="#fff" stroke-width="2.5"/>
  </svg>`
  return element
}

const PILL =
  'flex cursor-pointer items-center gap-1.5 rounded-full bg-white text-sm font-bold text-ink shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-colors hover:bg-surface-inverse hover:text-ink-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

/** Inline in the listing, or opened full screen as a map or street view. */
type View = 'inline' | 'map' | 'street'

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
  // One GL map serves every view: its container is moved between the inline
  // frame, the full-screen map and street view's inset, so routes, markers
  // and the camera survive the switch without a second map load.
  const [mapElement] = useState(() => {
    const element = document.createElement('div')
    // size-full, not absolute inset-0: GL JS gives its container
    // `position: relative`, which would collapse an inset-positioned one to
    // zero height.
    element.className = 'size-full'
    return element
  })
  const inlineSlotRef = useRef<HTMLDivElement>(null)
  const fullScreenSlotRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>('inline')
  const [width, setWidth] = useState<number | null>(null)
  const [posterFailed, setPosterFailed] = useState(false)
  const [interactive, setInteractive] = useState(false)
  // Only set once the style has loaded, so everything that adds sources,
  // layers or markers can simply wait on it.
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const streetPhoto = useStreetPhoto(listing.coordinates)
  // The photo street view opened on. Steps along the street happen inside the
  // viewer and are tracked in `camera`, so they never reopen it.
  const [streetStart, setStreetStart] = useState<StreetPhoto | null>(null)
  const [camera, setCamera] = useState<StreetPhoto | null>(null)
  const cameraMarkerRef = useRef<mapboxgl.Marker | null>(null)

  // Latches: removing the last destination leaves the live map in place.
  if (destinations.length > 0 && !interactive) setInteractive(true)

  const openStreetView = () => {
    if (!streetPhoto) return
    setStreetStart(streetPhoto)
    setCamera(streetPhoto)
    setView('street')
    // The map becomes an inset over the panorama, which needs it live.
    setInteractive(true)
  }
  const openFullMap = () => {
    setView('map')
    setInteractive(true)
  }
  // Stable, so the full-screen view's focus and Escape handling don't reset.
  const backToListing = useCallback(() => {
    setView('inline')
    setStreetStart(null)
    setCamera(null)
  }, [])
  // Every frame the panorama turns: straight to the marker, never via state.
  // Kept as well, because street view reports its opening bearing from its
  // own effect, which runs before this component's effect creates the marker.
  const bearingRef = useRef(0)
  const onBearing = useCallback((degrees: number) => {
    bearingRef.current = degrees
    cameraMarkerRef.current?.setRotation(degrees)
  }, [])

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.min(MAX_STATIC_WIDTH, Math.round(entry.contentRect.width)))
    })
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  // Before the map is created below, so it is built in place. Resized at
  // once rather than by the observer, which fires too late for the camera's
  // easeTo in the same commit: it would centre on the old, larger frame.
  // Resized on every view change, not just a move: the full-screen map
  // shrinks to street view's inset in the same slot.
  useLayoutEffect(() => {
    const slot =
      view === 'inline' ? inlineSlotRef.current : fullScreenSlotRef.current
    if (!interactive || !slot) return
    if (mapElement.parentElement !== slot) slot.appendChild(mapElement)
    map?.resize()
  }, [view, interactive, mapElement, map])

  useEffect(() => {
    if (!interactive) return
    const container = mapElement

    const instance = new mapboxgl.Map({
      container,
      accessToken,
      style: 'mapbox://styles/mapbox/standard',
      config: { basemap: BASEMAP_CONFIG },
      center: listing.coordinates,
      zoom: NEIGHBORHOOD_ZOOM
    })
    // Bottom right, leaving the top right corner to the expand button.
    instance.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
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
  }, [interactive, listing.coordinates, mapElement])

  const streetOpen = view === 'street'
  const wasStreetOpen = useRef(false)

  useEffect(() => {
    if (!map) return
    if (!streetOpen) {
      // Back from street view: return to the neighbourhood framing.
      if (wasStreetOpen.current) {
        map.easeTo({ center: listing.coordinates, zoom: NEIGHBORHOOD_ZOOM })
      }
      wasStreetOpen.current = false
      return
    }
    wasStreetOpen.current = true
    const marker = new mapboxgl.Marker({
      element: cameraMarker(),
      rotationAlignment: 'map',
      pitchAlignment: 'map',
      rotation: bearingRef.current
    })
      .setLngLat(listing.coordinates)
      .addTo(map)
    cameraMarkerRef.current = marker
    return () => {
      marker.remove()
      cameraMarkerRef.current = null
    }
  }, [map, streetOpen, listing.coordinates])

  // Follows the camera as it steps along the street.
  useEffect(() => {
    if (!map || !camera) return
    cameraMarkerRef.current?.setLngLat(camera.coordinates)
    map.easeTo({
      center: camera.coordinates,
      zoom: Math.max(map.getZoom(), STREET_ZOOM)
    })
  }, [map, camera, streetOpen])

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

  const place = [listing.address, listing.neighborhood]
    .filter(Boolean)
    .join(', ')

  const streetViewButton = streetPhoto && (
    <button
      type='button'
      onClick={openStreetView}
      className={clsx(PILL, 'absolute left-3 top-3 z-10 py-2 pl-3 pr-4')}
    >
      <MaskIcon src={streetViewIcon} size={20} />
      Street view
    </button>
  )

  return (
    <div
      ref={frameRef}
      className='relative w-full overflow-hidden rounded-xl border border-gray-200 bg-surface-sunken'
      style={{ height: HEIGHT }}
    >
      {interactive && <div ref={inlineSlotRef} className='size-full' />}

      {view !== 'inline' && (
        <FullScreenView
          title={place}
          label={streetOpen ? 'Street view' : 'Map'}
          onBack={backToListing}
        >
          {streetStart && streetOpen && (
            <div className='absolute inset-0 bg-surface-inverse'>
              <Suspense
                fallback={
                  <p className='flex size-full items-center justify-center text-sm font-medium text-ink-inverse'>
                    Loading street view…
                  </p>
                }
              >
                <StreetView
                  photo={streetStart}
                  target={listing.coordinates}
                  onPhotoChange={setCamera}
                  onBearing={onBearing}
                />
              </Suspense>
            </div>
          )}
          {/* In street view the map is an inset over the panorama, showing
              where the camera stands and which way it looks. Its zoom
              buttons are hidden there; it is too small for them. */}
          <div
            ref={fullScreenSlotRef}
            className={clsx(
              streetOpen
                ? 'absolute left-4 top-4 z-10 h-[220px] w-[320px] overflow-hidden rounded-lg border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.25)] max-md:left-3 max-md:top-3 max-md:h-[120px] max-md:w-[160px] [&_.mapboxgl-ctrl-group]:hidden'
                : 'size-full'
            )}
          />
          {view === 'map' && streetViewButton}
        </FullScreenView>
      )}

      {/* Kept while full screen, though covered, so focus can return to
          whichever one opened it. */}
      {streetViewButton}

      <button
        type='button'
        onClick={openFullMap}
        aria-label='Expand the map to full screen'
        title='Expand map'
        className={clsx(PILL, 'absolute right-3 top-3 z-10 p-2')}
      >
        <MaskIcon src={expandIcon} size={20} />
      </button>

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
