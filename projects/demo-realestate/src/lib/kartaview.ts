/**
 * Street-level photos from KartaView (kartaview.org), the open imagery platform
 * run by Grab. Its API is keyless and CORS-open, and the imagery is licensed
 * CC BY-SA 4.0, so every view of it carries the credit in `ATTRIBUTION`.
 *
 * Only 360° photos are used. Around Seattle the older flat photos are
 * forward-facing dashcam frames, so the house beside the road is never in shot.
 * Coverage is good in Seattle proper and close to nothing outside it.
 *
 * The API is slow — under a second usually, but 10s and more is not rare — so
 * lookups start as soon as a listing is selected and are cached for the session.
 */

import cameraMounts from '../data/kartaview-mounts.json'

const API = 'https://api.kartaview.org/2.0'

/** Beyond ~50m the house is lost behind its neighbours. */
const SEARCH_RADIUS_M = 50

/**
 * Closer than this, the photo is usually from a driveway or the alley behind,
 * and the house fills the frame as a wall. The nearest photo at least this far
 * away is preferred, falling back to the nearest of all.
 */
const MIN_VIEWING_DISTANCE_M = 8

/** Photos in a capture sequence are a few metres apart, with gaps. */
const NEIGHBOUR_SPAN = 3

export const ATTRIBUTION = {
  label: '© KartaView contributors, CC BY-SA 4.0',
  href: 'https://kartaview.org'
}

export interface StreetPhoto {
  id: string
  sequenceId: string
  sequenceIndex: number
  /** [longitude, latitude] of the camera. */
  coordinates: [number, number]
  /** Compass bearing of the panorama's centre. */
  centre: number
  /** Capture date, ISO yyyy-mm-dd. */
  date: string
  /** Full-size equirectangular original (~13000px, ~25MB). */
  url: string
}

interface ApiPhoto {
  id: string
  sequenceId: string
  sequenceIndex: string
  lat: string
  lng: string
  heading: string
  shotDate: string
  projection: string
  status: string
  fileurlProc: string
}

/**
 * Where the car's front sits in each capture sequence's panoramas, in degrees
 * clockwise from the image centre, keyed by sequence id. KartaView's `heading`
 * is the direction of travel, and the API says nothing about how the camera
 * was mounted: most drives have the front at the centre, but some had the
 * camera turned sideways. Measured by eye from the panoramas themselves, with
 * the car's hood and the way parked cars face; a sequence not listed is
 * assumed to be front-centred.
 */
const FRONT_OFFSETS: Record<string, number> = cameraMounts

const toPhoto = (photo: ApiPhoto): StreetPhoto => ({
  id: photo.id,
  sequenceId: photo.sequenceId,
  sequenceIndex: Number(photo.sequenceIndex),
  coordinates: [Number(photo.lng), Number(photo.lat)],
  centre: Number(photo.heading) - (FRONT_OFFSETS[photo.sequenceId] ?? 0),
  date: photo.shotDate.slice(0, 10),
  url: photo.fileurlProc
})

const search = async (params: Record<string, string | number>) => {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  )
  const response = await fetch(`${API}/photo/?${query}`)
  if (!response.ok) throw new Error(`KartaView: ${response.status}`)
  const body: { result?: { data?: ApiPhoto[] } } = await response.json()
  return (body.result?.data ?? [])
    .filter(
      (photo) => photo.projection === 'SPHERE' && photo.status === 'active'
    )
    .map(toPhoto)
}

const toRadians = Math.PI / 180

export const distanceM = (
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
) => {
  const a =
    Math.sin(((lat2 - lat1) * toRadians) / 2) ** 2 +
    Math.cos(lat1 * toRadians) *
      Math.cos(lat2 * toRadians) *
      Math.sin(((lng2 - lng1) * toRadians) / 2) ** 2
  return 12_742_000 * Math.asin(Math.sqrt(a))
}

/** Compass bearing in degrees, 0 = north, clockwise. */
export const bearing = (
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
) => {
  const dLng = (lng2 - lng1) * toRadians
  const y = Math.sin(dLng) * Math.cos(lat2 * toRadians)
  const x =
    Math.cos(lat1 * toRadians) * Math.sin(lat2 * toRadians) -
    Math.sin(lat1 * toRadians) * Math.cos(lat2 * toRadians) * Math.cos(dLng)
  return (Math.atan2(y, x) / toRadians + 360) % 360
}

/** Every photo seen this session, so stepping back never refetches. */
const photosById = new Map<string, StreetPhoto>()
const remember = (photos: StreetPhoto[]) => {
  for (const photo of photos) photosById.set(photo.id, photo)
  return photos
}

export const photoById = (id: string) => photosById.get(id)

const nearestCache = new Map<string, Promise<StreetPhoto | null>>()

/**
 * The 360° photo nearest a point, or null when there is none within reach.
 * Failures (KartaView rate-limits) are not cached, so a later look retries.
 */
export const nearestPhoto = (point: [number, number]) => {
  const key = point.join(',')
  let pending = nearestCache.get(key)
  if (!pending) {
    pending = search({
      lat: point[1],
      lng: point[0],
      radius: SEARCH_RADIUS_M,
      itemsPerPage: 100
    })
      .then(remember)
      .then((photos) => {
        const byDistance = photos
          .map((photo) => ({ photo, d: distanceM(point, photo.coordinates) }))
          .sort((a, b) => a.d - b.d)
        const best =
          byDistance.find(({ d }) => d >= MIN_VIEWING_DISTANCE_M) ??
          byDistance[0]
        return best?.photo ?? null
      })
      .catch((error: unknown) => {
        nearestCache.delete(key)
        throw error
      })
    nearestCache.set(key, pending)
  }
  return pending
}

const neighbourCache = new Map<string, Promise<StreetPhoto[]>>()

/**
 * The photos either side of this one in its capture sequence. The API has no
 * "next photo" call, so it asks for index ±1, and only walks further out when a
 * sequence skips that index — usually one request each way. Failures are not
 * cached, so a rate-limited step is retried rather than a dead end for good.
 */
export const neighbours = (photo: StreetPhoto) => {
  let pending = neighbourCache.get(photo.id)
  if (!pending) {
    const walk = async (step: 1 | -1) => {
      for (let offset = 1; offset <= NEIGHBOUR_SPAN; offset++) {
        const index = photo.sequenceIndex + step * offset
        if (index < 0) return undefined
        const [found] = await search({
          sequenceId: photo.sequenceId,
          sequenceIndex: index
        })
        if (found) return remember([found])[0]
      }
      return undefined
    }
    pending = Promise.all([walk(-1), walk(1)])
      .then((pair) => pair.filter((p): p is StreetPhoto => p !== undefined))
      .catch((error: unknown) => {
        neighbourCache.delete(photo.id)
        throw error
      })
    neighbourCache.set(photo.id, pending)
  }
  return pending
}

/**
 * The panorama resized by KartaView's image CDN. The original is ~13000px wide,
 * past every GPU's texture limit; 4096 is the widest that phones accept too.
 */
export const panoramaUrl = (photo: StreetPhoto, width = 4096) => {
  const source = btoa(photo.url)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `https://cdn.kartaview.org/pr:sharp/rs:fit:${width}:${
    width / 2
  }/${source}`
}
