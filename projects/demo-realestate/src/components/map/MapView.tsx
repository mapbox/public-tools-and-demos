import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import mapboxgl, { type Anchor } from 'mapbox-gl'
import accessToken from '../../lib/mapbox'

import { BASEMAP_CONFIG } from '../../lib/basemap'
import type { Boundary } from '../../lib/boundaries'
import {
  BUILDING_SELECT_COLOR,
  buildingAt,
  MARKER_ALTITUDE_M,
  setBuildingSelected
} from '../../lib/buildings'
import type { Bounds } from '../../lib/listings-source'
import type { SearchedLocation } from '../../lib/search'
import { MAP_CENTER, MAP_ZOOM } from '../../lib/map-defaults'
import type { Listing } from '../../types/listing'
import ListingMarker from './ListingMarker'
import { CARD_OFFSETS, chooseAnchor } from './cardPlacement'
import { selectLabelled, type MarkerVariant } from './labelSelection'

import closeIcon from '../../img/icons/close.svg'
import MaskIcon from '../ui/MaskIcon'

import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = accessToken

const BOUNDARY_SOURCE = 'search-boundary'
/** The theme's brand blue, --color-brand; paint properties need the raw hex. */
const BOUNDARY_COLOR = '#007afc'

interface MarkerEntry {
  marker: mapboxgl.Marker
  element: HTMLDivElement
  /** A label hangs above its point; a dot sits on it. Changing one means
      recreating the marker, since the anchor is fixed at construction. */
  variant: MarkerVariant
}

