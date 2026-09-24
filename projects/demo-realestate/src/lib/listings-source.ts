import type { Listing } from '../types/listing'

interface ListingFeature {
  geometry: { coordinates: [number, number] }
  properties: Omit<Listing, 'id' | 'coordinates'> & { id: string }
}

/**
 * The whole King County dataset is ~763KB gzipped, so it is fetched once and
 * queried in memory. Every viewport change is a bounds test over an array,
 * which is far cheaper than re-requesting per view.
 */
let cache: Promise<Listing[]> | null = null

// vite.config sets `base` without a trailing slash, so BASE_URL needs
// normalising. Getting this wrong is quiet in dev: the SPA fallback answers an
// unknown path with index.html and a 200, so it surfaces as a JSON parse error
// rather than a 404.
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')

export const loadListings = (): Promise<Listing[]> => {
  cache ??= fetch(`${base}data/listings.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`listings.json: ${response.status}`)
      return response.json()
    })
    .then((collection: { features: ListingFeature[] }) => {
      // Ids must be unique: markers are tracked in a Map keyed by id, so a
      // repeat silently overwrites the entry and strands the previous marker
      // on the map forever. The source data is sales records, where one
      // property can appear several times, so this is enforced at the boundary
      // rather than trusted.
      const byId = new Map<string, Listing>()
      for (const feature of collection.features) {
        byId.set(feature.properties.id, {
          ...feature.properties,
          coordinates: feature.geometry.coordinates
        })
      }
      return [...byId.values()]
    })
  return cache
}

export interface Bounds {
  west: number
  south: number
  east: number
  north: number
}

export const withinBounds = (listing: Listing, bounds: Bounds) => {
  const [lng, lat] = listing.coordinates
  return (
    lng >= bounds.west &&
    lng <= bounds.east &&
    lat >= bounds.south &&
    lat <= bounds.north
  )
}
