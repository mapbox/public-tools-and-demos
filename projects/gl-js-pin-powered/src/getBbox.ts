export function getBbox(coordinates: GeoJSON.Position[][]) {
  let minLng = Infinity,
    minLat = Infinity,
    maxLng = -Infinity,
    maxLat = -Infinity

  function processCoords(coords: GeoJSON.Position[] | GeoJSON.Position) {
    if (Array.isArray(coords[0])) {
      ;(coords as GeoJSON.Position[]).forEach((c) => processCoords(c))
    } else {
      const [lng, lat] = coords as GeoJSON.Position
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
    }
  }

  coordinates.forEach((lineString) => processCoords(lineString))

  return [minLng, minLat, maxLng, maxLat] as [number, number, number, number]
}
