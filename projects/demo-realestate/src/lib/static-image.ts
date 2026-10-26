import accessToken from './mapbox'

/**
 * An aerial view of the parcel from the Static Images API. Unlike the stock
 * interiors, this is the real lot at the listing's coordinates.
 *
 * The image keeps the logo and attribution the API burns into its bottom
 * corners, so nothing may be laid over them.
 */
export const aerialUrl = (
  [lng, lat]: [number, number],
  width: number,
  height: number
) =>
  `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/` +
  `pin-s+007afc(${lng},${lat})/${lng},${lat},18,0/${width}x${height}@2x` +
  `?access_token=${accessToken}`

/**
 * Shared with the GL JS map the poster turns into. Static Images and GL JS both
 * use 512px tiles, so the same number frames the same area in each.
 */
export const NEIGHBORHOOD_ZOOM = 14.5

/**
 * The neighbourhood around the home, for the full listing's location section.
 * Streets v12, the nearest match to the main map's Standard style, which the
 * Static Images API cannot render (it rejects Standard's landmark icon tileset).
 */
export const neighborhoodUrl = (
  [lng, lat]: [number, number],
  width: number,
  height: number
) =>
  `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
  `pin-l-home+1e2136(${lng},${lat})/${lng},${lat},${NEIGHBORHOOD_ZOOM},0/${width}x${height}@2x` +
  `?access_token=${accessToken}`
