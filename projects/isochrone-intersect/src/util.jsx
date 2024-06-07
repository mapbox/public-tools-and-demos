import tBuffer from '@turf/buffer'
import tIntersect from '@turf/intersect'
import tBbox from '@turf/bbox'
import tCenter from '@turf/center'
import tPointsWithinPolygon from '@turf/points-within-polygon'
import tArea from '@turf/area'

import { accessToken } from 'mapbox-demo-components'

const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/'

export const getArea = (feature) => {
  return (tArea(feature) / 2.59e6).toFixed(1)
}

export const getIntersection = (isos) => {
  // This buffer may fix the intersection topology problem
  const isoBuffA = tBuffer(isos.a.features[0], 0.001)
  const isoBuffB = tBuffer(isos.b.features[0], 0.001)

  return tIntersect(isoBuffA, isoBuffB)
}

export const getPlaces = (area, category) => {
  const bbox = tBbox(area)
  const center = tCenter(area)
  const placesUrl =
    'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
    category +
    '.json?access_token=' +
    accessToken +
    '&types=poi&bbox=' +
    bbox.join(',') +
    '&proximity=' +
    center.geometry.coordinates.join(',') +
    '&limit=10'
  return fetch(placesUrl)
    .then((res) => res.json())
    .then((places) => {
      for (let i = 0; i < places.features.length; i++) {
        places.features[i].properties.name = places.features[i].text
      }
      return tPointsWithinPolygon(places, area)
    })
}

// Get a single isochrone for a given position and return the GeoJSON
const fetchIso = function (position, profile, duration) {
  // Build the URL for the isochrone API
  const isoUrl =
    urlBase +
    profile +
    position.join(',') +
    '?contours_minutes=' +
    duration +
    '&polygons=true&access_token=' +
    accessToken

  // Return the GeoJSON
  return fetch(isoUrl).then((res) => res.json())
}

export const fetchIsos = async (origins, profile, duration) => {
  const isochroneA = fetchIso(origins.a, profile, duration)
  const isochroneB = fetchIso(origins.b, profile, duration)

  // Once the isochrones are received, update state
  return Promise.all([isochroneA, isochroneB])
}
