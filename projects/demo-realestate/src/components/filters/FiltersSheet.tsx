import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { useListings } from '../../state/contexts'
import BedsFilter from './BedsFilter'
import PriceFilter from './PriceFilter'
import TypeFilter from './TypeFilter'

/**
 * The phone's filters, in a sheet from the bottom (Figma `filters-mobile`).
 * Filters apply as they change, as on desktop, so the button only closes the
 * sheet; its count says what closing it will show.
 */
export default function FiltersSheet({ onClose }: { onClose: () => void }) {
  const {
    price,
    setPrice,
    priceCounts,
    beds,
    setBeds,
    types,
    toggleType,
    visible
  } = useListings()
  const doneRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    doneRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const count = visible.length

  // Portalled to the body, so it sits above the Learn Mapbox bar.
  return createPortal(
    <div className='fixed inset-0 z-[60] flex flex-col justify-end'>
      <div
        aria-hidden='true'
        onClick={onClose}
        className='absolute inset-0 bg-black/10'
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-label='Filters'
        className='relative flex max-h-[85%] flex-col gap-4 overflow-y-auto rounded-t-3xl bg-white px-4 pb-6 pt-4 shadow-[0px_-2px_3px_0px_rgba(0,0,0,0.06)]'
      >
        <PriceFilter
          inline
          range={price}
          counts={priceCounts}
          onChange={setPrice}
        />
        <BedsFilter value={beds} onChange={setBeds} />
        <TypeFilter selected={types} onToggle={toggleType} />
        <div className='pt-1.5'>
          <button
            ref={doneRef}
            type='button'
            onClick={onClose}
            className='flex min-h-[34px] w-full cursor-pointer items-center justify-center rounded-lg bg-surface-inverse px-4 py-3 text-base font-bold text-ink-inverse tabular-nums hover:bg-brand active:bg-[#004294] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
          >
            Show {count.toLocaleString()} {count === 1 ? 'home' : 'homes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
