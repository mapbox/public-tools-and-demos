export interface Product {
  title: string
  body: string[]
  links: { label: string; href: string }[]
}

const REPO =
  'https://github.com/mapbox/public-tools-and-demos/tree/main/projects/demo-realestate'

/**
 * Deliberately local rather than shared from `mapbox-demo-components`: the
 * shared `tooltipData` mixes generic product copy with demo-specific sentences
 * ("Markers are used to add styled elements ... from a static dataset") that are
 * only true for whichever demo they were written against. Keeping this here lets
 * each entry describe what this app actually does.
 */
export const products: Product[] = [
  {
    title: 'Mapbox Search JS',
    body: [
      'Powers the location search in the filter row, using the Search JS Core classes directly rather than the prebuilt React component.',
      'It is the two-step interactive flow: SearchBoxCore.suggest() as you type, debounced and cancellable via AbortController, then retrieve() once you pick a result, which is the call that returns coordinates. Both share a SessionToken, because the Search Box API bills a session rather than individual keystrokes, and a new session starts after each selection. Results are biased toward the listings area with the proximity option.',
      'Note this searches places, not the listings on this page — choosing a result moves the map.',
      'Choosing an area, such as a city or county, also outlines it on the map and limits the listings to those inside it. The outline comes from a beta Mapbox endpoint that returns a place’s boundary polygon for the same mapbox_id every Search Box result carries. It currently covers cities and counties; for neighborhoods and ZIP codes the map just moves there.',
      'The full listing reuses the same flow to add travel destinations. Search Box finds businesses and landmarks as well as addresses, which is how people name the places they commute to.'
    ],
    links: [
      {
        label: 'Mapbox Search JS guides',
        href: 'https://docs.mapbox.com/mapbox-search-js/guides/'
      },
      {
        label: 'SearchBox React component',
        href: 'https://docs.mapbox.com/mapbox-search-js/api/react/search/'
      }
    ]
  },
  {
    title: 'Mapbox GL JS',
    body: [
      'Renders the map in the split and map views. The map instance is created once and held in a ref, then listings drive markers imperatively as filters change, so React owns the UI and GL JS owns the canvas.',
      'The property card is a GL JS Popup anchored to the selected marker. It opens below the marker, moving above or beside it only when there is not room, then follows the marker as the map pans. It comes in two sizes, picked by a container query on the map rather than the screen, since the map is much narrower in split view than in map view.',
      'The full listing starts its map as a static image and only creates a second GL JS map when it is clicked, at the same centre and zoom, so opening a listing never costs a WebGL context nobody uses.'
    ],
    links: [
      {
        label: 'Mapbox GL JS guides',
        href: 'https://docs.mapbox.com/mapbox-gl-js/guides'
      },
      {
        label: 'Use Mapbox GL JS in a React app',
        href: 'https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/'
      }
    ]
  },
  {
    title: 'Mapbox Standard Style',
    body: [
      'The basemap. Mapbox Standard is a professionally designed general-purpose style with dynamic lighting and 3D landmarks, used here as the backdrop for the listing pins and for the interactive map in the full listing.',
      'It is customised entirely through Standard’s configuration properties, with no custom style to maintain: the faded theme softens the whole map, buildings and roads take the app’s cool neutrals, schools take the brand’s light blue, and labels use Manrope. Points of interest are hidden, so the listings, the selected building and route lines carry the attention.',
      'Selecting a listing also highlights its building in coral once you are zoomed in far enough for buildings to draw. It queries the style’s built-in buildings featureset at the listing’s coordinates and sets that building’s select feature state, with the colour set through the colorBuildingSelect configuration property.'
    ],
    links: [
      {
        label: 'Mapbox Standard documentation',
        href: 'https://docs.mapbox.com/map-styles/standard/guides/'
      }
    ]
  },
  {
    title: 'Map Markers',
    body: [
      'Each listing is a custom HTML marker, drawn as either a price label or a small dot. Which listings get a price is decided in screen space: a label is placed only where it would not collide with one already on the map, so prices stay evenly scattered at any zoom and density. Selecting or saving a listing always promotes it to a label, and saved listings carry a heart.',
      'Markers are near-black by default and brand blue when selected. At most 500 are drawn per view, because DOM markers stay smooth when panning at that count and not at 1,000.',
      'Each marker is also raised to roughly rooftop height with the marker altitude option, so when the map is pitched it floats above the 3D building pointing down at it instead of sinking inside it.'
    ],
    links: [
      {
        label: 'Markers and controls',
        href: 'https://docs.mapbox.com/mapbox-gl-js/guides/markers/'
      }
    ]
  },
  {
    title: 'Static Images API',
    body: [
      'The last photo in the property card gallery is an aerial view of the actual parcel: a single Static Images API request for the Satellite Streets style, centred on the listing with a pin and sized to the card at @2x. It is one image rather than a second interactive map, so it is cheap to render and never steals scroll from the page.',
      'The full listing adds a second request: a map of the surrounding neighborhood with a home pin, requested at the exact width of its frame so nothing is cropped. It stands in for the interactive map until someone clicks it. It uses the Streets style, because Static Images cannot render Mapbox Standard.',
      'Both images keep the Mapbox logo and attribution the API draws into their bottom corners, which is why the thumbnail strips sit below the images instead of over them.'
    ],
    links: [
      {
        label: 'Static Images API',
        href: 'https://docs.mapbox.com/api/maps/static-images/'
      }
    ]
  },
  {
    title: 'Directions API',
    body: [
      'Powers the travel times in the full listing. Each destination is one Directions API request from the home, returning the duration, the distance and the route geometry drawn on the map in that destination’s colour.',
      'Drive, Walk and Bike switch between the driving-traffic, walking and cycling profiles. Driving uses driving-traffic, so drive times reflect current traffic rather than free-flow speeds. Results are cached per profile, so switching back to one is instant and costs no new request.'
    ],
    links: [
      {
        label: 'Directions API',
        href: 'https://docs.mapbox.com/api/navigation/directions/'
      }
    ]
  },
  {
    title: 'Source Code',
    body: ['Read the full source for this demo on GitHub.'],
    links: [{ label: 'demo-realestate on GitHub', href: REPO }]
  }
]
