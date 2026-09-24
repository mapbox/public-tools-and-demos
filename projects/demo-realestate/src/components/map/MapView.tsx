import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import mapboxgl from 'mapbox-gl'
import accessToken from '../../lib/mapbox'

import type { Bounds } from '../../lib/listings-source'
import type { SearchedLocation } from '../layout/SearchBar'
import { MAP_CENTER, MAP_ZOOM } from '../../lib/map-defaults'
import type { Listing } from '../../types/listing'
import ListingMarker from './ListingMarker'
import { selectLabelled, type MarkerVariant } from './labelSelection'

import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = accessToken

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
  totalInView,
  onSelect,
  onBoundsChange
}: {
  listings: Listing[]
  selectedId: string | null
  favorites: Set<string>
  flyTo: SearchedLocation | null
  totalInView: number
  onSelect: (id: string) => void
  onBoundsChange: (bounds: Bounds) => void
}) {
  const rendered = listings
  const [labelled, setLabelled] = useState<Set<string>>(new Set())

  const [splitVersion, setSplitVersion] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const onBoundsChangeRef = useRef(onBoundsChange)
  onBoundsChangeRef.current = onBoundsChange
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef(new Map<string, MarkerEntry>())
  // Markers are created imperatively, so a render is needed once their host
  // elements exist for the portals below to attach to.
  const [, syncPortals] = useReducer((count: number) => count + 1, 0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/standard',
      center: MAP_CENTER,
      zoom: MAP_ZOOM
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

    // GL JS only reacts to *window* resizes, so switching Split to Map — which
    // widens this container without the window changing — would otherwise leave
    // the canvas stranded at its old size.
    const observer = new ResizeObserver(() => map.resize())
    observer.observe(container)

    return () => {
      map.off('moveend', report)
      map.off('moveend', bumpSplit)
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
        anchor: variant === 'label' ? 'bottom' : 'center'
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

  useEffect(() => {
    if (!mapRef.current || !flyTo) return
    mapRef.current.flyTo({ center: flyTo.center, zoom: 14, duration: 1200 })
  }, [flyTo])

  // Selecting a listing deliberately does NOT move the map. Panning fires
  // 'moveend', which recomputes the viewport set and hands back a new listings
  // array, which would re-trigger the pan — an endless loop that rebuilt every
  // marker each time. Search still moves the map, because the user asked it to.

  return (
    <div className='relative size-full overflow-hidden rounded-lg'>
      <div ref={containerRef} className='size-full' />

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
    </div>
  )
}
