import { USE_CASES } from './useCasesData'

const A = ({ href, children }) => (
  <a
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className='scene-link'
  >
    {children}
  </a>
)

const C = ({ children }) => <code className='scene-code'>{children}</code>

const SCENE_BODY = {
  globe: (
    <>
      <C>globe</C> is one of many supported{' '}
      <A href='https://docs.mapbox.com/style-spec/reference/projection/'>
        projections
      </A>{' '}
      available in Mapbox web and mobile mapping SDKs.
    </>
  ),
  buildings: (
    <>
      The{' '}
      <A href='https://docs.mapbox.com/map-styles/guides/standard-styles/'>
        Mapbox Standard Style
      </A>{' '}
      includes realistic 3D buildings, landmarks, and trees — a rich foundation
      for immersive scenes enhanced with dynamic lighting presets and camera
      controls.
    </>
  ),
  markers: (
    <>
      Custom HTML{' '}
      <A href='https://docs.mapbox.com/mapbox-gl-js/api/markers/'>Markers</A>{' '}
      can be placed at any geographic coordinate. Popups attach to markers and
      support arbitrary HTML content for rich interactive experiences.
    </>
  ),
  'data-overlay': (
    <>
      A <C>heatmap</C> layer visualizes point density and magnitude — here
      driven by live data from the{' '}
      <A href='https://earthquake.usgs.gov/earthquakes/feed/'>
        USGS Earthquake Hazards Program
      </A>
      . Mapbox supports data-driven styling across all{' '}
      <A href='https://docs.mapbox.com/style-spec/reference/layers/'>
        layer types
      </A>
      .
    </>
  ),
  raster: (
    <>
      The <C>raster-particle</C> layer type renders animated particle flows over
      raster-array sources. This scene streams GFS global wind forecast data via
      the{' '}
      <A href='https://docs.mapbox.com/api/maps/raster-tiles/'>
        Mapbox Raster Tiles API
      </A>
      .
    </>
  ),
  navigation: (
    <>
      Mapbox powers turn-by-turn navigation through the{' '}
      <A href='https://docs.mapbox.com/#navigation'>
        Navigation SDKs for iOS and Android
      </A>
      . End users receive turn by turn instructions and voice guidance.
    </>
  ),
  'asset-tracking': (
    <>
      The{' '}
      <A href='https://docs.mapbox.com/api/navigation/isochrone/'>
        Isochrone API
      </A>{' '}
      computes drive-time polygons from any location, while the{' '}
      <A href='https://docs.mapbox.com/api/navigation/matrix/'>Matrix API</A>{' '}
      returns travel times between multiple origins and destinations. Pair these
      with real-time vehicle location feeds to build a live fleet tracking
      experience.
    </>
  ),
  terrain: (
    <>
      3D terrain is powered by the{' '}
      <A href='https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/'>
        Mapbox Terrain DEM
      </A>{' '}
      — a global elevation dataset. The{' '}
      <A href='https://docs.mapbox.com/map-styles/reference/standard-satellite/'>
        Mapbox Satellite
      </A>{' '}
      raster tileset can be draped over terrain for a photorealistic landscape.
    </>
  )
}

export default function SceneInfo({ sceneId }) {
  const body = SCENE_BODY[sceneId]
  const useCase = USE_CASES.find((uc) => uc.id === sceneId)
  if (!body || !useCase) return null

  return (
    <div className='scene-info-panel'>
      {/*<div className='scene-info-header'>
        <span className='scene-info-icon'>{useCase.icon}</span>
        <span className='scene-info-title'>{useCase.label}</span>
      </div> */}
      <div className='scene-info'>
        <div className='scene-info-icon'>{useCase.icon}</div>
        <p className='scene-info-body'>{body}</p>
      </div>
    </div>
  )
}
