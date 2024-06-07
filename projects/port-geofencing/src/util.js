import { multiPolygon } from '@turf/helpers'
import pointsWithinPolygon from '@turf/points-within-polygon'
import booleanWithin from '@turf/boolean-within'

export const finlandDataFetch = async (portBoundaries, finlandEezGeojson) => {
  let finlandVesselsGeojson = await fetch(
    'https://meri.digitraffic.fi/api/ais/v1/locations'
  ).then((res) => res.json())

  // combine the ports polygons into a multipolygon so we only have to intersect once
  const portsMultiPolygon = multiPolygon([
    portBoundaries.features[0].geometry.coordinates,
    portBoundaries.features[1].geometry.coordinates,
    portBoundaries.features[2].geometry.coordinates,
    portBoundaries.features[3].geometry.coordinates,
    portBoundaries.features[4].geometry.coordinates,
    portBoundaries.features[5].geometry.coordinates,
    portBoundaries.features[6].geometry.coordinates
  ])

  const categorizedVessels = finlandVesselsGeojson.features.map((feature) => {
    if (booleanWithin(feature, finlandEezGeojson.features[0])) {
      feature.properties.area = 'eez'
    }
    if (booleanWithin(feature, portsMultiPolygon)) {
      feature.properties.area = 'port'
    }
    return feature
  })

  var ptsWithineez = pointsWithinPolygon(
    finlandVesselsGeojson,
    finlandEezGeojson
  )

  var helsinkiGeojson = pointsWithinPolygon(
    finlandVesselsGeojson,
    portBoundaries.features[0]
  )

  var kotkaGeojson = pointsWithinPolygon(
    finlandVesselsGeojson,
    portBoundaries.features[1]
  )

  var turkuGeojson = pointsWithinPolygon(
    finlandVesselsGeojson,
    portBoundaries.features[2]
  )

  var haminaGeojson = pointsWithinPolygon(
    finlandVesselsGeojson,
    portBoundaries.features[3]
  )

  var raumaGeojson = pointsWithinPolygon(
    finlandVesselsGeojson,
    portBoundaries.features[4]
  )

  var poriGeojson = pointsWithinPolygon(
    finlandVesselsGeojson,
    portBoundaries.features[5]
  )

  var ouluGeojson = pointsWithinPolygon(
    finlandVesselsGeojson,
    portBoundaries.features[6]
  )

  var isoDateString = new Date().toISOString()

  const totalFC = {
    type: 'FeatureCollection',
    features: categorizedVessels
  }
  return {
    time: isoDateString,
    total: totalFC,
    eez: ptsWithineez,
    helsinki: helsinkiGeojson,
    kotka: kotkaGeojson,
    turku: turkuGeojson,
    hamina: haminaGeojson,
    rauma: raumaGeojson,
    pori: poriGeojson,
    oulu: ouluGeojson
  }
}

export const addSourcesAndLayers = (mapRef, portBoundaries, portLabels) => {
  mapRef.current.loadImage('/port-geofencing/img/boat.png', (error, image) => {
    if (error) throw error
    mapRef.current.addImage('boat', image, {
      pixelRatio: 6,
      sdf: true
    })
  })

  const dummyFC = { type: 'FeatureCollection', features: [] }

  mapRef.current.addSource('portBoundaries', {
    type: 'geojson',
    attribution: 'Kestrel Insights',
    data: portBoundaries
  })

  mapRef.current.addSource('portLabels', {
    type: 'geojson',
    data: portLabels
  })

  mapRef.current.addSource('finlandeez', {
    type: 'geojson',
    attribution: 'Flanders Marine Institute (2019) | marineregions.org',
    data: dummyFC
  })

  mapRef.current.addSource('allvessels', {
    type: 'geojson',
    attribution: 'digitraffic.fi',
    data: dummyFC
  })

  mapRef.current.addLayer({
    id: 'portBoundaries',
    type: 'fill',
    source: 'portBoundaries',
    layout: {},
    paint: {
      'fill-color': '#0000ff',
      'fill-opacity': 0.25
    }
  })

  mapRef.current.addLayer({
    id: 'portBoundariesoutline',
    type: 'line',
    source: 'portBoundaries',
    layout: {},
    paint: {
      'line-color': '#0000ff',
      'line-width': 1,
      'line-dasharray': [1, 3]
    }
  })

  mapRef.current.addLayer({
    id: 'portLabels',
    type: 'symbol',
    source: 'portLabels',
    minzoom: 4.99,
    layout: {
      'text-size': 14,
      'text-field': ['get', 'Name'],
      'text-allow-overlap': true
    },
    paint: {
      'text-color': '#0000FF',
      'text-opacity': 1,
      'text-halo-color': '#FFFFFF',
      'text-halo-width': 1,
      'text-translate': [0, -15]
    }
  })

  mapRef.current.addLayer({
    id: 'finlandeezoutline',
    type: 'line',
    source: 'finlandeez',
    layout: {},
    paint: {
      'line-color': '#94b9ff',
      'line-width': 1,
      'line-dasharray': [1, 1]
    }
  })

  mapRef.current.addLayer({
    id: 'finlandeez',
    type: 'fill',
    source: 'finlandeez',
    layout: {},
    paint: {
      'fill-color': '#94b9ff',
      'fill-opacity': 0.3
    }
  })

  mapRef.current.addLayer({
    id: 'allvessels',
    type: 'symbol',
    source: 'allvessels',
    layout: {
      'icon-size': [
        'interpolate',
        ['linear'],
        ['zoom'],
        5,
        1.5,
        8,
        4,
        10,
        5,
        20,
        16
      ],
      'icon-image': 'boat',
      'icon-rotate': ['to-number', ['get', 'heading']],
      'icon-allow-overlap': true
    },
    paint: {
      'icon-color': [
        'match',
        ['get', 'area'],
        'eez',
        '#94b9ff',
        'port',
        '#0000FF',
        '#FFF'
      ],
      'icon-opacity': 1,
      'icon-halo-color': '#545454',
      'icon-halo-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        5,
        5,
        8,
        20,
        10,
        30,
        20,
        40
      ]
    }
  })
}
