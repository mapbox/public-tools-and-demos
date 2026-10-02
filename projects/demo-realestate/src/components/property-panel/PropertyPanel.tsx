import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import bathIcon from '../../img/icons/bath-lg.svg'
import bedIcon from '../../img/icons/bed-lg.svg'
import calendarIcon from '../../img/icons/calendar-lg.svg'
import closeIcon from '../../img/icons/close-circle.svg'
import showMoreIcon from '../../img/icons/chevron-down-brand.svg'
import heartActiveIcon from '../../img/icons/heart-button-active.svg'
import heartIcon from '../../img/icons/heart-button.svg'
import homeIcon from '../../img/icons/home-lg.svg'
import locationIcon from '../../img/icons/location-lg.svg'
import lotIcon from '../../img/icons/lot-lg.svg'
import rulerIcon from '../../img/icons/ruler-lg.svg'
import { useElementSize } from '../../hooks/useElementSize'
import { describe } from '../../lib/describe'
import { formatArea, formatLot, formatPrice } from '../../lib/format'
import { TYPE_LABEL, TYPE_TAG } from '../../lib/labels'
import { useSelection, useTravel } from '../../state/contexts'
import type { Listing } from '../../types/listing'
import Tag from '../ui/Tag'
import Destinations from './Destinations'
import GalleryStrip from '../gallery/GalleryStrip'
import PropertyMap from '../map/PropertyMap'
import { useRoutes } from './useRoutes'
import { slideLabel, slideSrc, useGallery } from '../gallery/useGallery'

const HERO_WIDTH = 1280

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
    <div className='flex min-w-0 flex-col items-start gap-3 rounded-xl border border-gray-200 p-3'>
      <img src={icon} alt='' width={24} height={24} />
      <div className='flex w-full flex-col gap-1'>
        <p className='text-sm font-medium text-ink-muted'>{label}</p>
        <p className='truncate text-xl font-bold text-ink' title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className='truncate text-2xl font-bold leading-[1.1] text-ink'>
      {children}
    </h2>
  )
}

/** Collapses to four lines, and only offers "Show more" when that hides text. */
function Description({ paragraphs }: { paragraphs: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current
    if (element && !expanded) {
      setOverflows(element.scrollHeight > element.clientHeight + 1)
    }
  }, [paragraphs, expanded])

  return (
    <>
      <div
        ref={ref}
        className={clsx(
          'max-w-[640px] overflow-hidden text-base font-medium leading-normal text-ink-muted',
          !expanded && 'max-h-[104px]'
        )}
      >
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className='mb-2 leading-[1.5] last:mb-0'>
            {paragraph}
          </p>
        ))}
      </div>
      {(overflows || expanded) && (
        <button
          type='button'
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className='flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand'
        >
          {expanded ? 'Show less' : 'Show more'}
          <img
            src={showMoreIcon}
            alt=''
            width={18}
            height={18}
            className={clsx(expanded && 'rotate-180')}
          />
        </button>
      )}
    </>
  )
}

/**
 * The full listing, opened from the property card's "View full listing". A
 * centred sheet over a blurred view of the search, scrolling within itself;
 * on a phone it fills the screen and its columns stack.
 * Keyed by listing id at the call site, so its state resets per listing.
 */
