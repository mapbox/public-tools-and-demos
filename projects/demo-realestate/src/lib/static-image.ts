import accessToken from './mapbox'

/**
 * An aerial view of the parcel from the Static Images API. Unlike the stock
 * interiors, this is the real lot at the listing's coordinates.
 *
 * The image keeps the API's default logo and attribution burned into its
 * bottom corners, so nothing may be laid over them.
 */
export const aerialUrl = (
  [lng, lat]: [number, number],
  width: number,
  height: number
) =>
  `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/` +
  `pin-s+007afc(${lng},${lat})/${lng},${lat},18,0/${width}x${height}@2x` +
  `?access_token=${accessToken}`
