import { createContext, useContext } from 'react'

import type { LightPreset, MapStyle } from '../lib/basemap'
import type { Boundary } from '../lib/boundaries'
import type { Profile } from '../lib/directions'
import type { Bounds } from '../lib/listings-source'
import type { PriceRange } from '../lib/price'
import type { SearchedLocation } from '../lib/search'
import type { Listing, PropertyType } from '../types/listing'
import type { ViewMode } from '../types/view'

/*
 * App state is split three ways so a change re-renders only what reads it:
 * panning the map touches listings, not travel; adding a destination touches
 * travel, not the 500 markers. `AppProvider` nests the three.
 */

/** The listings, which of them are in view, and everything that narrows them. */
export interface ListingsState {
  /** Every listing, loaded once. */
  all: Listing[]
  /** In view and passing every filter. */
  visible: Listing[]
  /** The first `MARKER_CAP` of `visible`, which is all that is ever drawn. */
  rendered: Listing[]
  onBoundsChange: (bounds: Bounds) => void

  price: PriceRange
  setPrice: (range: PriceRange) => void
  /** Histogram bars, from listings passing every filter except price. */
  priceCounts: number[]
  priceOpen: boolean
  setPriceOpen: (open: boolean) => void
  beds: number | null
  setBeds: (beds: number | null) => void
  types: PropertyType[]
  toggleType: (type: PropertyType) => void
  /** How many of price, beds and type are narrowed from their defaults. */
  activeFilters: number

  /** Where the map should fly after a search that found no outline. */
  flyTo: SearchedLocation | null
  /** The searched area's outline; while set, listings are limited to it. */
  boundary: Boundary | null
  selectSearch: (location: SearchedLocation) => void
  clearSearch: () => void
  /** Limits listings to a shape drawn on the map, replacing any search area. */
  applyDrawnArea: (shape: GeoJSON.Polygon) => void
  /** Clears the search from the map's side, emptying the search field too. */
  removeBoundary: () => void
  /** Changes when the search field must be emptied from outside it. */
  searchKey: number
}

/**
 * What the viewer has chosen: the view and basemap, a listing, the listings
 * they have looked at, and their saved homes.
 */
export interface SelectionState {
  view: ViewMode
  setView: (view: ViewMode) => void
  /** The main map's basemap; kept here so it survives a trip to List view. */
  mapStyle: MapStyle
  setMapStyle: (style: MapStyle) => void
  lightPreset: LightPreset
  setLightPreset: (preset: LightPreset) => void
  selectedId: string | null
  /** The selected listing, from the full set rather than the rendered slice. */
  selected: Listing | null
  select: (id: string) => void
  /** Every listing selected this session, so their markers read as seen. */
  visited: Set<string>
  /** Selects from the sidebar, which in List view opens the full listing. */
  selectFromList: (id: string) => void
  closeCard: () => void
  /** Whether the full listing is open over everything else. */
  panelOpen: boolean
  openPanel: () => void
  closePanel: () => void
  favorites: Set<string>
  toggleFavorite: (id: string) => void
}

/** The viewer's own places, kept as they move from one listing to the next. */
export interface TravelState {
  destinations: SearchedLocation[]
  addDestination: (destination: SearchedLocation) => void
  removeDestination: (id: string) => void
  profile: Profile
  setProfile: (profile: Profile) => void
}

export const ListingsContext = createContext<ListingsState | null>(null)
export const SelectionContext = createContext<SelectionState | null>(null)
export const TravelContext = createContext<TravelState | null>(null)

function required<T>(value: T | null, name: string): T {
  if (!value) throw new Error(`${name} is only available inside AppProvider`)
  return value
}

export const useListings = () =>
  required(useContext(ListingsContext), 'useListings')
export const useSelection = () =>
  required(useContext(SelectionContext), 'useSelection')
export const useTravel = () => required(useContext(TravelContext), 'useTravel')
