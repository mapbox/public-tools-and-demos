import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import bathIcon from '../../img/icons/bath-lg.svg'
import bedIcon from '../../img/icons/bed-lg.svg'
import calendarIcon from '../../img/icons/calendar-lg.svg'
import backIcon from '../../img/icons/chevron-left.svg'
import showMoreIcon from '../../img/icons/chevron-down-brand.svg'
import heartActiveIcon from '../../img/icons/heart-button-active.svg'
import heartIcon from '../../img/icons/heart-button.svg'
import homeIcon from '../../img/icons/home-lg.svg'
import locationIcon from '../../img/icons/location-lg.svg'
import lotIcon from '../../img/icons/lot-lg.svg'
import rulerIcon from '../../img/icons/ruler-lg.svg'
import { describe } from '../../lib/describe'
import { formatArea, formatLot, formatPrice } from '../../lib/format'
import { TYPE_LABEL, TYPE_TAG } from '../../lib/labels'
import { neighborhoodUrl } from '../../lib/static-image'
import type { Listing } from '../../types/listing'
import Tag from '../ui/Tag'
import GalleryStrip from './GalleryStrip'
import { slideLabel, slideSrc, useGallery } from './useGallery'

const HERO_WIDTH = 1280
const HERO_HEIGHT = 502
const MAP_HEIGHT = 375
/** Static Images caps each dimension at 1280 logical pixels. */
const MAX_STATIC_WIDTH = 1280

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
 * A stand-in for the location section, which is going to be iterated on:
 * one Static Images request at the frame's measured width. Measured rather
 * than cropped with object-cover, because cropping would cut off the logo and
 * attribution the API draws into the image's corners.
 */
function LocationMap({ listing }: { listing: Listing }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.min(MAX_STATIC_WIDTH, Math.round(entry.contentRect.width)))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div className='w-full rounded-2xl border border-gray-200 bg-surface-sunken p-2'>
      <div
        ref={ref}
        className='relative w-full overflow-hidden rounded-xl border border-gray-200 bg-surface-sunken'
        style={{ height: MAP_HEIGHT }}
      >
        {width && !failed && (
          <img
            src={neighborhoodUrl(listing.coordinates, width, MAP_HEIGHT)}
            alt={`Map of the area around ${listing.address ?? 'this home'}`}
            width={width}
            height={MAP_HEIGHT}
            onError={() => setFailed(true)}
            className='absolute left-0 top-0 max-w-none'
          />
        )}
      </div>
    </div>
  )
}

/**
 * The full listing, opened from the property card's "View full listing". A
 * centred sheet over a blurred view of the search, scrolling within itself.
 * Keyed by listing id at the call site, so its state resets per listing.
 */
export default function PropertyPanel({
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
  const gallery = useGallery(listing)
  const { hero } = gallery
  const backRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    backRef.current?.focus()
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
      className='fixed inset-0 z-40 overflow-y-auto bg-black/10 backdrop-blur-[6.55px]'
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
        className='mx-auto mb-6 mt-[68px] w-[1280px] max-w-[calc(100%-48px)] overflow-clip rounded-2xl bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.1)]'
      >
        <div
          className='relative w-full bg-surface-sunken'
          style={{ height: HERO_HEIGHT }}
        >
          <img
            src={slideSrc(hero, listing, HERO_WIDTH, HERO_HEIGHT)}
            srcSet={hero.kind === 'photo' ? hero.photo.srcSet : undefined}
            sizes={`${HERO_WIDTH}px`}
            alt={slideLabel(hero)}
            className='pointer-events-none absolute inset-0 size-full object-cover'
          />
          <div className='absolute left-0 top-0 p-8'>
            <button
              ref={backRef}
              type='button'
              onClick={onClose}
              className='flex h-8 cursor-pointer items-center gap-1 rounded-full bg-white py-1 pl-1 pr-4 text-sm font-medium text-ink-muted drop-shadow-[0px_1.143px_1.143px_rgba(0,0,0,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
            >
              <img src={backIcon} alt='' width={24} height={24} />
              Back to Search
            </button>
          </div>
        </div>

        <GalleryStrip
          listing={listing}
          gallery={gallery}
          heroWidth={HERO_WIDTH}
          heroHeight={HERO_HEIGHT}
          size='lg'
          className='px-12 pt-6'
        />

        <div className='grid grid-cols-[minmax(0,1fr)_184px] gap-12 px-12 pb-12 pt-8'>
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
                  className='truncate text-[32px] font-bold leading-[1.1] text-ink tabular-nums'
                >
                  {price}
                </h1>
                {/* Dataset listings have no names; property type fills the
                    name slot, as on the card. */}
                {listing.type && (
                  <>
                    <span className='h-[26px] w-px shrink-0 rounded-full bg-slate-200' />
                    <p className='min-w-0 flex-1 truncate text-[32px] font-medium leading-[1.1] text-ink'>
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
                <p className='min-w-0 flex-1 truncate text-xl font-medium text-gray-500'>
                  {place}
                </p>
              </div>
            )}
          </div>

          {/* Spans the rows beside it so it stays in reach while the details
              scroll past, then gives way to the full-width location section. */}
          <div className='col-start-2 row-span-3 row-start-1 flex flex-col items-end'>
            <button
              type='button'
              aria-pressed={favorited}
              onClick={onToggleFavorite}
              className='sticky top-8 flex min-h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-surface-inverse px-4 py-3 text-base font-bold whitespace-nowrap text-ink-inverse hover:bg-brand active:bg-[#004294] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
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

          <div className='col-start-1 grid grid-cols-3 gap-3'>
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

          <hr className='col-span-2 h-px rounded-full border-0 bg-gray-200' />

          <section className='col-span-2 flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <SectionTitle>Location &amp; getting around</SectionTitle>
              <p className='text-base font-medium leading-[1.5] text-ink-muted'>
                The neighborhood around the home, from the Mapbox Static Images
                API.
              </p>
            </div>
            <LocationMap listing={listing} />
          </section>
        </div>
      </article>
    </div>
  )
}
