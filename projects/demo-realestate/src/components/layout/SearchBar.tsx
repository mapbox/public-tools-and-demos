import clsx from 'clsx'

import closeIcon from '../../img/icons/close.svg'
import searchIcon from '../../img/icons/search.svg'
import type { SearchedLocation } from '../../lib/search'
import SuggestionList from '../search/SuggestionList'
import { useLocationSearch } from '../search/useLocationSearch'
import MaskIcon from '../ui/MaskIcon'

export default function SearchBar({
  onSelect,
  onClear
}: {
  onSelect: (location: SearchedLocation) => void
  /** Clearing the field also drops any searched area's boundary. */
  onClear: () => void
}) {
  const {
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
  } = useLocationSearch(onSelect)

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
          placeholder='Try Bellevue or Sammamish'
          aria-label='Search a city, address or ZIP code'
          className='min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-line-strong'
        />
        <button
          type='button'
          onClick={() => {
            clear()
            onClear()
          }}
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
        <SuggestionList
          id='location-suggestions'
          suggestions={suggestions}
          activeIndex={activeIndex}
          onChoose={(suggestion) => void choose(suggestion)}
          onHover={setActiveIndex}
        />
      )}
    </div>
  )
}
