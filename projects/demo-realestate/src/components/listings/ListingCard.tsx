import clsx from 'clsx'

import { formatArea, formatPrice } from '../../lib/format'
import type { Listing } from '../../types/listing'
import Tag from '../ui/Tag'
import AmenityLabel from './AmenityLabel'
import FavoriteButton from './FavoriteButton'

export type CardLayout = 'horizontal' | 'vertical'

interface ListingCardProps {
  listing: Listing
  layout: CardLayout
  selected: boolean
  favorited: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}

const Divider = () => (
  <span className='w-px self-stretch rounded-full bg-gray-200' />
)

export default function ListingCard({
  listing,
  layout,
  selected,
  favorited,
  onSelect,
  onToggleFavorite
}: ListingCardProps) {
  const isVertical = layout === 'vertical'

  return (
    <article
      className={clsx(
        'group relative bg-white',
        isVertical
          ? 'flex w-full flex-col items-start gap-4 overflow-hidden rounded-xl border border-slate-200 pb-6 shadow-[0px_2px_3px_0px_rgba(0,0,0,0.1)]'
          : 'flex w-full items-center gap-3 border-b border-slate-200 py-3',
        !isVertical && 'hover:border-line hover:bg-brand-wash/20',
        selected && 'border-line bg-brand-wash/20'
      )}
    >
      <div
        className={clsx(
          'relative shrink-0',
          isVertical ? 'h-[206px] w-full' : 'h-28 w-[130px]'
        )}
      >
        <img
          src={listing.images[0]}
          alt={listing.name}
          className={clsx(
            'pointer-events-none absolute inset-0 size-full object-cover',
            !isVertical && 'rounded-lg'
          )}
        />
        <div className='absolute right-1.5 top-1.5 z-10'>
          <FavoriteButton
            active={favorited}
            onToggle={onToggleFavorite}
            label={listing.name}
          />
        </div>
      </div>

      <div
        className={clsx(
          'flex flex-col gap-1',
          isVertical ? 'w-full px-6' : 'min-w-0 flex-1'
        )}
      >
        <p className='pb-2 text-2xl font-bold leading-none text-ink'>
          {formatPrice(listing.price)}
        </p>

        <div className='flex items-start gap-1.5'>
          <AmenityLabel kind='bed'>{listing.beds} bed</AmenityLabel>
          <Divider />
          <AmenityLabel kind='bath'>{listing.baths} bath</AmenityLabel>
          <Divider />
          <AmenityLabel kind='area'>{formatArea(listing.area)}</AmenityLabel>
        </div>

        <p className='truncate text-xs text-gray-500'>
          {listing.address}, {listing.neighborhood}
        </p>

        {listing.tag && (
          <div className='flex flex-wrap items-start gap-1.5 pt-1'>
            <Tag tag={listing.tag} />
          </div>
        )}
      </div>

      {/* Overlay rather than wrapping the card in a button, so the favourite
          control is not a nested interactive element. */}
      <button
        type='button'
        aria-label={`View ${listing.name}, ${formatPrice(listing.price)}`}
        aria-current={selected}
        onClick={onSelect}
        className='absolute inset-0 cursor-pointer rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
      />
    </article>
  )
}
