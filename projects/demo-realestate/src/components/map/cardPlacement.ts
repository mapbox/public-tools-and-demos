import type { Anchor } from 'mapbox-gl'

/**
 * Where the property card's Popup sits relative to the selected marker.
 *
 * GL JS's own `anchor: 'auto'` prefers placing a popup above its point, so it
 * would sit on top of the marker's price label and the map around it. The card
 * belongs underneath, as on Zillow, and only moves above or beside the marker
 * when there is not room below. Chosen once when the card opens; after that
 * the Popup simply follows its marker as the map pans.
 */

/** The selected marker's price label, which hangs above its point. */
const LABEL_HEIGHT = 30
const LABEL_HALF_WIDTH = 32
/** Clear space between the label and the card, and the card and map edges. */
const GAP = 8
const MARGIN = 12
/** How far a corner anchor tucks the card back under the marker. */
const CORNER_NUDGE = 24

export const CARD_OFFSETS: Record<Anchor, [number, number]> = {
  top: [0, GAP],
  'top-left': [-CORNER_NUDGE, GAP],
  'top-right': [CORNER_NUDGE, GAP],
  bottom: [0, -(LABEL_HEIGHT + GAP)],
  'bottom-left': [-CORNER_NUDGE, -(LABEL_HEIGHT + GAP)],
  'bottom-right': [CORNER_NUDGE, -(LABEL_HEIGHT + GAP)],
  left: [LABEL_HALF_WIDTH + GAP, -LABEL_HEIGHT / 2],
  right: [-(LABEL_HALF_WIDTH + GAP), -LABEL_HEIGHT / 2],
  center: [0, 0]
}

interface Size {
  width: number
  height: number
}

/**
 * In GL JS terms the anchor names the side of the popup that touches the
 * point, so `top` puts the card below the marker.
 */
export const chooseAnchor = (
  point: { x: number; y: number },
  card: Size,
  map: Size
): Anchor => {
  const fitsBelow = point.y + GAP + card.height <= map.height - MARGIN
  const fitsAbove = point.y - LABEL_HEIGHT - GAP - card.height >= MARGIN

  if (fitsBelow || fitsAbove) {
    const vertical = fitsBelow ? 'top' : 'bottom'
    const centred =
      point.x - card.width / 2 >= MARGIN &&
      point.x + card.width / 2 <= map.width - MARGIN
    if (centred) return vertical
    // Near an edge, hang the card off the side with more room.
    return point.x < map.width / 2 ? `${vertical}-left` : `${vertical}-right`
  }

  const fitsRight =
    point.x + LABEL_HALF_WIDTH + GAP + card.width <= map.width - MARGIN
  return fitsRight ? 'left' : 'right'
}
