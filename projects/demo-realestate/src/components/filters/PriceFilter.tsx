import chevronDown from '../../img/icons/chevron-down.svg'
import { formatPriceShort } from '../../lib/format'
import MaskIcon from '../ui/MaskIcon'

export interface PriceRange {
  min: number
  max: number
}

export default function PriceFilter({
  range,
  bounds,
  open,
  onOpenChange
}: {
  range: PriceRange
  bounds: PriceRange
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isAnyPrice = range.min <= bounds.min && range.max >= bounds.max
  const label = isAnyPrice
    ? 'Any price'
    : `${formatPriceShort(range.min)} – ${formatPriceShort(range.max)}`

  return (
    <button
      type='button'
      aria-expanded={open}
      onClick={() => onOpenChange(!open)}
      className='flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-surface px-4 py-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken'
    >
      {label}
      <MaskIcon src={chevronDown} size={18} />
    </button>
  )
}
