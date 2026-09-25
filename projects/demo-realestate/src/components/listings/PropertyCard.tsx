import { useEffect, useState } from 'react'
import clsx from 'clsx'

import bathIcon from '../../img/icons/bath-lg.svg'
import bedIcon from '../../img/icons/bed-lg.svg'
import closeIcon from '../../img/icons/close-circle.svg'
import locationIcon from '../../img/icons/location.svg'
import rulerIcon from '../../img/icons/ruler-lg.svg'
import { formatArea, formatPrice } from '../../lib/format'
import { photosFor, ROOM_LABEL, type Photo } from '../../lib/photos'
import { aerialUrl } from '../../lib/static-image'
import type { Listing, PropertyType } from '../../types/listing'
import Tag from '../ui/Tag'
import FavoriteButton from './FavoriteButton'

const TYPE_LABEL: Record<PropertyType, string> = {
  house: 'House',
  'multi-family': 'Multi-family',
  townhouse: 'Townhouse'
}

// Matches the card's rendered hero, so the @2x request is exactly its pixels.
const HERO_WIDTH = 447
const HERO_HEIGHT = 250

type Slide = { kind: 'photo'; photo: Photo } | { kind: 'aerial' }

const slideSrc = (slide: Slide, listing: Listing) =>
  slide.kind === 'photo'
    ? slide.photo.src
    : aerialUrl(listing.coordinates, HERO_WIDTH, HERO_HEIGHT)

const slideLabel = (slide: Slide) =>
  slide.kind === 'photo' ? ROOM_LABEL[slide.photo.room] : 'Aerial view'

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
    <div className='flex min-w-0 flex-1 flex-col items-start gap-3 rounded-xl border border-gray-200 p-3'>
      <img src={icon} alt='' width={24} height={24} />
      <div className='flex w-full flex-col gap-1'>
        <p className='text-sm font-medium text-ink-muted'>{label}</p>
        <p className='truncate text-xl font-bold text-ink'>{value}</p>
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
  onClose
}: {
  listing: Listing
  favorited: boolean
  onToggleFavorite: () => void
  onClose: () => void
}) {
  // A failed aerial (a URL-restricted token on localhost, say) drops out of the
  // gallery rather than leaving a broken-image icon in the strip.
  const [aerialFailed, setAerialFailed] = useState(false)
  const slides: Slide[] = [
    ...photosFor(listing).map((photo) => ({ kind: 'photo' as const, photo })),
    ...(aerialFailed ? [] : [{ kind: 'aerial' as const }])
  ]
  const [active, setActive] = useState(0)
  const hero = slides[active] ?? slides[0]

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
          src={slideSrc(hero, listing)}
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

      {/* Below the hero, not overlaid as in the Figma: the aerial slide has the
          Static Images API logo and attribution burned into its bottom
          corners, and the strip would sit on top of both. */}
      <div className='flex gap-3 px-6 pt-3'>
        {slides.map((slide, index) => (
          <button
            key={slide.kind === 'photo' ? slide.photo.src : 'aerial'}
            type='button'
            aria-label={`Show ${slideLabel(slide).toLowerCase()}`}
            aria-current={index === active}
            onClick={() => setActive(index)}
            className={clsx(
              'relative h-[42px] w-14 shrink-0 cursor-pointer overflow-hidden rounded-md border',
              index === active
                ? 'border-brand ring-1 ring-brand'
                : 'border-gray-200 hover:border-line-strong'
            )}
          >
            <img
              src={slideSrc(slide, listing)}
              srcSet={slide.kind === 'photo' ? slide.photo.srcSet : undefined}
              sizes='56px'
              alt=''
              onError={
                slide.kind === 'aerial'
                  ? () => setAerialFailed(true)
                  : undefined
              }
              className='pointer-events-none absolute inset-0 size-full object-cover'
            />
          </button>
        ))}
      </div>

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
      </div>
    </article>
  )
}
