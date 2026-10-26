import { useEffect, useState } from 'react'

import { nearestPhoto, type StreetPhoto } from '../lib/kartaview'

/**
 * The KartaView 360° photo nearest a point: `undefined` while asking, `null`
 * when there is none (or KartaView failed). The lookup is usually already
 * under way, since selecting a listing starts it — see SelectionProvider.
 */
export function useStreetPhoto(point: [number, number]) {
  const [result, setResult] = useState<{
    point: [number, number]
    photo: StreetPhoto | null
  } | null>(null)

  useEffect(() => {
    let live = true
    nearestPhoto(point).then(
      (photo) => live && setResult({ point, photo }),
      () => live && setResult({ point, photo: null })
    )
    return () => {
      live = false
    }
  }, [point])

  return result?.point === point ? result.photo : undefined
}
