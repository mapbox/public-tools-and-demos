import { useState, useEffect, useCallback } from 'react'
import type { NeighborhoodFeatureProps } from '../types'

const GEOJSON_URL =
  'https://raw.githubusercontent.com/chriswhong/nyc-neighborhood-boundaries/main/dist/nyc-neighborhood-boundaries.geojson'

export type NeighborhoodIndex = Map<string, NeighborhoodFeatureProps>

export function useNeighborhoodData() {
  const [index, setIndex] = useState<NeighborhoodIndex>(new Map())
  const [features, setFeatures] = useState<Map<string, GeoJSON.Feature>>(new Map())

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then((geojson: GeoJSON.FeatureCollection) => {
        const propsMap = new Map<string, NeighborhoodFeatureProps>()
        const featMap = new Map<string, GeoJSON.Feature>()
        for (const feature of geojson.features) {
          const props = feature.properties as NeighborhoodFeatureProps
          if (props?.name) {
            const key = props.name.toLowerCase()
            propsMap.set(key, props)
            featMap.set(key, feature)
          }
        }
        setIndex(propsMap)
        setFeatures(featMap)
      })
      .catch(console.error)
  }, [])

  /** Return a [west, south, east, north] bounding box for a set of neighborhood names. */
  const getBounds = useCallback((names: string[]): [[number, number], [number, number]] | null => {
    let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity

    for (const name of names) {
      const feature = features.get(name.toLowerCase())
      if (!feature) continue

      const geom = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
      const rings: number[][][] =
        geom.type === 'Polygon'
          ? geom.coordinates
          : geom.coordinates.flat()

      for (const ring of rings) {
        for (const [lng, lat] of ring) {
          if (lng < w) w = lng
          if (lat < s) s = lat
          if (lng > e) e = lng
          if (lat > n) n = lat
        }
      }
    }

    return isFinite(w) ? [[w, s], [e, n]] : null
  }, [features])

  return { index, features, getBounds }
}
