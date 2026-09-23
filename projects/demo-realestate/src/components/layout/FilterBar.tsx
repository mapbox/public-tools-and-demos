import type { PropertyType } from '../../types/listing'
import BedsFilter from '../filters/BedsFilter'
import PriceFilter, { type PriceRange } from '../filters/PriceFilter'
import TypeFilter from '../filters/TypeFilter'

const Divider = () => (
  <span className='w-px self-stretch rounded-full bg-gray-200' />
)

export default function FilterBar({
  price,
  priceBounds,
  priceOpen,
  onPriceOpenChange,
  beds,
  onBedsChange,
  types,
  onToggleType,
  resultCount,
  showResultCount
}: {
  price: PriceRange
  priceBounds: PriceRange
  priceOpen: boolean
  onPriceOpenChange: (open: boolean) => void
  beds: number | null
  onBedsChange: (beds: number | null) => void
  types: PropertyType[]
  onToggleType: (type: PropertyType) => void
  resultCount: number
  showResultCount: boolean
}) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-6'>
        <PriceFilter
          range={price}
          bounds={priceBounds}
          open={priceOpen}
          onOpenChange={onPriceOpenChange}
        />
        <Divider />
        <BedsFilter value={beds} onChange={onBedsChange} />
        <Divider />
        <TypeFilter selected={types} onToggle={onToggleType} />
      </div>
      {showResultCount && (
        <p className='text-sm text-ink-muted'>{resultCount} results</p>
      )}
    </div>
  )
}
