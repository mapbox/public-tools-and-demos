import type { Map as MapboxMap, Point } from 'mapbox-gl'

/**
 * Highlights the building a listing sits in, using Mapbox Standard's
 * `buildings` featureset and its `select` feature state, as in
 * https://docs.mapbox.com/mapbox-gl-js/example/highlight-buildings-standard/
 *
 * The listing points are King County's surveyed address points, which fall on
 * the house itself; with the original Kaggle coordinates (~75m of rounding)
 * this would have lit up the neighbour's house.
 */

const BUILDINGS = { featuresetId: 'buildings', importId: 'basemap' }

/** Passed as Standard's `colorBuildingSelect`: a coral red, softer than the theme's danger red. */
export const BUILDING_SELECT_COLOR = '#f87171'

/**
 * Some address points sit just off the footprint, on a porch or a driveway, so
 * a miss at the exact point falls back to the nearest building within a few
 * pixels. Small enough not to reach across to a neighbour at building zooms.
 */
const NEAR_PX = 8

type Building = ReturnType<MapboxMap['queryRenderedFeatures']>[number]

const centreDistance = (map: MapboxMap, feature: Building, at: Point) => {
  const geometry = feature.geometry
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
    return Infinity
  }
  const ring =
    geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0]
  let x = 0
  let y = 0
  for (const coordinate of ring) {
    const point = map.project(coordinate as [number, number])
    x += point.x
    y += point.y
  }
  return Math.hypot(x / ring.length - at.x, y / ring.length - at.y)
}

/**
 * The building rendered at a coordinate, or undefined when none is drawn there,
 * which is also what happens below the zoom at which Standard shows buildings.
 */
export const buildingAt = (map: MapboxMap, lngLat: [number, number]) => {
  const point = map.project(lngLat)
  const [hit] = map.queryRenderedFeatures(point, { target: BUILDINGS })
  if (hit) return hit

  const near = map.queryRenderedFeatures(
    [
      [point.x - NEAR_PX, point.y - NEAR_PX],
      [point.x + NEAR_PX, point.y + NEAR_PX]
    ],
    { target: BUILDINGS }
  )
  return near.sort(
    (a, b) => centreDistance(map, a, point) - centreDistance(map, b, point)
  )[0]
}

export const setBuildingSelected = (
  map: MapboxMap,
  building: Building,
  selected: boolean
) => map.setFeatureState(building, { select: selected })

/**
 * How high every listing's marker floats, in metres, so that on a pitched map
 * it sits above the house pointing down at it rather than inside the extruded
 * building. One height for all: estimating per house from the storey count put
 * too many pins well above the buildings Standard actually draws. Flat on, the
 * altitude makes no visible difference.
 */
export const MARKER_ALTITUDE_M = 6
