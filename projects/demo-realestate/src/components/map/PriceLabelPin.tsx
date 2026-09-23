import type { CSSProperties } from 'react'
import clsx from 'clsx'

import labelTail from '../../img/pins/label-tail.svg'
import pinCondo from '../../img/pins/pin-condo.svg'
import pinHouse from '../../img/pins/pin-house.svg'
import pinTownhouse from '../../img/pins/pin-townhouse.svg'
import { formatPriceShort } from '../../lib/format'
import type { Listing, PropertyType } from '../../types/listing'

const PIN_ICON: Record<PropertyType, string> = {
  house: pinHouse,
  condo: pinCondo,
  townhouse: pinTownhouse
}

/** Unselected labels are neutral; selecting one tints it with the type colour. */
const LABEL_BG: Record<PropertyType, string> = {
  house: 'bg-house',
  condo: 'bg-accent-dark',
  townhouse: 'bg-success-dark'
}

/** The tail is masked, so it takes its fill from `currentColor`. */
const TAIL_FG: Record<PropertyType, string> = {
  house: 'text-house',
  condo: 'text-accent-dark',
  townhouse: 'text-success-dark'
}

export default function PriceLabelPin({
  listing,
  selected,
  onSelect
}: {
  listing: Listing
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${listing.name}, ${formatPriceShort(listing.price)}`}
      className='flex cursor-pointer flex-col items-center gap-2'
    >
      <span
        className={clsx(
          'flex flex-col items-center drop-shadow-[0px_0px_1.2px_rgba(0,0,0,0.18)]',
          selected ? TAIL_FG[listing.type] : 'text-surface-inverse'
        )}
      >
        <span
          className={clsx(
            'rounded-lg px-3.5 py-2.5 text-xl font-medium leading-none text-white',
            selected ? LABEL_BG[listing.type] : 'bg-surface-inverse'
          )}
        >
          {formatPriceShort(listing.price)}
        </span>
        {/* Figma wraps this polygon in scaleY(-1): the exported asset points up,
            and the design flips it so it aims down at the property. */}
        <span
          className='mask-icon -mt-1.5 -scale-y-100'
          style={
            {
              width: '21.6px',
              height: '14.72px',
              '--mask-url': `url("${labelTail}")`
            } as CSSProperties
          }
        />
      </span>
      <img src={PIN_ICON[listing.type]} alt='' width={46} height={46} />
    </button>
  )
}
