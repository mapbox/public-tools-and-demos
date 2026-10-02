import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { useIsMobile } from '../hooks/useIsMobile'
import type { LightPreset, MapStyle } from '../lib/basemap'
import type { ViewMode } from '../types/view'
import { SelectionContext, useListings, type SelectionState } from './contexts'

/** Sits inside `ListingsProvider`, which it reads the selected listing from. */
export default function SelectionProvider({
  children
}: {
  children: ReactNode
}) {
  const { all } = useListings()
  const [chosenView, setView] = useState<ViewMode>('split')
  // A phone has no room for Split, so it shows the map instead. The choice is
  // kept, and Split comes back if the window widens again.
  const isMobile = useIsMobile()
  const view = isMobile && chosenView === 'split' ? 'map' : chosenView
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard')
  const [lightPreset, setLightPreset] = useState<LightPreset>('day')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [panelOpen, setPanelOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Looked up from the full set, not the rendered slice, so the card stays open
  // when a pan pushes its listing past the marker cap.
  const selected = useMemo(
    () => all.find((listing) => listing.id === selectedId) ?? null,
    [all, selectedId]
  )

  // Selecting from anywhere, a marker or a sidebar card, counts as a visit.
  const select = useCallback((id: string) => {
    setSelectedId(id)
    setVisited((current) =>
      current.has(id) ? current : new Set(current).add(id)
    )
  }, [])

  // List view has no map for the small card to float over, so choosing a
  // listing there goes straight to the full listing.
  const selectFromList = useCallback(
    (id: string) => {
      select(id)
      if (view === 'list') setPanelOpen(true)
    },
    [select, view]
  )

  const closeCard = useCallback(() => setSelectedId(null), [])
  const openPanel = useCallback(() => setPanelOpen(true), [])
  const closePanel = useCallback(() => setPanelOpen(false), [])

  const toggleFavorite = useCallback(
    (id: string) =>
      setFavorites((current) => {
        const next = new Set(current)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      }),
    []
  )

  const value = useMemo<SelectionState>(
    () => ({
      view,
      setView,
      mapStyle,
      setMapStyle,
      lightPreset,
      setLightPreset,
      selectedId,
      selected,
      select,
      visited,
      selectFromList,
      closeCard,
      panelOpen,
      openPanel,
      closePanel,
      favorites,
      toggleFavorite
    }),
    [
      view,
      mapStyle,
      lightPreset,
      selectedId,
      selected,
      select,
      visited,
      selectFromList,
      closeCard,
      panelOpen,
      openPanel,
      closePanel,
      favorites,
      toggleFavorite
    ]
  )

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  )
}
