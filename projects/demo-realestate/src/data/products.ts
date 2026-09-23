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
      'Powers the address autocomplete in the header. Typing an address, neighborhood, or ZIP returns suggestions from the Mapbox Search Service and recentres the map on the chosen result.'
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
      'Each listing is a custom HTML marker showing its price. Marker colour encodes property type — blue for houses, orange for condos, green for townhouses — matching the type filters and the map legend.'
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
      'The small location preview inside the property card is a single Static Images API request rather than a second interactive map — cheaper to render and it never steals scroll from the page.'
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
