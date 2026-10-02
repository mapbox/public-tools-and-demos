import { useCallback, useMemo, useState, type ReactNode } from 'react'

import type { Profile } from '../lib/directions'
import type { SearchedLocation } from '../lib/search'
import { TravelContext, type TravelState } from './contexts'

export default function TravelProvider({ children }: { children: ReactNode }) {
  const [destinations, setDestinations] = useState<SearchedLocation[]>([])
  const [profile, setProfile] = useState<Profile>('driving')

  const addDestination = useCallback(
    (destination: SearchedLocation) =>
      setDestinations((current) =>
        current.some(({ id }) => id === destination.id)
          ? current
          : [...current, destination]
      ),
    []
  )

  const removeDestination = useCallback(
    (id: string) =>
      setDestinations((current) =>
        current.filter((destination) => destination.id !== id)
      ),
    []
  )

  const value = useMemo<TravelState>(
    () => ({
      destinations,
      addDestination,
      removeDestination,
      profile,
      setProfile
    }),
    [destinations, addDestination, removeDestination, profile]
  )

  return (
    <TravelContext.Provider value={value}>{children}</TravelContext.Provider>
  )
}
