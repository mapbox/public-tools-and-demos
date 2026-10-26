import accessToken from './mapbox'

export type Profile = 'driving' | 'walking' | 'cycling'

export const PROFILES: { id: Profile; label: string }[] = [
  { id: 'driving', label: 'Drive' },
  { id: 'walking', label: 'Walk' },
  { id: 'cycling', label: 'Bike' }
]

/**
 * Driving uses `driving-traffic`, so drive times reflect current traffic
 * rather than free-flow speeds, which is what someone weighing a commute
 * actually wants to know.
 */
const API_PROFILE: Record<Profile, string> = {
  driving: 'mapbox/driving-traffic',
  walking: 'mapbox/walking',
  cycling: 'mapbox/cycling'
}

export interface Route {
  /** Seconds. */
  duration: number
  /** Metres. */
  distance: number
  geometry: GeoJSON.LineString
}

// Keyed by profile and both ends, so flipping between profiles, or reopening a
// listing, reuses what was already fetched instead of requesting it again.
const cache = new Map<string, Promise<Route | null>>()

/**
 * One Directions API request from the home to a destination. Resolves to null
 * when there is no route for the profile, such as walking across open water.
 */
export const fetchRoute = (
  profile: Profile,
  [fromLng, fromLat]: [number, number],
  [toLng, toLat]: [number, number]
): Promise<Route | null> => {
  const key = `${profile}:${fromLng},${fromLat};${toLng},${toLat}`
  const cached = cache.get(key)
  if (cached) return cached

  const request = fetch(
    `https://api.mapbox.com/directions/v5/${API_PROFILE[profile]}/` +
      `${fromLng},${fromLat};${toLng},${toLat}` +
      `?geometries=geojson&overview=full&access_token=${accessToken}`
  )
    .then((response) => {
      if (!response.ok) throw new Error(`Directions: ${response.status}`)
      return response.json()
    })
    .then((body: { routes?: Route[] }) => {
      const [route] = body.routes ?? []
      return route
        ? {
            duration: route.duration,
            distance: route.distance,
            geometry: route.geometry
          }
        : null
    })

  // A failed request is dropped from the cache so the next attempt retries.
  request.catch(() => cache.delete(key))
  cache.set(key, request)
  return request
}

export const formatDuration = (seconds: number) => {
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`
}

const METRES_PER_MILE = 1609.344

export const formatDistance = (metres: number) => {
  const miles = metres / METRES_PER_MILE
  return `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`
}
