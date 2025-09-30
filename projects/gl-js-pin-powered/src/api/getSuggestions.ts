import { ACCESS_TOKEN } from '../constants'

export async function getSuggestions(map: mapboxgl.Map, q: string) {
  const proximity = map.getCenter().toArray().join(',')
  const res = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/forward?q=${q}&access_token=${ACCESS_TOKEN}&proximity=${proximity}&limit=10`
  )
  const body = await res.json()
  return body
}