export default function MapView({
  listings,
  selectedId,
  favorites,
  flyTo,
  boundary,
  onRemoveBoundary,
  totalInView,
  onSelect,
  onBoundsChange,
  card,
  cardAt,
  onBackgroundClick
}: {
  listings: Listing[]
  selectedId: string | null
  favorites: Set<string>
  flyTo: SearchedLocation | null
  /** A searched area to outline and fit the map to. */
  boundary: Boundary | null
  onRemoveBoundary: () => void
  totalInView: number
  onSelect: (id: string) => void
  onBoundsChange: (bounds: Bounds) => void
  /** The selected listing's card, hosted in a Popup anchored at `cardAt`. */
  card: ReactNode
  cardAt: [number, number] | null
  /** A click on the map itself, not on a marker or the card. */
  onBackgroundClick: () => void
}) {
  const rendered = listings
  const [labelled, setLabelled] = useState<Set<string>>(new Set())

  const [splitVersion, setSplitVersion] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const onBoundsChangeRef = useRef(onBoundsChange)
  onBoundsChangeRef.current = onBoundsChange
  const onBackgroundClickRef = useRef(onBackgroundClick)
  onBackgroundClickRef.current = onBackgroundClick
  // One host element for the card's portal, handed to each Popup in turn, so
  // re-anchoring the Popup never remounts the card inside it.
  const [popupHost] = useState(() => document.createElement('div'))
  // Sources and layers can only be added once the style has loaded.
  const [styleReady, setStyleReady] = useState(false)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef(new Map<string, MarkerEntry>())
  // Markers are created imperatively, so a render is needed once their host
  // elements exist for the portals below to attach to.
  const [, syncPortals] = useReducer((count: number) => count + 1, 0)

  // The selected listing's building, highlighted in red once Standard draws
  // buildings. Held in refs because it is driven by both selection changes and
  // the map's own 'idle' event, which is registered once at creation.
  const selectedPointRef = useRef<[number, number] | null>(null)
  const highlightRef = useRef<ReturnType<typeof buildingAt>>(undefined)
  const refreshHighlightRef = useRef(() => {})
  refreshHighlightRef.current = () => {
    const map = mapRef.current
    const point = selectedPointRef.current
    if (!map || !point || highlightRef.current) return
    const building = buildingAt(map, point)
    if (!building) return
    setBuildingSelected(map, building, true)
    highlightRef.current = building
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/standard',
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      config: {
        basemap: {
          ...BASEMAP_CONFIG,
          colorBuildingSelect: BUILDING_SELECT_COLOR
        }
      }
    })
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: true }),
      'top-right'
    )
    mapRef.current = map
    const markers = markersRef.current

    const report = () => {
      const bounds = map.getBounds()
      if (!bounds) return
      onBoundsChangeRef.current({
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth()
      })
    }
    // Reported immediately rather than waiting on 'load': the style can fail to
    // finish loading (a restricted token does exactly that) and the listings
    // would then never appear, even though the bounds are already known.
    report()
    const bumpSplit = () => setSplitVersion((value) => value + 1)
    map.on('moveend', report)
    map.on('moveend', bumpSplit)
    // Selecting at a low zoom finds no building; zooming in draws them, and
    // 'idle' is the first moment they can be queried.
    const onIdle = () => refreshHighlightRef.current()
    map.on('idle', onIdle)

    // The searched area's outline. The `middle` slot keeps it above roads and
    // below Standard's labels; the fill is faint enough to leave the map
    // readable while still marking what is in and out.
    map.once('load', () => {
      map.addSource(BOUNDARY_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      map.addLayer({
        id: 'search-boundary-fill',
        type: 'fill',
        source: BOUNDARY_SOURCE,
        slot: 'middle',
        paint: { 'fill-color': BOUNDARY_COLOR, 'fill-opacity': 0.06 }
      })
      map.addLayer({
        id: 'search-boundary-line',
        type: 'line',
        source: BOUNDARY_SOURCE,
        slot: 'middle',
        layout: { 'line-join': 'round' },
        paint: { 'line-color': BOUNDARY_COLOR, 'line-width': 2.5 }
      })
      setStyleReady(true)
    })
    // Clicking empty map dismisses the card, as on Zillow. Markers and the
    // card itself sit inside the map's container, so their clicks are ignored.
    const onClick = (event: mapboxgl.MapMouseEvent) => {
      const target = event.originalEvent.target
      if (
        target instanceof Element &&
        target.closest('.mapboxgl-marker, .mapboxgl-popup')
      ) {
        return
      }
      onBackgroundClickRef.current()
    }
    map.on('click', onClick)

    // GL JS only reacts to *window* resizes, so switching Split to Map — which
    // widens this container without the window changing — would otherwise leave
    // the canvas stranded at its old size.
    const observer = new ResizeObserver(() => map.resize())
    observer.observe(container)

    return () => {
      map.off('moveend', report)
      map.off('moveend', bumpSplit)
      map.off('idle', onIdle)
      map.off('click', onClick)
      popupRef.current?.remove()
      popupRef.current = null
      observer.disconnect()
      markers.clear()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Which listings show a price depends on where they land on screen, so it is
  // recomputed whenever the set changes or the map settles.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    setLabelled(
      selectLabelled(rendered, (coordinates) => map.project(coordinates))
    )
  }, [rendered, splitVersion])

  // Selection and favourites only ever *add* a label. Clicking a dot promotes
  // that one marker and leaves every other marker exactly as it was.
  const variantFor = useCallback(
    (id: string): MarkerVariant =>
      labelled.has(id) || id === selectedId || favorites.has(id)
        ? 'label'
        : 'dot',
    [labelled, selectedId, favorites]
  )

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const entries = markersRef.current

    const wanted = new Map(rendered.map((listing) => [listing.id, listing]))

    for (const [id, entry] of entries) {
      // Dropped from view, or switched between dot and label — either way the
      // existing marker cannot be reused.
      if (!wanted.has(id) || entry.variant !== variantFor(id)) {
        entry.marker.remove()
        entries.delete(id)
      }
    }

    for (const listing of rendered) {
      if (entries.has(listing.id)) continue
      const variant = variantFor(listing.id)
      const element = document.createElement('div')
      const marker = new mapboxgl.Marker({
        element,
        anchor: variant === 'label' ? 'bottom' : 'center',
        altitude: MARKER_ALTITUDE_M
      })
        .setLngLat(listing.coordinates)
        .addTo(map)
      entries.set(listing.id, { marker, element, variant })
    }

    // Labels are only collision-tested against other labels, so a neighbour's
    // dot can land inside one; and a promoted label is not tested at all.
    // Paint order resolves both: selected on top, then labels, then dots.
    for (const [id, entry] of entries) {
      entry.element.style.zIndex =
        id === selectedId ? '3' : entry.variant === 'label' ? '2' : '1'
    }

    syncPortals()
  }, [rendered, variantFor, selectedId])

  // A new selection clears the old building before looking for its own. It
  // only queries the map; like selection generally, it never moves it.
  useEffect(() => {
    const map = mapRef.current
    if (highlightRef.current && map) {
      setBuildingSelected(map, highlightRef.current, false)
    }
    highlightRef.current = undefined
    selectedPointRef.current =
      rendered.find((listing) => listing.id === selectedId)?.coordinates ?? null
    refreshHighlightRef.current()
    // `rendered` is read, not tracked: it is rebuilt on every pan, and the
    // selected listing's coordinates do not change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  // Opens the card's Popup below the marker, then measures it and re-anchors
  // above or beside the marker if it would not fit. Hidden for that one frame
  // so a card that needs to move never flashes in the wrong place.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!cardAt) {
      popupRef.current?.remove()
      popupRef.current = null
      return
    }

    const open = (anchor: Anchor) => {
      popupRef.current?.remove()
      popupRef.current = new mapboxgl.Popup({
        anchor,
        offset: CARD_OFFSETS,
        className: 'listing-popup',
        maxWidth: 'none',
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        focusAfterOpen: false
      })
        .setLngLat(cardAt)
        // Level with the raised marker, so the card stays attached to it.
        .setAltitude(MARKER_ALTITUDE_M)
        .setDOMContent(popupHost)
        .addTo(map)
    }

    popupHost.style.visibility = 'hidden'
    open('top')
    const frame = requestAnimationFrame(() => {
      const container = map.getContainer()
      const anchor = chooseAnchor(
        map.project(cardAt),
        { width: popupHost.offsetWidth, height: popupHost.offsetHeight },
        { width: container.clientWidth, height: container.clientHeight }
      )
      if (anchor !== 'top') open(anchor)
      popupHost.style.visibility = ''
    })
    return () => cancelAnimationFrame(frame)
  }, [cardAt, popupHost])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReady) return
    map
      .getSource<mapboxgl.GeoJSONSource>(BOUNDARY_SOURCE)
      ?.setData(
        boundary
          ? { type: 'Feature', properties: {}, geometry: boundary.geometry }
          : { type: 'FeatureCollection', features: [] }
      )
  }, [boundary, styleReady])

  // Fitting to the area is what brings its listings into view; the viewport
  // filter then does the rest. Runs only when the boundary itself changes.
  useEffect(() => {
    if (!mapRef.current || !boundary) return
    const [west, south, east, north] = boundary.bbox
    mapRef.current.fitBounds(
      [
        [west, south],
        [east, north]
      ],
      { padding: 48, duration: 1200 }
    )
  }, [boundary])

  useEffect(() => {
    if (!mapRef.current || !flyTo) return
    mapRef.current.flyTo({ center: flyTo.center, zoom: 14, duration: 1200 })
  }, [flyTo])

  // Selecting a listing deliberately does NOT move the map. Panning fires
  // 'moveend', which recomputes the viewport set and hands back a new listings
  // array, which would re-trigger the pan — an endless loop that rebuilt every
  // marker each time. Search still moves the map, because the user asked it to.

  return (
    // A size container named `map`: the property card picks its tier from the
    // map's dimensions (the `roomy` variant in styles.css).
    <div className='relative size-full overflow-hidden rounded-lg [container:map/size]'>
      <div ref={containerRef} className='size-full' />

      {/* Top centre, clear of the listing count (left) and zoom controls. */}
      {boundary && (
        <button
          type='button'
          onClick={onRemoveBoundary}
          aria-label={`Remove the ${boundary.name} boundary`}
          className='absolute transition left-1/2 top-3 z-10 flex -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-full bg-white py-1.5 pl-3.5 pr-2 text-sm font-bold text-ink shadow-[0_1px_4px_rgba(0,0,0,0.18)] hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
        >
          Remove boundary
          <MaskIcon src={closeIcon} size={18} />
        </button>
      )}

      {totalInView > rendered.length && (
        <div className='pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1.5 text-sm text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.18)]'>
          Showing {rendered.length.toLocaleString()} of{' '}
          {totalInView.toLocaleString()} listings
        </div>
      )}

      {rendered.map((listing) => {
        const entry = markersRef.current.get(listing.id)
        if (!entry) return null
        return createPortal(
          <ListingMarker
            listing={listing}
            variant={variantFor(listing.id)}
            selected={listing.id === selectedId}
            favorited={favorites.has(listing.id)}
            onSelect={() => onSelect(listing.id)}
          />,
          entry.element,
          listing.id
        )
      })}
      {card && createPortal(card, popupHost)}
    </div>
  )
}
