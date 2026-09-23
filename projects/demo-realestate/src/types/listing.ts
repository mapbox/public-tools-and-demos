export type PropertyType = 'house' | 'condo' | 'townhouse'

export type ListingTag = 'new' | 'price-drop' | 'featured'

export interface Listing {
  id: string
  name: string
  price: number
  beds: number
  baths: number
  /** Interior area in square feet. */
  area: number
  address: string
  neighborhood: string
  type: PropertyType
  tag?: ListingTag
  /** [longitude, latitude], the order Mapbox GL JS expects. */
  coordinates: [number, number]
  images: string[]
}
