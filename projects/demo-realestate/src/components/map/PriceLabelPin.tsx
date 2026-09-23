import type { CSSProperties } from 'react'
import clsx from 'clsx'

import heartActive from '../../img/icons/heart-active.svg'
import labelTail from '../../img/pins/label-tail.svg'
import pinCondo from '../../img/pins/pin-condo.svg'
import pinHouse from '../../img/pins/pin-house.svg'
import pinTownhouse from '../../img/pins/pin-townhouse.svg'
import { formatPriceShort } from '../../lib/format'
import type { Listing, PropertyType } from '../../types/listing'

/** The circle below the label is what encodes property type. */
const PIN_ICON: Record<PropertyType, string> = {
  house: pinHouse,
  condo: pinCondo,
  townhouse: pinTownhouse
}

export default function PriceLabelPin({
  listing,
  selected,
  favorited,
  onSelect
}: {
  listing: Listing
  selected: boolean
  favorited: boolean
  onSelect: () => void
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${listing.name}, ${formatPriceShort(listing.price)}${
        favorited ? ', saved' : ''
      }`}
      className='flex cursor-pointer flex-col items-center gap-2'
    >
      {/* Two states only — selected or not. Colouring the label by property
          type as well would just repeat what the circle underneath says. The
          `text-*` here feeds the tail's currentColor mask. */}
      <span
        className={clsx(
          'flex flex-col items-center drop-shadow-[0px_0px_1.2px_rgba(0,0,0,0.18)]',
          selected ? 'text-brand' : 'text-surface-inverse'
        )}
      >
        <span
          className={clsx(
            'flex items-center gap-1 rounded-lg px-3.5 py-2.5 text-xl font-medium leading-none text-white',
            selected ? 'bg-brand' : 'bg-surface-inverse'
          )}
        >
          {favorited && <img src={heartActive} alt='' width={14} height={14} />}
          {formatPriceShort(listing.price)}
        </span>
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
