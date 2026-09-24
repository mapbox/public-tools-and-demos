import type { Listing } from '../types/listing'

/**
 * The slider tops out at $3M, matching the design's "$3M+" axis label. Only
 * 0.23% of King County sales exceed it, so a scale reaching the $7.7M maximum
 * would squash the entire distribution into the first fifth of the track.
 */
export const PRICE_FLOOR = 0
export const PRICE_CEILING = 3_000_000
export const PRICE_STEP = 25_000

/** Matches the number of columns in the Figma histogram. */
const BUCKETS = 15

export interface PriceRange {
  min: number
  max: number
}

export const FULL_RANGE: PriceRange = {
  min: PRICE_FLOOR,
  max: PRICE_CEILING
}

/** At the ceiling the upper handle means "and above", not a literal cap. */
export const isUncapped = (range: PriceRange) => range.max >= PRICE_CEILING

export const matchesPrice = (price: number, range: PriceRange) =>
  price >= range.min && (isUncapped(range) || price <= range.max)

/** Counts per bucket, with everything above the ceiling folded into the last. */
export const bucketPrices = (listings: Listing[]): number[] => {
  const width = (PRICE_CEILING - PRICE_FLOOR) / BUCKETS
  const counts = new Array<number>(BUCKETS).fill(0)
  for (const listing of listings) {
    const index = Math.min(
      BUCKETS - 1,
      Math.floor((listing.price - PRICE_FLOOR) / width)
    )
    if (index >= 0) counts[index] += 1
  }
  return counts
}
