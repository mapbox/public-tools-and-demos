import { useEffect, useRef, useState } from 'react'
import type { SearchBoxSuggestion } from '@mapbox/search-js-core'

import {
  SEARCH_PROXIMITY,
  newSession,
  searchBox,
  type SearchedLocation
} from '../../lib/search'

const MIN_QUERY_LENGTH = 3
const DEBOUNCE_MS = 250

/**
 * The Search Box two-step flow shared by the filter-row search and the full
 * listing's destination search: `suggest` as you type, debounced and
 * cancellable, then `retrieve` on selection for the coordinates. Both calls
 * share a session token, renewed after each selection.
 */
export function useLocationSearch(
  onSelect: (location: SearchedLocation) => void
) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<SearchBoxSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const sessionRef = useRef(newSession())
  const abortRef = useRef<AbortController | null>(null)
  // Set while applying a selection, so echoing the chosen name back into the
  // input does not immediately trigger a fresh suggest for that same text.
  const skipNextQuery = useRef(false)

  useEffect(() => {
    if (skipNextQuery.current) {
      skipNextQuery.current = false
      return
    }

    const query = value.trim()
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const response = await searchBox.suggest(query, {
          sessionToken: sessionRef.current,
          signal: controller.signal,
          proximity: SEARCH_PROXIMITY,
          limit: 5
        })
        setSuggestions(response.suggestions)
        setActiveIndex(-1)
        setOpen(true)
      } catch {
        // An aborted request is the expected outcome of typing another key.
        if (!controller.signal.aborted) setSuggestions([])
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [value])

  const choose = async (suggestion: SearchBoxSuggestion) => {
    setOpen(false)
    skipNextQuery.current = true
    setValue(suggestion.name)

    const { features } = await searchBox.retrieve(suggestion, {
      sessionToken: sessionRef.current
    })
    sessionRef.current = newSession()

    const [longitude, latitude] = features[0]?.geometry.coordinates ?? []
    if (longitude === undefined || latitude === undefined) return
    onSelect({
      center: [longitude, latitude],
      name: suggestion.name,
      id: suggestion.mapbox_id,
      place: suggestion.place_formatted
    })
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex(
        (current) => (current + step + suggestions.length) % suggestions.length
      )
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      void choose(suggestions[activeIndex])
    } else if (event.key === 'Escape') {
      // Only the list closes; the dialog around a destination search must not.
      event.stopPropagation()
      setOpen(false)
    }
  }

  const clear = () => {
    setValue('')
    setSuggestions([])
    setOpen(false)
  }

  return {
    value,
    setValue,
    suggestions,
    open,
    setOpen,
    activeIndex,
    setActiveIndex,
    choose,
    onKeyDown,
    clear
  }
}
