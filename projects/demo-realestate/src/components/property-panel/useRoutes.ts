import { useEffect, useState } from 'react'

import { fetchRoute, type Profile, type Route } from '../../lib/directions'
import type { SearchedLocation } from '../../lib/search'

export type RouteState =
  | { status: 'loading' }
  | { status: 'ready'; route: Route }
  /** The Directions API found no route for this profile. */
  | { status: 'none' }
  | { status: 'error' }

const keyFor = (profile: Profile, id: string) => `${profile}:${id}`

/**
 * A route from the home to every destination under the current profile. The
 * caller keys its component by listing, so the home never changes underneath;
 * results for other profiles are kept, and fetchRoute caches the requests too,
 * so switching back to a profile is instant.
 */
export function useRoutes(
  home: [number, number],
  destinations: SearchedLocation[],
  profile: Profile
) {
  const [results, setResults] = useState<Record<string, RouteState>>({})

  useEffect(() => {
    let cancelled = false
    for (const destination of destinations) {
      const key = keyFor(profile, destination.id)
      setResults((current) =>
        current[key] ? current : { ...current, [key]: { status: 'loading' } }
      )
      fetchRoute(profile, home, destination.center).then(
        (route): void => {
          if (cancelled) return
          setResults((current) => ({
            ...current,
            [key]: route ? { status: 'ready', route } : { status: 'none' }
          }))
        },
        () => {
          if (cancelled) return
          setResults((current) => ({ ...current, [key]: { status: 'error' } }))
        }
      )
    }
    return () => {
      cancelled = true
    }
  }, [home, destinations, profile])

  return new Map(
    destinations.map((destination): [string, RouteState] => [
      destination.id,
      results[keyFor(profile, destination.id)] ?? { status: 'loading' }
    ])
  )
}
