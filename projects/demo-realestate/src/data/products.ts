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
      'Note this searches places, not the listings on this page — choosing a result moves the map.'
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
      'Renders the map in the split and map views. The map instance is created once and held in a ref, then listings drive markers imperatively as filters change, so React owns the UI and GL JS owns the canvas.'
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
      'The basemap. Mapbox Standard is a professionally designed general-purpose style with dynamic lighting and 3D landmarks, used here as the backdrop for the listing pins.'
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
      'Markers are near-black by default and brand blue when selected. At most 500 are drawn per view, because DOM markers stay smooth when panning at that count and not at 1,000.'
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
      'The image keeps the logo and attribution the API draws into it, which is why the thumbnail strip sits below the photo instead of on top of it.'
    ],
    links: [
      {
        label: 'Static Images API',
        href: 'https://docs.mapbox.com/api/maps/static-images/'
      }
    ]
  },
  {
    title: 'Source Code',
    body: ['Read the full source for this demo on GitHub.'],
    links: [{ label: 'demo-realestate on GitHub', href: REPO }]
  }
]
