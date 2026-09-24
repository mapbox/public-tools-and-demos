import type { CSSProperties } from 'react'
import clsx from 'clsx'

import heartActive from '../../img/icons/heart-active.svg'
import labelTail from '../../img/pins/label-tail.svg'
import { formatPriceShort } from '../../lib/format'
import type { Listing, PropertyType } from '../../types/listing'
import type { MarkerVariant } from './labelSelection'

const DOT_COLOR: Record<PropertyType, string> = {
  house: 'bg-house',
  'multi-family': 'bg-multifamily',
  townhouse: 'bg-townhouse'
}

/** Dataset listings have no property type; neutral is honest, not a guess. */
const NEUTRAL_DOT = 'bg-surface-inverse'

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

  if (variant === 'dot') {
    return (
      <button
        type='button'
        onClick={onSelect}
        aria-label={label}
        className={clsx(
          'size-2.5 cursor-pointer rounded-full border-2 border-white shadow-[0_1px_2px_rgba(0,0,0,0.35)]',
          selected
            ? 'bg-brand'
            : listing.type
            ? DOT_COLOR[listing.type]
            : NEUTRAL_DOT
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
      className={clsx(
        'flex cursor-pointer flex-col items-center',
        selected ? 'text-brand' : 'text-surface-inverse'
      )}
    >
      <span
        className={clsx(
          'flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium leading-none text-white',
          selected ? 'bg-brand' : 'bg-surface-inverse'
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
