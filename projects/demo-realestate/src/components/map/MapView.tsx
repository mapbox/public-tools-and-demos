import { useEffect, useReducer, useRef } from 'react'
import { createPortal } from 'react-dom'
import mapboxgl from 'mapbox-gl'
import accessToken from '../../lib/mapbox'

import type { Listing } from '../../types/listing'
import MapLegend from './MapLegend'
import PriceLabelPin from './PriceLabelPin'

import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = accessToken

interface MarkerEntry {
  marker: mapboxgl.Marker
  element: HTMLDivElement
}

export default function MapView({
  listings,
  selectedId,
  onSelect
}: {
  listings: Listing[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef(new Map<string, MarkerEntry>())
  // Markers are created imperatively, so a render is needed once their host
  // elements exist for the portals below to attach to.
  const [, syncPortals] = useReducer((count: number) => count + 1, 0)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-73.7695, 41.024],
      zoom: 13
    })
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: true }),
      'top-right'
    )
    mapRef.current = map

    return () => {
      markersRef.current.clear()
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const entries = markersRef.current

    for (const [id, entry] of entries) {
      if (!listings.some((listing) => listing.id === id)) {
        entry.marker.remove()
        entries.delete(id)
      }
    }

    for (const listing of listings) {
      if (entries.has(listing.id)) continue
      const element = document.createElement('div')
      const marker = new mapboxgl.Marker({ element, anchor: 'bottom' })
        .setLngLat(listing.coordinates)
        .addTo(map)
      entries.set(listing.id, { marker, element })
    }

    syncPortals()
  }, [listings])

  // Keep the selected listing in view without yanking the map on every change.
  useEffect(() => {
    const map = mapRef.current
    const listing = listings.find((item) => item.id === selectedId)
    if (!map || !listing) return
    map.easeTo({ center: listing.coordinates, duration: 600 })
  }, [selectedId, listings])

  return (
    <div className='relative size-full overflow-hidden rounded-lg'>
      <div ref={containerRef} className='size-full' />

      {listings.map((listing) => {
        const entry = markersRef.current.get(listing.id)
        if (!entry) return null
        return createPortal(
          <PriceLabelPin
            listing={listing}
            selected={listing.id === selectedId}
            onSelect={() => onSelect(listing.id)}
          />,
          entry.element,
          listing.id
        )
      })}

      <div className='pointer-events-none absolute inset-x-0 bottom-4 flex justify-end px-4'>
        <div className='pointer-events-auto'>
          <MapLegend />
        </div>
      </div>
    </div>
  )
}
