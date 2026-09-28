import clsx from 'clsx'

import type { Listing } from '../../types/listing'
import { slideLabel, slideSrc, type useGallery } from './useGallery'

/**
 * Sits below the hero, not overlaid as in the Figma: the aerial slide has the
 * Static Images API logo and attribution burned into its bottom corners, and
 * an overlaid strip would cover both.
 */
export default function GalleryStrip({
  listing,
  gallery,
  heroWidth,
  heroHeight,
  size,
  className
}: {
  listing: Listing
  gallery: ReturnType<typeof useGallery>
  heroWidth: number
  heroHeight: number
  size: 'sm' | 'lg'
  className?: string
}) {
  const { slides, active, setActive, onAerialError } = gallery
  return (
    <div className={clsx('flex gap-3', className)}>
      {slides.map((slide, index) => (
        <button
          key={slide.kind === 'photo' ? slide.photo.src : 'aerial'}
          type='button'
          aria-label={`Show ${slideLabel(slide).toLowerCase()}`}
          aria-current={index === active}
          onClick={() => setActive(index)}
          className={clsx(
            'relative shrink-0 cursor-pointer overflow-hidden',
            size === 'lg'
              ? 'h-20 w-[106.667px] rounded-[11.429px] border-[1.905px]'
              : 'h-[42px] w-14 rounded-md border',
            index === active
              ? 'border-brand ring-1 ring-brand'
              : 'border-gray-200 hover:border-line-strong'
          )}
        >
          <img
            src={slideSrc(slide, listing, heroWidth, heroHeight)}
            srcSet={slide.kind === 'photo' ? slide.photo.srcSet : undefined}
            sizes={size === 'lg' ? '107px' : '56px'}
            alt=''
            onError={slide.kind === 'aerial' ? onAerialError : undefined}
            className='pointer-events-none absolute inset-0 size-full object-cover'
          />
        </button>
      ))}
    </div>
  )
}
