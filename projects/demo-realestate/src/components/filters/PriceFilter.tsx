import { useEffect, useRef, useState } from 'react'

import chevronDown from '../../img/icons/chevron-down.svg'
import { formatPriceShort } from '../../lib/format'
import {
  FULL_RANGE,
  PRICE_CEILING,
  isUncapped,
  type PriceRange
} from '../../lib/price'
import MaskIcon from '../ui/MaskIcon'
import PriceHistogram from './PriceHistogram'

const describe = (range: PriceRange) => {
  const atFloor = range.min <= FULL_RANGE.min
  if (atFloor && isUncapped(range)) return 'Any price'
  if (atFloor) return `Up to ${formatPriceShort(range.max)}`
  if (isUncapped(range)) return `${formatPriceShort(range.min)}+`
  return `${formatPriceShort(range.min)} – ${formatPriceShort(range.max)}`
}

export default function PriceFilter({
  range,
  counts,
  open,
  onOpenChange,
  onChange
}: {
  range: PriceRange
  counts: number[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (range: PriceRange) => void
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  // The slider, the bars and the pill label track this while dragging. The
  // committed range only changes on release, so the map and the listing counts
  // are not recomputed on every step.
  const [draft, setDraft] = useState(range)
  useEffect(() => setDraft(range), [range])

  const active = draft.min > FULL_RANGE.min || !isUncapped(draft)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node))
        onOpenChange(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  return (
    <div ref={wrapperRef} className='relative'>
      <button
        type='button'
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium tabular-nums ${
          active
            ? 'border-line bg-brand-wash/20 text-ink'
            : 'border-gray-200 bg-surface text-ink-muted hover:bg-surface-sunken'
        } ${
          // While the panel is open the label changes on every drag step. The
          // search bar beside it is flex-1, so any width change pulls this pill
          // sideways and the panel anchored to it stutters along. Pinning the
          // width for the duration holds everything still; closed, it stays snug.
          open ? 'min-w-[172px]' : ''
        }`}
      >
        {describe(draft)}
        <MaskIcon src={chevronDown} size={18} />
      </button>

      {open && (
        <div className='absolute left-0 top-full z-40 mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-[0px_3px_10px_0px_rgba(0,0,0,0.15)]'>
          <PriceHistogram
            counts={counts}
            range={draft}
            onChange={setDraft}
            onCommit={() => onChange(draft)}
          />
          <div className='mt-3 flex items-center justify-between'>
            <button
              type='button'
              onClick={() => {
                setDraft(FULL_RANGE)
                onChange(FULL_RANGE)
              }}
              disabled={!active}
              className='cursor-pointer text-sm font-medium text-ink-muted hover:text-ink disabled:cursor-default disabled:opacity-40'
            >
              Reset
            </button>
            <p className='text-xs text-ink-muted'>
              Prices above {formatPriceShort(PRICE_CEILING)} are grouped
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
