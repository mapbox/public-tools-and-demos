import type { CSSProperties } from 'react'
import clsx from 'clsx'

import heartActive from '../../img/icons/heart-active.svg'
import labelTail from '../../img/pins/label-tail.svg'
import pinCondo from '../../img/pins/pin-condo.svg'
import pinHouse from '../../img/pins/pin-house.svg'
import pinTownhouse from '../../img/pins/pin-townhouse.svg'
import { formatPriceShort } from '../../lib/format'
import type { Listing, PropertyType } from '../../types/listing'
import type { MarkerDetail } from './markerDetail'

/** The circle below the label is what encodes property type. */
const PIN_ICON: Record<PropertyType, string> = {
  house: pinHouse,
  condo: pinCondo,
  townhouse: pinTownhouse
}

const DOT_COLOR: Record<PropertyType, string> = {
  house: 'bg-house',
  condo: 'bg-condo',
  townhouse: 'bg-townhouse'
}

/** Dataset listings have no property type; neutral is honest, not a guess. */
const NEUTRAL_DOT = 'bg-surface-inverse'

/** Figma `price-Label`: size=Default vs size=small. */
const LABEL_SIZE = {
  full: {
    bubble: 'px-3.5 py-2.5 text-xl',
    tail: { width: '21.6px', height: '14.72px' },
    pin: 46,
    heart: 14
  },
  compact: {
    bubble: 'px-[11.2px] py-1.5 text-base',
    tail: { width: '17.28px', height: '11.78px' },
    pin: 34,
    heart: 12
  }
} as const

export default function ListingMarker({
  listing,
  detail,
  selected,
  favorited,
  onSelect
}: {
  listing: Listing
  detail: MarkerDetail
  selected: boolean
  favorited: boolean
  onSelect: () => void
}) {
  const label = `${listing.name || formatPriceShort(listing.price)}${
    favorited ? ', saved' : ''
  }`

  // Whatever the density, a listing the user has acted on stays legible.
  const effective =
    detail === 'dot' && (selected || favorited) ? 'compact' : detail

  if (effective === 'dot') {
    return (
      <button
        type='button'
        onClick={onSelect}
        aria-label={label}
        className={clsx(
          'size-3 cursor-pointer rounded-full border-2 border-white shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
          listing.type ? DOT_COLOR[listing.type] : NEUTRAL_DOT
        )}
      />
    )
  }

  const size = LABEL_SIZE[effective]

  return (
    <button
      type='button'
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={label}
      className='flex cursor-pointer flex-col items-center gap-1'
    >
      {/* Two states only — selected or not. Colouring the label by property type
          as well would repeat what the circle underneath already says. The
          `text-*` here feeds the tail's currentColor mask. */}
      <span
        className={clsx(
          'flex flex-col items-center drop-shadow-[0px_0px_1.2px_rgba(0,0,0,0.18)]',
          selected ? 'text-brand' : 'text-surface-inverse'
        )}
      >
        <span
          className={clsx(
            'flex items-center gap-1 rounded-lg font-medium leading-none text-white',
            size.bubble,
            selected ? 'bg-brand' : 'bg-surface-inverse'
          )}
        >
          {favorited && (
            <img
              src={heartActive}
              alt=''
              width={size.heart}
              height={size.heart}
            />
          )}
          {formatPriceShort(listing.price)}
        </span>
        {/* Figma wraps this polygon in scaleY(-1): the exported asset points up,
            and the design flips it so it aims down at the property. */}
        <span
          className='mask-icon -mt-1.5 -scale-y-100'
          style={
            {
              width: size.tail.width,
              height: size.tail.height,
              '--mask-url': `url("${labelTail}")`
            } as CSSProperties
          }
        />
      </span>
      {listing.type ? (
        <img
          src={PIN_ICON[listing.type]}
          alt=''
          width={size.pin}
          height={size.pin}
        />
      ) : (
        <span
          className='rounded-full border-[3px] border-white bg-surface-inverse shadow-[0_1px_3px_rgba(0,0,0,0.35)]'
          style={{ width: size.pin * 0.55, height: size.pin * 0.55 }}
        />
      )}
    </button>
  )
}
