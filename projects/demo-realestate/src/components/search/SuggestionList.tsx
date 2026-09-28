import type { SearchBoxSuggestion } from '@mapbox/search-js-core'
import clsx from 'clsx'

import markerIcon from '../../img/icons/marker.svg'
import MaskIcon from '../ui/MaskIcon'

export default function SuggestionList({
  id,
  suggestions,
  activeIndex,
  onChoose,
  onHover
}: {
  id: string
  suggestions: SearchBoxSuggestion[]
  activeIndex: number
  onChoose: (suggestion: SearchBoxSuggestion) => void
  onHover: (index: number) => void
}) {
  return (
    <ul
      id={id}
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
            onClick={() => onChoose(suggestion)}
            onMouseEnter={() => onHover(index)}
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
  )
}
