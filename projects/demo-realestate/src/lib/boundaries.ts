import accessToken from './mapbox'
import type { SearchedLocation } from './search'

/**
 * Place boundaries by Mapbox ID, from a beta endpoint built by the Search team:
 * a Geocoding v6 feature lookup that returns the area's polygon rather than a
 * point. It takes the same `mapbox_id` as every Search Box and Geocoding
 * result, so a search suggestion can be turned straight into a boundary.
 *
 * Beta coverage (checked September 2026): cities (`place`) and counties
 * (`district`) return a polygon; neighbourhoods, localities and postcodes
 * return 404. Every area type is still asked, so those start working as soon
 * as the endpoint covers them; a 404 just means the search falls back to
 * flying to the place.
 *
 * This is an ephemeral environment, not a production API: if it goes away,
 * every lookup fails and search behaves exactly as it did before boundaries.
 */
const ENDPOINT =
  'https://api-geocoder-ephemeral.tilestream.net/search/geocode/v6/features'
const EPHEMERAL_ENV = 'geojson-by-id-d44f4b'

/** Search Box feature types that describe an area rather than a point. */
const AREA_TYPES = new Set([
  'country',
  'region',
  'district',
  'place',
  'locality',
  'neighborhood',
  'postcode'
])

export const isArea = (location: SearchedLocation) =>
  location.featureType !== undefined && AREA_TYPES.has(location.featureType)

type Ring = [number, number][]
type Area = GeoJSON.Polygon | GeoJSON.MultiPolygon

export interface Boundary {
  id: string
  name: string
  geometry: Area
  /** [west, south, east, north], computed: the endpoint does not return one. */
  bbox: [number, number, number, number]
}

const polygonsOf = (geometry: Area) =>
  (geometry.type === 'Polygon'
    ? [geometry.coordinates]
    : geometry.coordinates) as Ring[][]

const bboxOf = (geometry: Area): Boundary['bbox'] => {
  let [west, south, east, north] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const polygon of polygonsOf(geometry)) {
    for (const [lng, lat] of polygon[0]) {
      west = Math.min(west, lng)
      east = Math.max(east, lng)
      south = Math.min(south, lat)
      north = Math.max(north, lat)
    }
  }
  return [west, south, east, north]
}

/** A shape drawn on the map, in the same form as a searched area's outline. */
export const drawnBoundary = (geometry: GeoJSON.Polygon): Boundary => ({
  id: 'drawn',
  name: 'Drawn area',
  geometry,
  bbox: bboxOf(geometry)
})

const cache = new Map<string, Promise<Boundary | null>>()

/** The area's boundary, or null when the endpoint has none for it. */
export const fetchBoundary = (
  location: SearchedLocation
): Promise<Boundary | null> => {
  const cached = cache.get(location.id)
  if (cached) return cached

  const request = fetch(
    `${ENDPOINT}/${location.id}?resolution=high` +
      `&ephemeral_env=${EPHEMERAL_ENV}&access_token=${accessToken}`
  )
    .then((response) => (response.ok ? response.json() : null))
    .then((feature: GeoJSON.Feature | null) => {
      const geometry = feature?.geometry
      if (geometry?.type !== 'Polygon' && geometry?.type !== 'MultiPolygon') {
        return null
      }
      return {
        id: location.id,
        name: location.name,
        geometry,
        bbox: bboxOf(geometry)
      }
    })
    // A beta endpoint can simply be down; that is the same as no boundary.
    .catch(() => null)

  cache.set(location.id, request)
  return request
}

/** Even-odd ray casting against one ring. */
const inRing = (ring: Ring, [x, y]: [number, number]) => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

/**
 * Whether a point is inside the boundary: in some polygon's outer ring and in
 * none of its holes. The bbox test first rejects nearly every listing cheaply.
 */
export const contains = (boundary: Boundary, point: [number, number]) => {
  const [west, south, east, north] = boundary.bbox
  const [lng, lat] = point
  if (lng < west || lng > east || lat < south || lat > north) return false
  return polygonsOf(boundary.geometry).some(
    ([outer, ...holes]) =>
      inRing(outer, point) && !holes.some((hole) => inRing(hole, point))
  )
}
