import type { CSSProperties } from 'react'
import clsx from 'clsx'

import heartActive from '../../img/icons/heart-active.svg'
import labelTail from '../../img/pins/label-tail.svg'
import { formatPriceShort } from '../../lib/format'
import type { Listing } from '../../types/listing'
import type { MarkerVariant } from './labelSelection'

/**
 * Dots and labels share one colour system: near-black by default, brand blue
 * when selected. Property type is not encoded here — the type filter chips
 * already carry it, and having labels show state while dots showed type meant
 * two markers for the same listing looked unrelated.
 *
 * Blue is reserved for selection rather than used as the default: at several
 * hundred markers a blue field dominates the basemap, while near-black recedes
 * and lets the one selected listing stand out.
 */
/**
 * `fill` paints the bubble and the dot; `ink` feeds the tail, which is a mask
 * and so takes its colour from `currentColor`. They are kept in one object so
 * the tail cannot end up disagreeing with the bubble it hangs off.
 */
const SELECTED = { fill: 'bg-brand', ink: 'text-brand' }
const DEFAULT = { fill: 'bg-surface-inverse', ink: 'text-surface-inverse' }

export default function ListingMarker({
  listing,
  variant,
  selected,
  favorited,
  onSelect
}: {
  listing: Listing
  variant: MarkerVariant
  selected: boolean
  favorited: boolean
  onSelect: () => void
}) {
  const label = `${
    listing.address ?? formatPriceShort(listing.price)
  }, ${formatPriceShort(listing.price)}${favorited ? ', saved' : ''}`

  const tone = selected ? SELECTED : DEFAULT

  if (variant === 'dot') {
    return (
      <button
        type='button'
        onClick={onSelect}
        aria-label={label}
        className={clsx(
          'size-2.5 cursor-pointer rounded-full border-2 border-white shadow-[0_1px_2px_rgba(0,0,0,0.35)]',
          tone.fill
        )}
      />
    )
  }

  return (
    <button
      type='button'
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={label}
      className={clsx('flex cursor-pointer flex-col items-center', tone.ink)}
    >
      <span
        className={clsx(
          'flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium leading-none text-white',
          tone.fill
        )}
      >
        {favorited && <img src={heartActive} alt='' width={11} height={11} />}
        {formatPriceShort(listing.price)}
      </span>
      {/* Figma wraps this polygon in scaleY(-1): the exported asset points up,
          and the design flips it so it aims down at the property. */}
      <span
        className='mask-icon -mt-px -scale-y-100'
        style={
          {
            width: '13px',
            height: '8.9px',
            '--mask-url': `url("${labelTail}")`
          } as CSSProperties
        }
      />
    </button>
  )
}