export default function PropertyPanel({ listing }: { listing: Listing }) {
  const { favorites, toggleFavorite, closePanel: onClose } = useSelection()
  const { destinations, profile } = useTravel()
  const favorited = favorites.has(listing.id)
  const gallery = useGallery(listing)
  const routes = useRoutes(listing.coordinates, destinations, profile)
  const { hero } = gallery
  // The hero is 1280 wide on desktop and the screen's width on a phone; the
  // aerial is requested at whatever it measures, so it is never cropped.
  const [heroRef, heroSize] = useElementSize<HTMLDivElement>()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
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
    <div
      className='fixed inset-0 z-40 overflow-y-auto bg-black/10 backdrop-blur-[6.55px] max-md:bg-white'
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <article
        role='dialog'
        aria-modal='true'
        aria-labelledby='property-panel-title'
        // overflow-clip rather than overflow-hidden: hidden would make this a
        // scroll container and stop the favourites button sticking.
        className='mx-auto mb-6 mt-[68px] w-[1280px] max-w-[calc(100%-48px)] overflow-clip rounded-2xl bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.1)] max-md:m-0 max-md:w-full max-md:max-w-none max-md:rounded-none max-md:shadow-none'
      >
        <div
          ref={heroRef}
          className='relative h-[502px] w-full bg-surface-sunken max-md:h-64'
        >
          {heroSize && (
            <img
              src={slideSrc(hero, listing, heroSize.width, heroSize.height)}
              srcSet={hero.kind === 'photo' ? hero.photo.srcSet : undefined}
              sizes={`(width < 48rem) 100vw, ${HERO_WIDTH}px`}
              alt={slideLabel(hero)}
              className='pointer-events-none absolute inset-0 size-full object-cover'
            />
          )}
          {/* Top right, not the Figma's "Back to Search" pill at top left: this
              is a dialog over the search, and the small card already closes
              from the same corner with the same control. */}
          <div className='absolute right-0 top-0 p-6 max-md:p-4'>
            <button
              ref={closeRef}
              type='button'
              aria-label='Back to search'
              title='Back to search'
              onClick={onClose}
              className='relative block size-8 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
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

        {heroSize && (
          <GalleryStrip
            listing={listing}
            gallery={gallery}
            heroWidth={heroSize.width}
            heroHeight={heroSize.height}
            size='lg'
            className='px-9 pt-[18px] max-md:gap-2 max-md:overflow-x-auto max-md:px-4 max-md:pb-1 max-md:pt-3'
          />
        )}

        {/* On a phone it is one column in source order: title, save, specs,
            description, location. */}
        <div className='grid grid-cols-[minmax(0,1fr)_184px] gap-9 px-9 pb-9 pt-6 max-md:grid-cols-1 max-md:gap-6 max-md:px-4 max-md:pb-6 max-md:pt-4'>
          <div className='col-start-1 flex flex-col gap-3'>
            <div className='flex flex-col justify-center gap-2'>
              {listing.tag && (
                <div className='flex items-center'>
                  <Tag tag={listing.tag} />
                </div>
              )}
              <div className='flex h-[26px] items-center gap-3'>
                <h1
                  id='property-panel-title'
                  className='truncate text-[32px] font-bold leading-[1.1] text-ink tabular-nums max-md:text-2xl'
                >
                  {price}
                </h1>
                {/* Dataset listings have no names; property type fills the
                    name slot, as on the card. */}
                {listing.type && (
                  <>
                    <span className='h-[26px] w-px shrink-0 rounded-full bg-slate-200' />
                    <p className='min-w-0 flex-1 truncate text-[32px] font-medium leading-[1.1] text-ink max-md:text-2xl'>
                      {TYPE_LABEL[listing.type]}
                    </p>
                  </>
                )}
              </div>
            </div>
            {place && (
              <div className='flex items-center gap-2'>
                <img
                  src={locationIcon}
                  alt=''
                  width={24}
                  height={24}
                  className='shrink-0 opacity-80'
                />
                <p className='min-w-0 flex-1 truncate text-xl font-medium text-gray-500 max-md:text-base'>
                  {place}
                </p>
              </div>
            )}
          </div>

          {/* Spans the rows beside it so it stays in reach while the details
              scroll past, then gives way to the full-width location section. */}
          <div className='col-start-2 row-span-3 row-start-1 flex flex-col items-end max-md:col-start-1 max-md:row-span-1 max-md:row-start-auto max-md:items-stretch'>
            <button
              type='button'
              aria-pressed={favorited}
              onClick={() => toggleFavorite(listing.id)}
              className='sticky top-6 max-md:static flex min-h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-surface-inverse px-4 py-3 text-base font-bold whitespace-nowrap text-ink-inverse hover:bg-brand active:bg-[#004294] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
            >
              <img
                src={favorited ? heartActiveIcon : heartIcon}
                alt=''
                width={18}
                height={18}
              />
              Save to favorites
            </button>
          </div>

          <div className='col-start-1 grid grid-cols-3 gap-3 max-md:grid-cols-2'>
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
            <SpecBox
              icon={homeIcon}
              label='Home type'
              value={listing.type ? TYPE_LABEL[listing.type] : '—'}
            />
            <SpecBox
              icon={calendarIcon}
              label='Built'
              value={listing.built ? String(listing.built) : '—'}
            />
            <SpecBox
              icon={lotIcon}
              label='Lot size'
              value={listing.lot ? formatLot(listing.lot) : '—'}
            />
          </div>

          <section className='col-start-1 flex flex-col items-start gap-3'>
            <div className='flex flex-col gap-1'>
              <SectionTitle>What’s special</SectionTitle>
              {listing.type && (
                <div className='flex items-center'>
                  <span className='rounded-[4px] bg-brand-wash px-1.5 py-0.5 font-label text-[10px] font-bold uppercase text-brand-dark'>
                    {TYPE_TAG[listing.type]}
                  </span>
                </div>
              )}
            </div>
            <Description paragraphs={describe(listing)} />
          </section>

          <hr className='col-span-2 h-px rounded-full border-0 bg-gray-200 max-md:col-span-1' />

          <section className='col-span-2 flex flex-col gap-4 max-md:col-span-1'>
            <div className='flex flex-col gap-2'>
              <SectionTitle>Location &amp; getting around</SectionTitle>
              <p className='text-base font-medium leading-[1.5] text-ink-muted'>
                Click the map to explore the neighborhood, and add the places
                you travel to for routes and travel times.
              </p>
            </div>
            <div className='grid w-full grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 rounded-2xl border border-gray-200 bg-surface-sunken p-2 max-md:grid-cols-1'>
              <PropertyMap
                listing={listing}
                destinations={destinations}
                routes={routes}
              />
              <Destinations routes={routes} />
            </div>
          </section>
        </div>
      </article>
    </div>
  )
}
