const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

const numberFormatter = new Intl.NumberFormat('en-US')

export const formatPrice = (price: number) => priceFormatter.format(price)

export const formatArea = (area: number) =>
  `${numberFormatter.format(area)} ft²`

/** Map pin labels shorten to the "$2.5M" form the designs use. */
export const formatPriceShort = (price: number) => {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000
    return `$${millions.toFixed(millions < 10 ? 1 : 0).replace(/\.0$/, '')}M`
  }
  return `$${Math.round(price / 1000)}K`
}

const ACRE = 43_560

/** Lots under a quarter acre read better in square feet, as listing sites show them. */
const inAcres = (lot: number) => lot >= ACRE / 4

const acreFigure = (lot: number) =>
  (lot / ACRE).toFixed(lot < ACRE ? 2 : 1).replace(/\.?0+$/, '')

/** "5,650 ft²", "0.5 acres", "1 acre". */
export const formatLot = (lot: number) => {
  if (!inAcres(lot)) return formatArea(lot)
  const acres = acreFigure(lot)
  return `${acres} ${acres === '1' ? 'acre' : 'acres'}`
}

/** The same figure as an adjective, for prose: "a 5,650 ft² lot", "a 0.5-acre lot". */
export const formatLotAdjective = (lot: number) =>
  inAcres(lot) ? `${acreFigure(lot)}-acre` : formatArea(lot)

/** Half an acre, the point at which a lot reads as generous. */
export const isLargeLot = (lot: number) => lot >= ACRE / 2
