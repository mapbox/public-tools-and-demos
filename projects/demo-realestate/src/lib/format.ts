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
