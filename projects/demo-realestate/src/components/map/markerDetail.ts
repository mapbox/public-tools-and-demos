/**
 * How much of a marker to draw. Five hundred price labels at city zoom is
 * performant (measured) but unreadable, so the presentation steps down as the
 * viewport fills up. The sizes mirror the `price-Label` variants in Figma:
 * `full` is size=Default, `compact` is size=small, `dot` is the bare pin.
 */
export type MarkerDetail = 'full' | 'compact' | 'dot'

/** Most markers a viewport will ever render. Beyond this the list is truncated. */
export const MARKER_CAP = 500

const FULL_UP_TO = 150
const COMPACT_UP_TO = 400

export const detailForCount = (renderedCount: number): MarkerDetail => {
  if (renderedCount <= FULL_UP_TO) return 'full'
  if (renderedCount <= COMPACT_UP_TO) return 'compact'
  return 'dot'
}
