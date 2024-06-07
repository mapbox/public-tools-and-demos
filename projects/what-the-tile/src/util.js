import bbox from '@turf/bbox'

export const addWTTSourcesAndLayers = (mapRef) => {
  mapRef.current.addSource('tiles-geojson', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  mapRef.current.addSource('tiles-centers-geojson', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  mapRef.current.addSource('user-loaded-geojson', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  mapRef.current.addLayer({
    id: 'tiles',
    source: 'tiles-geojson',
    type: 'line',
    paint: {
      'line-color': '#000'
    }
  })

  mapRef.current.addLayer({
    id: 'tiles-shade',
    source: 'tiles-geojson',
    type: 'fill',
    paint: {
      'fill-color': [
        'case',
        ['get', 'even'],
        'rgba(0,0,0,0.1)',
        'rgba(0,0,0,0)'
      ]
    }
  })

  mapRef.current.addLayer({
    id: 'tiles-centers',
    source: 'tiles-centers-geojson',
    type: 'symbol',
    layout: {
      'text-field': ['format', ['get', 'text'], { 'font-scale': 1.2 }],
      'text-offset': [0, -1]
    },
    paint: {
      'text-color': '#000',
      'text-color-transition': {
        duration: 0
      },
      'text-halo-color': '#fff',
      'text-halo-width': 0.5
    }
  })

  mapRef.current.addLayer({
    id: 'user-loaded-fill',
    source: 'user-loaded-geojson',
    type: 'fill',
    paint: {
      'fill-color': 'red',
      'fill-opacity': 0.3
    }
  })

  mapRef.current.addLayer({
    id: 'user-loaded-outline',
    source: 'user-loaded-geojson',
    type: 'line',
    paint: {
      'line-width': 2,
      'line-color': 'red'
    }
  })
}

export const geojsonDropper = (document, mapRef) => {
  function dragLeaveHandler(e) {
    if (e) e.preventDefault()
    document.getElementById('geojsonDrop').style.color = '#CCC'
    document.getElementById('geojsonDrop').style.borderColor = ''
  }

  document.getElementById('geojsonDrop').ondrop = function dropHandler(e) {
    // do not load the file raw into the page
    e.stopPropagation()
    e.preventDefault()

    // Use DataTransferItemList interface to access the file(s)
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (e.dataTransfer.items[i].kind === 'file') {
        let file = e.dataTransfer.items[i].getAsFile()
        var reader = new FileReader()

        // Closure to capture the file information.
        reader.onload = (loadedFile) => {
          const loadedGeoJSON = JSON.parse(loadedFile.target.result)

          mapRef.current.getSource('user-loaded-geojson').setData({
            type: 'FeatureCollection',
            features: loadedGeoJSON.features
          })

          const bounds = bbox(loadedGeoJSON)
          mapRef.current.fitBounds(
            [
              [bounds[0], bounds[1]],
              [bounds[2], bounds[3]]
            ],
            { padding: 20 }
          )

          // reset the load box
          dragLeaveHandler()
        }
        reader.readAsText(file)
      }
    }
  }

  document.getElementById('geojsonDrop').ondragover = function dragOverHandler(
    e
  ) {
    e.preventDefault()
    document.getElementById('geojsonDrop').style.color = 'black'
    document.getElementById('geojsonDrop').style.borderColor = '#4264FB'
  }

  document.getElementById('geojsonDrop').ondragleave = (e) => {
    dragLeaveHandler(e)
  }
}
