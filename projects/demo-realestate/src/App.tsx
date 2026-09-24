import { useCallback, useEffect, useMemo, useState } from 'react'

import FilterBar from './components/layout/FilterBar'
import LearnMapbox from './components/layout/LearnMapbox'
import Header from './components/layout/Header'
import ListingsPanel from './components/listings/ListingsPanel'
import MapView from './components/map/MapView'
import type { SearchedLocation } from './components/layout/SearchBar'
import { loadListings, withinBounds, type Bounds } from './lib/listings-source'
import { MARKER_CAP } from './components/map/markerDetail'
import type { Listing } from './types/listing'
import type { PropertyType } from './types/listing'
import type { ViewMode } from './types/view'

const ALL_TYPES: PropertyType[] = ['house', 'condo', 'townhouse']

/** King County sale prices; fixed so the control does not jump as data loads. */
const PRICE_BOUNDS = { min: 75000, max: 7700000 }

export default function App() {
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [view, setView] = useState<ViewMode>('split')
  const [searchedLocation, setSearchedLocation] =
    useState<SearchedLocation | null>(null)
  const [price] = useState(PRICE_BOUNDS)
  const [priceOpen, setPriceOpen] = useState(false)
  const [beds, setBeds] = useState<number | null>(null)
  const [types, setTypes] = useState<PropertyType[]>(ALL_TYPES)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadListings().then(setAllListings)
  }, [])

  // Everything currently in the viewport that passes the filters. Search moves
  // the map rather than filtering: it queries the Search Box API for places,
  // not this demo's listings.
  const visible = useMemo(() => {
    if (!bounds) return []
    return allListings.filter((listing) => {
      if (!withinBounds(listing, bounds)) return false
      if (listing.price < price.min || listing.price > price.max) return false
      if (beds !== null && listing.beds < beds) return false
      // Dataset listings carry no property type, so the type chips cannot
      // exclude them.
      return listing.type === undefined || types.includes(listing.type)
    })
  }, [allListings, bounds, price, beds, types])

  // Only this many are ever drawn; 500 DOM markers pan at 60fps, 1000 does not.
  const rendered = useMemo(() => visible.slice(0, MARKER_CAP), [visible])

  const handleBoundsChange = useCallback((next: Bounds) => setBounds(next), [])

  const toggleType = (type: PropertyType) =>
    setTypes((current) =>
      current.includes(type)
        ? current.filter((value) => value !== type)
        : [...current, type]
    )

  const toggleFavorite = (id: string) =>
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className='relative flex h-full flex-col overflow-hidden bg-surface-sunken'>
      <Header view={view} onViewChange={setView} />

      <main className='min-h-0 flex-1 px-6 pb-6'>
        <div className='flex h-full min-h-0 flex-col gap-4 rounded-xl border border-line bg-white p-6'>
          <FilterBar
            onSearchSelect={setSearchedLocation}
            price={price}
            priceBounds={PRICE_BOUNDS}
            priceOpen={priceOpen}
            onPriceOpenChange={setPriceOpen}
            beds={beds}
            onBedsChange={setBeds}
            types={types}
            onToggleType={toggleType}
            savedCount={favorites.size}
            resultCount={visible.length}
            showResultCount={view === 'map'}
          />

          <div className='flex min-h-0 flex-1 gap-6'>
            {view !== 'map' && (
              <div
                className={
                  view === 'split'
                    ? 'flex w-[420px] shrink-0 flex-col'
                    : 'flex min-w-0 flex-1 flex-col'
                }
              >
                <ListingsPanel
                  listings={rendered}
                  totalInView={visible.length}
                  layout={view === 'split' ? 'horizontal' : 'vertical'}
                  selectedId={selectedId}
                  favorites={favorites}
                  onSelect={setSelectedId}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            )}

            {view !== 'list' && (
              <div className='min-h-0 min-w-0 flex-1'>
                <MapView
                  listings={rendered}
                  selectedId={selectedId}
                  favorites={favorites}
                  flyTo={searchedLocation}
                  totalInView={visible.length}
                  onSelect={setSelectedId}
                  onBoundsChange={handleBoundsChange}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <LearnMapbox />
    </div>
  )
}
