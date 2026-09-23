import { useEffect, useRef, useState } from 'react'
import type { SearchBoxSuggestion } from '@mapbox/search-js-core'
import clsx from 'clsx'

import closeIcon from '../../img/icons/close.svg'
import markerIcon from '../../img/icons/marker.svg'
import searchIcon from '../../img/icons/search.svg'
import { SEARCH_PROXIMITY, newSession, searchBox } from '../../lib/search'
import MaskIcon from '../ui/MaskIcon'

export interface SearchedLocation {
  center: [number, number]
  name: string
}

const MIN_QUERY_LENGTH = 3
const DEBOUNCE_MS = 250

export default function SearchBar({
  onSelect
}: {
  onSelect: (location: SearchedLocation) => void
}) {
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
    onSelect({ center: [longitude, latitude], name: suggestion.name })
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
      setOpen(false)
    }
  }

  const clear = () => {
    setValue('')
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div className='relative'>
      <div className='flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-4'>
        <span className='flex shrink-0 items-center rounded-full border border-gray-200 p-1.5 text-ink-muted'>
          <MaskIcon src={searchIcon} />
        </span>
        <input
          type='text'
          role='combobox'
          aria-expanded={open}
          aria-controls='location-suggestions'
          aria-autocomplete='list'
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder='Search an address, neighborhood, or ZIP'
          aria-label='Search an address, neighborhood, or ZIP'
          className='min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-line-strong'
        />
        <button
          type='button'
          onClick={clear}
          aria-label='Clear search'
          className={clsx(
            'flex shrink-0 cursor-pointer items-center rounded-full bg-surface-sunken p-1 text-ink-muted transition-opacity',
            value ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          <MaskIcon src={closeIcon} size={16} />
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul
          id='location-suggestions'
          role='listbox'
          className='absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-[0px_3px_10px_0px_rgba(0,0,0,0.15)]'
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.mapbox_id} role='none'>
              <button
                type='button'
                role='option'
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void choose(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={clsx(
                  'flex w-full cursor-pointer items-start gap-2 px-4 py-2 text-left',
                  index === activeIndex && 'bg-surface-sunken'
                )}
              >
                <MaskIcon src={markerIcon} className='mt-0.5 text-ink-muted' />
                <span className='min-w-0'>
                  <span className='block truncate text-sm text-ink'>
                    {suggestion.name}
                  </span>
                  {suggestion.place_formatted && (
                    <span className='block truncate text-xs text-ink-muted'>
                      {suggestion.place_formatted}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
