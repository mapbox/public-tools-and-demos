import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'

import { MARKER_CAP } from '../components/map/labelSelection'
import {
  contains,
  fetchBoundary,
  isArea,
  type Boundary
} from '../lib/boundaries'
import { loadListings, withinBounds, type Bounds } from '../lib/listings-source'
import {
  FULL_RANGE,
  bucketPrices,
  isUncapped,
  matchesPrice,
  type PriceRange
} from '../lib/price'
import type { SearchedLocation } from '../lib/search'
import type { Listing, PropertyType } from '../types/listing'
import { ListingsContext, type ListingsState } from './contexts'

const ALL_TYPES: PropertyType[] = ['house', 'multi-family', 'townhouse']

export default function ListingsProvider({
  children
}: {
  children: ReactNode
}) {
  const [all, setAll] = useState<Listing[]>([])
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [flyTo, setFlyTo] = useState<SearchedLocation | null>(null)
  const [boundary, setBoundary] = useState<Boundary | null>(null)
  // Only the latest search may apply its result; an earlier, slower boundary
  // lookup arriving afterwards is ignored.
  const searchRef = useRef(0)
  const [searchKey, setSearchKey] = useState(0)
  const [price, setPrice] = useState<PriceRange>(FULL_RANGE)
  const [priceOpen, setPriceOpen] = useState(false)
  const [beds, setBeds] = useState<number | null>(null)
  const [types, setTypes] = useState<PropertyType[]>(ALL_TYPES)

  useEffect(() => {
    loadListings().then(setAll)
  }, [])

  // Worked out once per boundary rather than on every pan: a point-in-polygon
  // test against a 1,000+ vertex outline is the most expensive filter here.
  const insideBoundary = useMemo(
    () =>
      boundary &&
      new Set(
        all
          .filter((listing) => contains(boundary, listing.coordinates))
          .map((listing) => listing.id)
      ),
    [all, boundary]
  )

  // Everything in view that passes every filter except price. The histogram is
  // drawn from this, so its bars stay put while the price handles move.
  const priceFacet = useMemo(() => {
    if (!bounds) return []
    return all.filter((listing) => {
      if (!withinBounds(listing, bounds)) return false
      if (insideBoundary && !insideBoundary.has(listing.id)) return false
      if (beds !== null && listing.beds < beds) return false
      // The few listings with no property type pass every type filter.
      return listing.type === undefined || types.includes(listing.type)
    })
  }, [all, bounds, insideBoundary, beds, types])

  const priceCounts = useMemo(() => bucketPrices(priceFacet), [priceFacet])

  const visible = useMemo(
    () => priceFacet.filter((listing) => matchesPrice(listing.price, price)),
    [priceFacet, price]
  )

  // Only this many are ever drawn; 500 DOM markers pan at 60fps, 1000 does not.
  const rendered = useMemo(() => visible.slice(0, MARKER_CAP), [visible])

  // Searching an area (a city, a county) outlines it and limits listings to
  // it, as on Zillow. Anything else, or an area the boundaries endpoint does
  // not cover, just moves the map there.
  const selectSearch = useCallback(async (location: SearchedLocation) => {
    const request = ++searchRef.current
    setBoundary(null)
    const found = isArea(location) ? await fetchBoundary(location) : null
    if (request !== searchRef.current) return
    if (found) setBoundary(found)
    else setFlyTo(location)
  }, [])

  const clearSearch = useCallback(() => {
    searchRef.current += 1
    setBoundary(null)
  }, [])

  // Bumping the key remounts, and so empties, the search field, keeping it in
  // step with the map.
  const removeBoundary = useCallback(() => {
    clearSearch()
    setSearchKey((key) => key + 1)
  }, [clearSearch])

  const toggleType = useCallback(
    (type: PropertyType) =>
      setTypes((current) =>
        current.includes(type)
          ? current.filter((value) => value !== type)
          : [...current, type]
      ),
    []
  )

  const activeFilters = [
    price.min > FULL_RANGE.min || !isUncapped(price),
    beds !== null,
    types.length < ALL_TYPES.length
  ].filter(Boolean).length

  const value = useMemo<ListingsState>(
    () => ({
      all,
      visible,
      rendered,
      onBoundsChange: setBounds,
      price,
      setPrice,
      priceCounts,
      priceOpen,
      setPriceOpen,
      beds,
      setBeds,
      types,
      toggleType,
      activeFilters,
      flyTo,
      boundary,
      selectSearch,
      clearSearch,
      removeBoundary,
      searchKey
    }),
    [
      all,
      visible,
      rendered,
      price,
      priceCounts,
      priceOpen,
      beds,
      types,
      toggleType,
      activeFilters,
      flyTo,
      boundary,
      selectSearch,
      clearSearch,
      removeBoundary,
      searchKey
    ]
  )

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  )
}
