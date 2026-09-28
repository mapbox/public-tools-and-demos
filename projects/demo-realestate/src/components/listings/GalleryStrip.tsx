import clsx from 'clsx'

import type { Listing } from '../../types/listing'
import { slideLabel, slideSrc, type useGallery } from './useGallery'

/**
 * Both sizes sit below their hero, not over it as in the Figma: the Static
 * Images aerial carries its logo and attribution burned into its bottom
 * corners, and the strip would hide them. `lg` is the full listing's; `card`
 * is the property card's, sized by its tier (the Figma small card's 37×28
 * thumbnails, or 56×42 when roomy).
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
  size: 'card' | 'lg'
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
              : 'h-7 w-[37.333px] rounded-[4px] border roomy:h-[42px] roomy:w-14 roomy:rounded-md',
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
