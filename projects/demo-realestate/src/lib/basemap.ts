/**
 * The Mapbox Standard configuration shared by every GL JS map in the app: a
 * subtle, on-brand take on Standard, set entirely through its configuration
 * properties rather than a custom Studio style, so it keeps receiving
 * Standard's updates. Property reference:
 * https://docs.mapbox.com/map-styles/standard/api/#configuration-properties
 *
 * Standard's `faded` theme sets a softer base across the whole map, and a few
 * overrides tune it toward the app: buildings and roads take its cool neutrals
 * (theme tokens in styles.css), schools the brand tint, since they are one of
 * the things people house-hunting look for, and labels Manrope. Points of
 * interest are hidden, so the listing markers, the selected building and
 * route lines have the map to themselves.
 */
export const BASEMAP_CONFIG = {
  theme: 'faded',
  //colorLand: '#f3f5f9', // just off --color-surface-sunken
  colorBuildings: '#e3e7ee',
  colorRoads: '#ffffff',
  colorTrunks: '#e7ebf1',
  colorMotorways: '#d5dae2', // --color-line
  showPointOfInterestLabels: false,
  colorEducation: '#c7e7ff', // --color-brand-tint
  // colorMedical: '#f4eaee',
  // colorCommercial: '#eef0f4',
  // colorIndustrial: '#eceef2',
  // colorAdminBoundaries: '#8b96aa', // --color-line-strong
  // colorPlaceLabels: '#23262d', // --color-ink
  // colorRoadLabels: '#566171', // --color-ink-muted
  // The app's Cera is not a Mapbox font; Manrope is the closest geometric
  // sans on Standard's list of default fonts.
  font: 'Manrope'
}
