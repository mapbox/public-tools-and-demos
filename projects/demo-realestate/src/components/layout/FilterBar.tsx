import { useCallback, useState } from 'react'
import clsx from 'clsx'

import chevronDown from '../../img/icons/chevron-down.svg'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useListings, useSelection } from '../../state/contexts'
import BedsFilter from '../filters/BedsFilter'
import FiltersSheet from '../filters/FiltersSheet'
import PriceFilter from '../filters/PriceFilter'
import SavedIndicator from '../filters/SavedIndicator'
import TypeFilter from '../filters/TypeFilter'
import MaskIcon from '../ui/MaskIcon'
import SearchBar from './SearchBar'

/** `stretch` matches the height of the row rather than the desktop bar. */
const Divider = ({ stretch = false }: { stretch?: boolean }) => (
  <span
    className={clsx(
      'w-px rounded-full bg-gray-200',
      stretch ? 'self-stretch' : 'h-[42px]'
    )}
  />
)

export default function FilterBar() {
  const {
    selectSearch,
    clearSearch,
    searchKey,
    price,
    setPrice,
    priceCounts,
    priceOpen,
    setPriceOpen,
    beds,
    setBeds,
    types,
    toggleType,
    activeFilters,
    visible
  } = useListings()
  const { view, favorites } = useSelection()
  const isMobile = useIsMobile()
  const [sheetOpen, setSheetOpen] = useState(false)
  const closeSheet = useCallback(() => setSheetOpen(false), [])

  const search = (
    <SearchBar key={searchKey} onSelect={selectSearch} onClear={clearSearch} />
  )

  // A phone has room for search and two pills: the filters move into a sheet
  // (Figma `filters-mobile`), and Saved keeps its place beside them.
  if (isMobile) {
    return (
      <div className='flex flex-col gap-3 border-b border-line px-4 py-3'>
        {search}
        <div className='flex items-center gap-3'>
          <button
            type='button'
            aria-haspopup='dialog'
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen(true)}
            className={clsx(
              'flex cursor-pointer items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium tabular-nums',
              activeFilters > 0
                ? 'border-line bg-brand-wash/20 text-ink'
                : 'border-gray-200 bg-surface text-ink-muted'
            )}
          >
            {activeFilters > 0 ? `Filters (${activeFilters})` : 'Filters'}
            <MaskIcon src={chevronDown} size={18} />
          </button>
          <Divider stretch />
          <SavedIndicator count={favorites.size} />
        </div>
        {sheetOpen && <FiltersSheet onClose={closeSheet} />}
      </div>
    )
  }

  return (
    <div className='flex items-center gap-6'>
      <div className='min-w-[280px] max-w-[460px] flex-1'>{search}</div>
      <Divider />
      <PriceFilter
        range={price}
        counts={priceCounts}
        open={priceOpen}
        onOpenChange={setPriceOpen}
        onChange={setPrice}
      />
      <BedsFilter value={beds} onChange={setBeds} />
      <TypeFilter selected={types} onToggle={toggleType} />

      {/* Saved sits past the spacer, apart from the filter group, so it does
          not read as another filter. */}
      <div className='ml-auto flex items-center gap-4'>
        {view === 'map' && (
          <p className='text-sm text-ink-muted'>{visible.length} results</p>
        )}
        <SavedIndicator count={favorites.size} />
      </div>
    </div>
  )
}
