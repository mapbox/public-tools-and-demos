export type PropertyType = 'house' | 'condo' | 'townhouse'

export type ListingTag = 'new' | 'price-drop' | 'featured'

export interface Listing {
  id: string
  price: number
  beds: number
  baths: number
  /** Interior area in square feet. */
  area: number
  /** [longitude, latitude], the order Mapbox GL JS expects. */
  coordinates: [number, number]

  /**
   * Everything below is absent from the King County dataset, which carries only
   * price, size, location and physical attributes. The hand-authored demo
   * listings still supply them, so they stay optional rather than being
   * invented for 21k rows.
   */
  name?: string
  address?: string
  neighborhood?: string
  type?: PropertyType
  tag?: ListingTag
  images?: string[]

  /** King County attributes, present only on dataset listings. */
  zip?: string
  built?: number
  renovated?: number | null
  waterfront?: boolean
  basement?: boolean
  floors?: number
  view?: number
  condition?: number
  grade?: number
  lot?: number
  /** Sale date, ISO yyyy-mm-dd. This dataset is sales, not live listings. */
  sold?: string
}
