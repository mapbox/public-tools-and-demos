import { useEffect, useLayoutEffect, useRef, useState } from 'react'

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

/**
 * The Figma small card's specs, without icons, but all three on one row to
 * keep the card short, so the value steps down to 14px to fit ~74px boxes.
 */
function CompactSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex min-w-0 flex-col gap-0.5 rounded-lg border border-gray-200 px-2 py-1.5'>
      <p className='truncate text-[10px] font-medium text-ink-muted'>{label}</p>
      <p className='truncate text-sm font-bold text-ink' title={value}>
        {value}
      </p>
    </div>
  )
}

/** Icon beside the text, so three fit across the roomy card. */
function RoomySpec({
  icon,
  label,
  value
}: {
  icon: string
  label: string
  value: string
}) {
  return (
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
 * The card for the selected listing, shown in a GL JS Popup anchored to its
 * marker. It comes in the Figma's two sizes, chosen by how much map there is
 * rather than by screen size (see the `roomy` variant in styles.css).
 *
 * Clicking anywhere on it opens the full listing, except on the thumbnails,
 * the favourite and close buttons, which do their own thing.
 *
 * The thumbnails sit below the hero rather than on it as in the Figma: the
 * Static Images aerial carries the logo and attribution the API burns into its
 * bottom corners, and anything laid over them hides them.
 *
 * Keyed by listing id at the call site, so the gallery resets per listing.
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
  const heroRef = useRef<HTMLDivElement>(null)
  const [heroSize, setHeroSize] = useState<{
    width: number
    height: number
  } | null>(null)

  useLayoutEffect(() => {
    const element = heroRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setHeroSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height)
      })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const aerial = heroSize
  const price = formatPrice(listing.price)
  const type = listing.type ? TYPE_LABEL[listing.type] : undefined
  const place = [listing.address, listing.neighborhood]
    .filter(Boolean)
    .join(', ')

  return (
    <article
      aria-label={`${price} listing details`}
      className='relative flex w-64 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.1)] roomy:w-[400px]'
    >
      {/* Beneath everything, so the card as a whole opens the full listing
          while its own controls, raised above it, still take their clicks. */}
      <button
        type='button'
        onClick={onViewListing}
        aria-label={`View full listing for ${price}`}
        className='absolute inset-0 cursor-pointer rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand'
      />

      <div
        ref={heroRef}
        className='pointer-events-none relative h-[145px] w-full shrink-0 bg-surface-inverse roomy:h-[220px]'
      >
        {hero.kind === 'photo' ? (
          <img
            src={hero.photo.src}
            srcSet={hero.photo.srcSet}
            sizes='400px'
            alt={slideLabel(hero)}
            className='absolute inset-0 size-full object-cover'
          />
        ) : (
          aerial && (
            <img
              src={slideSrc(hero, listing, aerial.width, aerial.height)}
              alt={slideLabel(hero)}
              width={aerial.width}
              height={aerial.height}
              className='absolute inset-0 max-w-none'
            />
          )
        )}

        <div className='pointer-events-auto absolute right-0 top-0 flex items-center'>
          <div className='py-2.5 pl-2.5 pr-1.5'>
            <FavoriteButton
              active={favorited}
              onToggle={onToggleFavorite}
              label={price}
              size='md'
            />
          </div>
          <div className='py-2.5 pl-1.5 pr-2.5'>
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

      {aerial && (
        <GalleryStrip
          listing={listing}
          gallery={gallery}
          heroWidth={aerial.width}
          heroHeight={aerial.height}
          size='card'
          className='pointer-events-none relative gap-2 px-3 pt-3 roomy:gap-3 roomy:px-5 roomy:pt-4 [&>button]:pointer-events-auto'
        />
      )}

      {/* Compact: the Figma small card, less its button. */}
      <div className='pointer-events-none flex flex-col gap-3 p-3 roomy:hidden'>
        <div className='flex flex-col gap-1.5'>
          {/* Type rides beside the price rather than on its own line, to
              keep the card short. */}
          <div className='flex items-center gap-2'>
            <div className='flex min-w-0 flex-1 items-baseline gap-2 leading-[1.1]'>
              <p className='shrink-0 text-xl font-bold text-ink tabular-nums'>
                {price}
              </p>
              {type && (
                <p className='truncate text-sm font-medium text-ink-muted'>
                  {type}
                </p>
              )}
            </div>
            {listing.tag && <Tag tag={listing.tag} />}
          </div>
          {place && (
            <div className='flex items-start gap-2'>
              <img
                src={locationIcon}
                alt=''
                width={16}
                height={16}
                className='mt-px size-3.5 shrink-0 opacity-80'
              />
              <p className='line-clamp-2 min-w-0 flex-1 text-xs font-medium text-gray-500'>
                {place}
              </p>
            </div>
          )}
        </div>
        <div className='grid grid-cols-3 gap-1'>
          <CompactSpec label='Bedrooms' value={String(listing.beds)} />
          <CompactSpec label='Bathrooms' value={String(listing.baths)} />
          <CompactSpec label='Area' value={formatArea(listing.area)} />
        </div>
      </div>

      {/* Roomy: the Figma large card, less its button. */}
      <div className='pointer-events-none hidden flex-col gap-3 px-5 pb-5 pt-4 roomy:flex'>
        <div className='flex flex-col gap-2.5'>
          <div className='flex flex-col justify-center gap-1'>
            {listing.tag && (
              <div className='flex items-center'>
                <Tag tag={listing.tag} />
              </div>
            )}
            <div className='flex h-[26px] items-center gap-2'>
              <p className='truncate text-2xl font-bold leading-[1.1] text-ink tabular-nums'>
                {price}
              </p>
              {type && (
                <>
                  <span className='h-[26px] w-px shrink-0 rounded-full bg-slate-200' />
                  <p className='truncate text-xl font-medium leading-[1.1] text-ink'>
                    {type}
                  </p>
                </>
              )}
            </div>
          </div>
          {place && (
            <div className='flex items-start gap-2'>
              <img
                src={locationIcon}
                alt=''
                width={16}
                height={16}
                className='mt-1 shrink-0 opacity-80'
              />
              <p className='line-clamp-2 min-w-0 flex-1 text-base font-medium text-gray-500'>
                {place}
              </p>
            </div>
          )}
        </div>
        <div className='flex items-start gap-2'>
          <RoomySpec
            icon={bedIcon}
            label='Bedrooms'
            value={String(listing.beds)}
          />
          <RoomySpec
            icon={bathIcon}
            label='Bathrooms'
            value={String(listing.baths)}
          />
          <RoomySpec
            icon={rulerIcon}
            label='Area'
            value={formatArea(listing.area)}
          />
        </div>
      </div>
    </article>
  )
}
