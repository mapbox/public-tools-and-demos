export type PropertyType = 'house' | 'multi-family' | 'townhouse'

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
   * price, size, location and physical attributes. Address and neighbourhood
   * were recovered by reverse geocoding and type by joining the county parcel
   * extract; whatever could not be recovered stays absent rather than invented.
   * Photos are not a field at all: see `photosFor` in lib/photos.
   */
  name?: string
  address?: string
  neighborhood?: string
  type?: PropertyType
  tag?: ListingTag

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
