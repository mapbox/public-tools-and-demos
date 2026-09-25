import interiors from '../data/interiors.json'
import type { Listing } from '../types/listing'
import { base } from './base-url'

export type Room =
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'dining'
  | 'office'
type Tier = 'standard' | 'high-end'

interface Interior {
  file: string
  room: Room
  /** Absent for rooms shared by both tiers. */
  tier?: Tier
}

export interface Photo {
  src: string
  srcSet: string
  room: Room
}

export const ROOM_LABEL: Record<Room, string> = {
  living: 'Living room',
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  dining: 'Dining room',
  office: 'Home office'
}

const pool = interiors as Interior[]

/**
 * The dataset has no photography, so every listing shows stock interiors. The
 * pools are split by tier so a $300k rambler never shows a $3M kitchen. Grade
 * is King County's construction-quality rating; it catches high-end finishes
 * that price alone misses, since price also carries the value of the land.
 */
const tierOf = (listing: Listing): Tier =>
  listing.price >= 1_000_000 || (listing.grade ?? 0) >= 10
    ? 'high-end'
    : 'standard'

const roomPool = (room: Room, tier: Tier) =>
  pool.filter((photo) => photo.room === room && (photo.tier ?? tier) === tier)

// FNV-1a, then mulberry32. Parcel ids are near-sequential within a
// neighbourhood, so the hash is what stops neighbours getting the same photos.
const seed = (id: string) => {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 0x01000193)
  }
  return h >>> 0
}

const random = (state: number) => () => {
  state = (state + 0x6d2b79f5) | 0
  let t = Math.imul(state ^ (state >>> 15), 1 | state)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const toPhoto = ({ file, room }: Interior): Photo => {
  const url = (width: number) => `${base}img/interiors/${file}-${width}.webp`
  return { src: url(960), srcSet: `${url(480)} 480w, ${url(960)} 960w`, room }
}

const cache = new Map<string, Photo[]>()

/**
 * Deterministic per listing: a home shows the same photos on every render and
 * every visit. The hero alternates between living room and kitchen so a row of
 * cards is not all sofas. A bedroom is skipped for the handful of 0-bed rows.
 */
export const photosFor = (listing: Listing): Photo[] => {
  const cached = cache.get(listing.id)
  if (cached) return cached

  const next = random(seed(listing.id))
  const pick = <T>(items: T[]) => items[Math.floor(next() * items.length)]
  const tier = tierOf(listing)

  const rooms: Room[] =
    next() < 0.5 ? ['living', 'kitchen'] : ['kitchen', 'living']
  if (listing.beds > 0) rooms.push('bedroom')
  rooms.push(pick<Room>(['bathroom', 'dining', 'office']))

  const photos = rooms.map((room) => toPhoto(pick(roomPool(room, tier))))
  cache.set(listing.id, photos)
  return photos
}
