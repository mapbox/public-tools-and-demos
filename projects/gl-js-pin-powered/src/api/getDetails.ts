//
// The Details API https://docs.mapbox.com/api/search/details/ is currently in
// private preview.
//
import { SESSION_ID, ACCESS_TOKEN } from '../constants'

export async function getDetails(mapboxId: string) {
  const res = await fetch(
    `https://api.mapbox.com/search/details/v1/retrieve/${mapboxId}?access_token=${ACCESS_TOKEN}&session_token=${SESSION_ID}&attribute_sets=basic,venue,visit,photos`
  )
  const body = await res.json()
  return body
}
