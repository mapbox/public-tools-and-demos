import { useState } from 'react'

import { photosFor, ROOM_LABEL, type Photo } from '../../lib/photos'
import { aerialUrl } from '../../lib/static-image'
import type { Listing } from '../../types/listing'

export type Slide = { kind: 'photo'; photo: Photo } | { kind: 'aerial' }

export const slideLabel = (slide: Slide) =>
  slide.kind === 'photo' ? ROOM_LABEL[slide.photo.room] : 'Aerial view'

/**
 * The aerial is requested at the hero's exact size, so its @2x image is the
 * hero's pixels and its thumbnail reuses the same (cached) URL.
 */
export const slideSrc = (
  slide: Slide,
  listing: Listing,
  width: number,
  height: number
) =>
  slide.kind === 'photo'
    ? slide.photo.src
    : aerialUrl(listing.coordinates, width, height)

/**
 * The listing's interiors plus a Static Images aerial of the real parcel.
 * Callers key their component by listing id, so the gallery resets to the
 * first photo whenever a different listing is shown.
 */
export function useGallery(listing: Listing) {
  // A failed aerial (a URL-restricted token on localhost, say) drops out of the
  // gallery rather than leaving a broken-image icon in the strip.
  const [aerialFailed, setAerialFailed] = useState(false)
  const slides: Slide[] = [
    ...photosFor(listing).map((photo) => ({ kind: 'photo' as const, photo })),
    ...(aerialFailed ? [] : [{ kind: 'aerial' as const }])
  ]
  const [active, setActive] = useState(0)
  return {
    slides,
    active,
    setActive,
    hero: slides[active] ?? slides[0],
    onAerialError: () => setAerialFailed(true)
  }
}
