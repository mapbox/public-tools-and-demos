const addSourcesAndLayers = (map) => {
  map.addSource('isoA', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  map.addLayer(
    {
      id: 'isoLayerA',
      type: 'fill',
      source: 'isoA',
      layout: {},
      paint: {
        'fill-color': 'yellow',
        'fill-opacity': 0.3
      }
    },
    'poi-label'
  )

  map.addSource('isoB', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  map.addLayer(
    {
      id: 'isoLayerB',
      type: 'fill',
      source: 'isoB',
      layout: {},
      paint: {
        'fill-color': 'lightblue',
        'fill-opacity': 0.3
      }
    },
    'poi-label'
  )

  // Add a source and layer for the intersection result
  map.addSource('intersection', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  map.addLayer({
    id: 'meet-me',
    type: 'line',
    source: 'intersection',
    layout: {},
    paint: {
      'line-color': '#ffffff',
      'line-opacity': 0.7,
      'line-width': 2
    }
  })

  map.addSource('places', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  map.addLayer({
    id: 'meet-here',
    type: 'symbol',
    source: 'places',
    layout: {
      'icon-allow-overlap': true
    },
    paint: {}
  })
}

export default addSourcesAndLayers
