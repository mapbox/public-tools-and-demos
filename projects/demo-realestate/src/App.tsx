import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import FilterBar from './components/layout/FilterBar'
import LearnMapbox from './components/layout/LearnMapbox'
import Header from './components/layout/Header'
import ListingsPanel from './components/listings/ListingsPanel'
import PropertyCard from './components/listings/PropertyCard'
import PropertyPanel from './components/listings/PropertyPanel'
import MapView from './components/map/MapView'
import {
  contains,
  fetchBoundary,
  isArea,
  type Boundary
} from './lib/boundaries'
import type { Profile } from './lib/directions'
import type { SearchedLocation } from './lib/search'
import { loadListings, withinBounds, type Bounds } from './lib/listings-source'
import { MARKER_CAP } from './components/map/labelSelection'
import {
  FULL_RANGE,
  bucketPrices,
  matchesPrice,
  type PriceRange
} from './lib/price'
import type { Listing } from './types/listing'
import type { PropertyType } from './types/listing'
import type { ViewMode } from './types/view'

const ALL_TYPES: PropertyType[] = ['house', 'multi-family', 'townhouse']

export default function App() {
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [view, setView] = useState<ViewMode>('split')
  const [searchedLocation, setSearchedLocation] =
    useState<SearchedLocation | null>(null)
  // The searched area's outline, when the boundaries endpoint has one. While
  // set, listings are limited to what falls inside it.
  const [boundary, setBoundary] = useState<Boundary | null>(null)
  // Only the latest search may apply its result; an earlier, slower boundary
  // lookup arriving afterwards is ignored.
  const searchRef = useRef(0)
  // Bumped to remount, and so empty, the search field when the boundary is
  // removed from the map, keeping the two in step.
  const [searchKey, setSearchKey] = useState(0)
  const [price, setPrice] = useState<PriceRange>(FULL_RANGE)
  const [priceOpen, setPriceOpen] = useState(false)
  const [beds, setBeds] = useState<number | null>(null)
  const [types, setTypes] = useState<PropertyType[]>(ALL_TYPES)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // The full listing for the selected home, over everything else.
  const [panelOpen, setPanelOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  // The viewer's own places, so they carry over from one listing to the next.
  const [destinations, setDestinations] = useState<SearchedLocation[]>([])
  const [profile, setProfile] = useState<Profile>('driving')

  useEffect(() => {
    loadListings().then(setAllListings)
  }, [])

  // Worked out once per boundary rather than on every pan: a point-in-polygon
  // test against a 1,000+ vertex outline is the most expensive filter here.
  const insideBoundary = useMemo(
    () =>
      boundary &&
      new Set(
        allListings
          .filter((listing) => contains(boundary, listing.coordinates))
          .map((listing) => listing.id)
      ),
    [allListings, boundary]
  )

  // Everything in view that passes every filter except price. The histogram is
  // drawn from this, so its bars stay put while the price handles move.
  const priceFacet = useMemo(() => {
    if (!bounds) return []
    return allListings.filter((listing) => {
      if (!withinBounds(listing, bounds)) return false
      if (insideBoundary && !insideBoundary.has(listing.id)) return false
      if (beds !== null && listing.beds < beds) return false
      // The few listings with no property type pass every type filter.
      return listing.type === undefined || types.includes(listing.type)
    })
  }, [allListings, bounds, insideBoundary, beds, types])

  const priceCounts = useMemo(() => bucketPrices(priceFacet), [priceFacet])

  const visible = useMemo(
    () => priceFacet.filter((listing) => matchesPrice(listing.price, price)),
    [priceFacet, price]
  )

  // Only this many are ever drawn; 500 DOM markers pan at 60fps, 1000 does not.
  const rendered = useMemo(() => visible.slice(0, MARKER_CAP), [visible])

  const handleBoundsChange = useCallback((next: Bounds) => setBounds(next), [])

  // Searching an area (a city, a county) outlines it and limits listings to
  // it, as on Zillow. Anything else, or an area the boundaries endpoint does
  // not cover, just moves the map there.
  const handleSearchSelect = async (location: SearchedLocation) => {
    const request = ++searchRef.current
    setBoundary(null)
    const found = isArea(location) ? await fetchBoundary(location) : null
    if (request !== searchRef.current) return
    if (found) setBoundary(found)
    else setSearchedLocation(location)
  }

  const clearSearch = () => {
    searchRef.current += 1
    setBoundary(null)
  }

  const removeBoundary = () => {
    clearSearch()
    setSearchKey((key) => key + 1)
  }
  const closeCard = useCallback(() => setSelectedId(null), [])
  const closePanel = useCallback(() => setPanelOpen(false), [])

  // List view has no map for the small card to float over, so choosing a
  // listing there goes straight to the full listing.
  const selectFromList = (id: string) => {
    setSelectedId(id)
    if (view === 'list') setPanelOpen(true)
  }

  // Looked up from the full set, not the rendered slice, so the card stays open
  // when a pan pushes its listing past the marker cap.
  const selected = useMemo(
    () => allListings.find((listing) => listing.id === selectedId) ?? null,
    [allListings, selectedId]
  )
  // The small card gives way to the full listing while that is open.
  const card = panelOpen ? null : selected

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
            onSearchSelect={handleSearchSelect}
            onSearchClear={clearSearch}
            searchKey={searchKey}
            price={price}
            priceCounts={priceCounts}
            priceOpen={priceOpen}
            onPriceOpenChange={setPriceOpen}
            onPriceChange={setPrice}
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
                  onSelect={selectFromList}
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
                  boundary={boundary}
                  onRemoveBoundary={removeBoundary}
                  totalInView={visible.length}
                  onSelect={setSelectedId}
                  onBoundsChange={handleBoundsChange}
                  cardAt={card ? card.coordinates : null}
                  card={
                    card && (
                      <PropertyCard
                        key={card.id}
                        listing={card}
                        favorited={favorites.has(card.id)}
                        onToggleFavorite={() => toggleFavorite(card.id)}
                        onClose={closeCard}
                        onViewListing={() => setPanelOpen(true)}
                      />
                    )
                  }
                  onBackgroundClick={closeCard}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {selected && panelOpen && (
        <PropertyPanel
          key={selected.id}
          listing={selected}
          favorited={favorites.has(selected.id)}
          onToggleFavorite={() => toggleFavorite(selected.id)}
          onClose={closePanel}
          destinations={destinations}
          profile={profile}
          onProfileChange={setProfile}
          onAddDestination={(destination) =>
            setDestinations((current) =>
              current.some(({ id }) => id === destination.id)
                ? current
                : [...current, destination]
            )
          }
          onRemoveDestination={(id) =>
            setDestinations((current) =>
              current.filter((destination) => destination.id !== id)
            )
          }
        />
      )}

      <LearnMapbox />
    </div>
  )
}
