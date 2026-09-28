import { useEffect } from 'react'

import bathIcon from '../../img/icons/bath-lg.svg'
import bedIcon from '../../img/icons/bed-lg.svg'
import closeIcon from '../../img/icons/close-circle.svg'
import locationIcon from '../../img/icons/location.svg'
import rulerIcon from '../../img/icons/ruler-lg.svg'
import { formatArea, formatPrice } from '../../lib/format'
import { TYPE_LABEL } from '../../lib/labels'
import type { Listing } from '../../types/listing'
import Tag from '../ui/Tag'
import FavoriteButton from './FavoriteButton'
import GalleryStrip from './GalleryStrip'
import { slideLabel, slideSrc, useGallery } from './useGallery'

// Matches the card's rendered hero, so the @2x request is exactly its pixels.
const HERO_WIDTH = 447
const HERO_HEIGHT = 250

function SpecBox({
  icon,
  label,
  value
}: {
  icon: string
  label: string
  value: string
}) {
  return (
    // Icon beside the text rather than above it, as in the Figma, to free the
    // height the "View full listing" button needs.
    <div className='flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 px-2.5 py-2.5'>
      <img src={icon} alt='' width={24} height={24} className='shrink-0' />
      <div className='flex min-w-0 flex-col gap-0.5'>
        <p className='text-xs font-medium text-ink-muted'>{label}</p>
        <p className='truncate text-base font-bold text-ink' title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}

/**
 * Keyed by listing id at the call site, so the gallery resets to the first
 * photo whenever a different listing is opened.
 */
export default function PropertyCard({
  listing,
  favorited,
  onToggleFavorite,
  onClose,
  onViewListing
}: {
  listing: Listing
  favorited: boolean
  onToggleFavorite: () => void
  onClose: () => void
  onViewListing: () => void
}) {
  const gallery = useGallery(listing)
  const { hero } = gallery

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const price = formatPrice(listing.price)
  const place = [listing.address, listing.neighborhood]
    .filter(Boolean)
    .join(', ')

  return (
    <article
      aria-label={`${price} listing details`}
      className='flex w-[447px] max-w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.1)]'
    >
      <div
        className='relative w-full shrink-0 bg-surface-sunken'
        style={{ height: HERO_HEIGHT }}
      >
        <img
          src={slideSrc(hero, listing, HERO_WIDTH, HERO_HEIGHT)}
          srcSet={hero.kind === 'photo' ? hero.photo.srcSet : undefined}
          sizes={`${HERO_WIDTH}px`}
          alt={slideLabel(hero)}
          className='pointer-events-none absolute inset-0 size-full object-cover'
        />
        <div className='absolute right-0 top-0 flex items-center'>
          <div className='py-3 pl-3 pr-2'>
            <FavoriteButton
              active={favorited}
              onToggle={onToggleFavorite}
              label={price}
              size='md'
            />
          </div>
          <div className='py-3 pl-2 pr-3'>
            <button
              type='button'
              aria-label='Close listing details'
              onClick={onClose}
              className='relative block size-8 cursor-pointer rounded-full'
            >
              {/* The asset carries its own white circle and shadow, drawn
                  slightly outside the 32px hit area. */}
              <img
                src={closeIcon}
                alt=''
                width={37.3333}
                height={37.3333}
                className='absolute -left-[2.667px] -top-[1.333px] max-w-none'
              />
            </button>
          </div>
        </div>
      </div>

      <GalleryStrip
        listing={listing}
        gallery={gallery}
        heroWidth={HERO_WIDTH}
        heroHeight={HERO_HEIGHT}
        size='sm'
        className='px-6 pt-3'
      />

      <div className='flex w-full flex-col gap-3 px-6 pb-6 pt-4'>
        <div className='flex w-full flex-col gap-2.5'>
          <div className='flex w-full flex-col justify-center gap-1'>
            {listing.tag && (
              <div className='flex items-center'>
                <Tag tag={listing.tag} />
              </div>
            )}
            <div className='flex h-[26px] w-full items-center gap-2'>
              <p className='truncate text-2xl font-bold leading-[1.1] text-ink tabular-nums'>
                {price}
              </p>
              {/* The dataset has no listing names; property type is the most
                  useful real attribute to put in that slot. */}
              {listing.type && (
                <>
                  <span className='h-[26px] w-px shrink-0 rounded-full bg-slate-200' />
                  <p className='truncate text-xl font-medium leading-[1.1] text-ink'>
                    {TYPE_LABEL[listing.type]}
                  </p>
                </>
              )}
            </div>
          </div>
          {place && (
            <div className='flex w-full items-center gap-2'>
              <img
                src={locationIcon}
                alt=''
                width={16}
                height={16}
                className='shrink-0 opacity-80'
              />
              <p className='min-w-0 flex-1 truncate text-sm font-medium text-gray-500'>
                {place}
              </p>
            </div>
          )}
        </div>

        <div className='flex w-full items-start gap-2'>
          <SpecBox
            icon={bedIcon}
            label='Bedrooms'
            value={String(listing.beds)}
          />
          <SpecBox
            icon={bathIcon}
            label='Bathrooms'
            value={String(listing.baths)}
          />
          <SpecBox
            icon={rulerIcon}
            label='Area'
            value={formatArea(listing.area)}
          />
        </div>

        {/* The icon-less variant of the Figma `button` component; the heart in
            the card mock belongs to its "Save to favorites" variant. */}
        <button
          type='button'
          onClick={onViewListing}
          className='flex min-h-[34px] w-full cursor-pointer items-center justify-center rounded-lg bg-surface-inverse px-4 py-3 text-base font-bold text-ink-inverse hover:bg-brand active:bg-[#004294] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
        >
          View full listing
        </button>
      </div>
    </article>
  )
}
