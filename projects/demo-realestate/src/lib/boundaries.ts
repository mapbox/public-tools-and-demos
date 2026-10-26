type Ring = [number, number][]

/** An area drawn on the map, which listings are limited to. */
export interface Boundary {
  geometry: GeoJSON.Polygon
  /** [west, south, east, north], to fit the map to. */
  bbox: [number, number, number, number]
}

export const drawnBoundary = (geometry: GeoJSON.Polygon): Boundary => {
  let [west, south, east, north] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const [lng, lat] of geometry.coordinates[0]) {
    west = Math.min(west, lng)
    east = Math.max(east, lng)
    south = Math.min(south, lat)
    north = Math.max(north, lat)
  }
  return { geometry, bbox: [west, south, east, north] }
}

/** Even-odd ray casting against one ring. */
const inRing = (ring: Ring, [x, y]: [number, number]) => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

/**
 * Whether a point is inside the boundary: in its outer ring and in none of its
 * holes. The bbox test first rejects nearly every listing cheaply.
 */
export const contains = (boundary: Boundary, point: [number, number]) => {
  const [west, south, east, north] = boundary.bbox
  const [lng, lat] = point
  if (lng < west || lng > east || lat < south || lat > north) return false
  const [outer, ...holes] = boundary.geometry.coordinates as Ring[]
  return inRing(outer, point) && !holes.some((hole) => inRing(hole, point))
}
