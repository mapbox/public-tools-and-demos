import type { PropertyType } from '../../types/listing'
import BedsFilter from '../filters/BedsFilter'
import PriceFilter, { type PriceRange } from '../filters/PriceFilter'
import SavedIndicator from '../filters/SavedIndicator'
import TypeFilter from '../filters/TypeFilter'
import SearchBar, { type SearchedLocation } from './SearchBar'

const Divider = () => (
  <span className='h-[42px] w-px rounded-full bg-gray-200' />
)

export default function FilterBar({
  onSearchSelect,
  price,
  priceBounds,
  priceOpen,
  onPriceOpenChange,
  beds,
  onBedsChange,
  types,
  onToggleType,
  savedCount,
  resultCount,
  showResultCount
}: {
  onSearchSelect: (location: SearchedLocation) => void
  price: PriceRange
  priceBounds: PriceRange
  priceOpen: boolean
  onPriceOpenChange: (open: boolean) => void
  beds: number | null
  onBedsChange: (beds: number | null) => void
  types: PropertyType[]
  onToggleType: (type: PropertyType) => void
  savedCount: number
  resultCount: number
  showResultCount: boolean
}) {
  return (
    <div className='flex items-center gap-6'>
      <div className='min-w-[280px] max-w-[460px] flex-1'>
        <SearchBar onSelect={onSearchSelect} />
      </div>
      <Divider />
      <PriceFilter
        range={price}
        bounds={priceBounds}
        open={priceOpen}
        onOpenChange={onPriceOpenChange}
      />
      <BedsFilter value={beds} onChange={onBedsChange} />
      <TypeFilter selected={types} onToggle={onToggleType} />

      {/* Saved sits past the spacer, apart from the filter group, so it does
          not read as another filter. */}
      <div className='ml-auto flex items-center gap-4'>
        {showResultCount && (
          <p className='text-sm text-ink-muted'>{resultCount} results</p>
        )}
        <SavedIndicator count={savedCount} />
      </div>
    </div>
  )
}
