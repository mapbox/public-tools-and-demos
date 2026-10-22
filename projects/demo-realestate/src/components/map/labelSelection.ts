import { formatPriceShort } from '../../lib/format'
import type { Listing } from '../../types/listing'

/** Most markers a viewport will ever render. Beyond this the list is truncated. */
export const MARKER_CAP = 500

export type MarkerVariant = 'dot' | 'label'

/** Label metrics, in screen pixels, matching ListingMarker's styling. */
const CHAR_WIDTH = 7.5
const PADDING = 16
const HEIGHT = 26
/** Clear space demanded around each label so neighbours cannot touch. */
const GAP = 5

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

const overlaps = (a: Rect, b: Rect) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

/**
 * Decides which listings show their price and which stay as dots.
 *
 * Every marker is drawn one way or the other, never both. Selection happens in
 * screen space, greedily: a listing gets its price if the box that price would
 * occupy is still clear, otherwise it stays a dot. Density varies enormously
 * within one viewport, so a global count would either flood downtown or leave
 * the suburbs bare; testing actual boxes keeps prices evenly scattered and
 * guarantees they never overlap, at any zoom.
 *
 * A grid was tried first and was not enough — two labels either side of a cell
 * boundary can still collide.
 *
 * Input order decides the winner and is stable across renders, so labels do not
 * flicker between neighbours while panning.
 *
 * This depends only on the viewport and the listing set. Selection and
 * favourites are layered on afterwards, never fed in here: if they competed for
 * space, clicking one dot would displace nearby labels and half the map would
 * rearrange around a single click.
 */
export const selectLabelled = (
  listings: Listing[],
  project: (coordinates: [number, number]) => { x: number; y: number }
): Set<string> => {
  const placed: Rect[] = []
  const labelled = new Set<string>()

  for (const listing of listings) {
    const { x, y } = project(listing.coordinates)
    const width = formatPriceShort(listing.price).length * CHAR_WIDTH + PADDING

    // The label is anchored above its point, so it occupies the space overhead.
    const box: Rect = {
      left: x - width / 2 - GAP,
      right: x + width / 2 + GAP,
      top: y - HEIGHT - GAP,
      bottom: y + GAP
    }

    if (placed.some((rect) => overlaps(rect, box))) continue
    placed.push(box)
    labelled.add(listing.id)
  }

  return labelled
}
