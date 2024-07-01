import { useRef, useState } from 'react'
import { ExternalLink, FullscreenMapLayout, Map } from 'mapbox-demo-components'
import { addWTTSourcesAndLayers, geojsonDropper } from './util'
import ControlText from '@mapbox/mr-ui/control-text'

import mapboxgl from 'mapbox-gl'
import tilebelt from '@mapbox/tilebelt'
import cover from '@mapbox/tile-cover'
import area from '@turf/area'

import '@mapbox/mbx-assembly/dist/assembly.js'
import '@mapbox/mbx-assembly/dist/assembly.css'

// global to manage markers added to the map
const ALL_MARKERS = []
let tiles

function App() {
  const mapRef = useRef(null)
  const [quadkey, setQuadkey] = useState('')
  const [coords, setCoords] = useState('')

  const onMapLoad = () => {
    addWTTSourcesAndLayers(mapRef)

    updateTiles()

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    document.getElementsByClassName(
      'px12 py12 block none-ml hmax240 overflow-scroll'
    )[0].style.display = 'block !important'

    geojsonDropper(document, mapRef)
  }

  const onMapClick = (e) => {
    var features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ['tiles-shade']
    })
    copyToClipboard(features[0].properties.quadkey)
    showSnackbar()
  }

  function updateTiles() {
    var extentsGeom = getExtentsGeom()
    var zoom = Math.ceil(mapRef.current.getZoom())
    tiles = cover.tiles(extentsGeom, { min_zoom: zoom, max_zoom: zoom })

    mapRef.current.getSource('tiles-geojson').setData({
      type: 'FeatureCollection',
      features: tiles.map(getTileFeature)
    })

    mapRef.current.getSource('tiles-centers-geojson').setData({
      type: 'FeatureCollection',
      features: tiles.map(getTileCenterFeature)
    })
  }

  function getExtentsGeom() {
    var e = mapRef.current.getBounds()
    var box = [
      e.getSouthWest().toArray(),
      e.getNorthWest().toArray(),
      e.getNorthEast().toArray(),
      e.getSouthEast().toArray(),
      e.getSouthWest().toArray()
    ].map((coords) => {
      if (coords[0] < -180) return [-179.99999, coords[1]]
      if (coords[0] > 180) return [179.99999, coords[1]]
      return coords
    })

    return {
      type: 'Polygon',
      coordinates: [box]
    }
  }

  function getTileFeature(tile) {
    var quadkey = tilebelt.tileToQuadkey(tile)

    var feature = {
      type: 'Feature',
      properties: {
        even: (tile[0] + tile[1]) % 2 == 0,
        quadkey: quadkey
      },
      geometry: tilebelt.tileToGeoJSON(tile)
    }
    return feature
  }

  function getTileCenterFeature(tile) {
    var box = tilebelt.tileToBBOX(tile)
    var center = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2]

    var quadkey = tilebelt.tileToQuadkey(tile)
    var tileArea = area(tilebelt.tileToGeoJSON(tile)) // area in sq meters

    var areaSqKm = tileArea / 1000 ** 2
    var areaString = ''
    if (areaSqKm > 1) {
      areaString = Math.round(areaSqKm, 2).toLocaleString() + 'sq km'
    } else {
      areaString =
        Math.round(areaSqKm * 1000000, 2).toLocaleString() + ' sq meters'
    }

    return {
      type: 'Feature',
      properties: {
        text:
          'Tile (x,y,z): ' +
          JSON.stringify(tile) +
          '\nQuadkey: ' +
          quadkey +
          '\nZoom: ' +
          tile[2] +
          '\nArea: ' +
          areaString,
        quadkey: quadkey
      },
      geometry: {
        type: 'Point',
        coordinates: center
      }
    }
  }

  function clear_all_markers() {
    ALL_MARKERS.forEach((ea) => ea.remove())
    ALL_MARKERS.length = 0
  }

  function copyToClipboard(str) {
    const el = document.createElement('textarea')
    el.value = str
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }

  function showSnackbar() {
    var x = document.getElementById('snackbar')
    x.className = 'show'
    setTimeout(function () {
      x.className = x.className.replace('show', '')
    }, 2000)
  }

  function showBadQK() {
    var x = document.getElementById('badqk')
    x.className = 'show'
    setTimeout(function () {
      x.className = x.className.replace('show', '')
    }, 2000)
  }

  function showBadCoords() {
    var x = document.getElementById('badcoords')
    x.className = 'show'
    setTimeout(function () {
      x.className = x.className.replace('show', '')
    }, 2000)
  }

  const handleQuadkeyKeyDown = (e) => {
    if (e.key !== 'Enter') return

    // eslint-disable-next-line
    var reg =
      /[a-zA-Z4-9\!\@\#\$\%\^\*\_\|\-\=\+\[\]\(\)\*\&\^\?\<\>\,\.\;\:\'\"\{\}\/\\\`\~]/
    if (reg.test(quadkey)) {
      showBadQK()
    } else {
      // convert qk to a tile to leverage helper func
      const qkGeo = tilebelt.tileToGeoJSON(tilebelt.quadkeyToTile(quadkey))

      // move map viewport around the new tile
      mapRef.current.fitBounds(
        [qkGeo.coordinates[0][0], qkGeo.coordinates[0][2]],
        { padding: 134 }
      )
    }
  }

  const handleCoordsKeydown = (e) => {
    if (e.key !== 'Enter') return

    const coordsCleaned = coords.replace(/\(|\)|\[|\]/g, '')
    if (!coordsCleaned.includes(',')) {
      showBadCoords()
    }
    const coordsAsNums = coordsCleaned.split(',').map((ea) => Number(ea))
    if (
      coordsAsNums[0] < -180 ||
      coordsAsNums[0] > 180 ||
      coordsAsNums[1] < -90 ||
      coordsAsNums[1] > 90 ||
      coordsAsNums.length != 2
    ) {
      showBadCoords()
    } else {
      // first remove any marker already on the map
      clear_all_markers()

      // add a marker to the map
      const newMarker = new mapboxgl.Marker()
        .setLngLat([coordsAsNums[0], coordsAsNums[1]])
        .addTo(mapRef.current)
      ALL_MARKERS.push(newMarker)

      // move map viewport around the new coordinates
      mapRef.current.flyTo({
        center: [coordsAsNums[0], coordsAsNums[1]],
        zoom: 15,
        maxDuration: 1000
      })
    }
  }

  return (
    <div className='App h-viewport-full'>
      <FullscreenMapLayout
        headerProps={{
          title: 'What the Tile?',
          githubLink:
            'https://github.com/mapbox/public-tools-and-demos/tree/main/projects/what-the-tile'
        }}
        mapComponent={
          <Map
            center={[-98, 39.8]}
            zoom={3}
            style='mapbox://styles/mapbox/light-v11'
            addNavigationControl={false}
            onMapLoad={onMapLoad}
            onMapMoveend={updateTiles}
            onMapClick={onMapClick}
            ref={mapRef}
            projection='mercator'
            addGeocoder
          ></Map>
        }
      >
        <div className='px12 py12 scroll-auto txt-m'>
          <div className='mb6 txt-m'>
            <b>Explore Mapbox Tile Addresses</b>
          </div>
          <div className='mb6 txt-s'>
            Modern digital maps are composed of vector or raster tiles, square
            sections of data that represent a specific portion of the earth.
            With this tool you can quickly see which tiles are in view for any
            zoom level and map extent. You can also view each{' '}
            <ExternalLink to='https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/#vector-scheme'>
              tile&apos;s address
            </ExternalLink>
            ,{' '}
            <ExternalLink to='https://docs.mapbox.com/data/movement/guides/data-format/#quadkeys'>
              quadkey
            </ExternalLink>
            ,{' '}
            <ExternalLink to='https://docs.mapbox.com/help/glossary/zoom-level/'>
              zoom level
            </ExternalLink>
            , and area.
          </div>
          <div className='mb6 txt-s'>
            Use the input fields to search for a quadkey or coordinates, or
            upload a GeoJSON.{' '}
          </div>
          <div className='w-full mb12'>
            <ControlText
              id='quadkey'
              label='Quad Key'
              value={quadkey}
              onChange={(d) => {
                setQuadkey(d)
              }}
              placeholder='Enter a quadkey'
              onKeyDown={handleQuadkeyKeyDown}
            />
          </div>
          <div className='w-full mb12'>
            <ControlText
              id='coords'
              label='Coordinates'
              value={coords}
              onChange={(d) => {
                setCoords(d)
              }}
              placeholder='longitude, latitude'
              onKeyDown={handleCoordsKeydown}
            />
          </div>
          <hr className='txt-hr'></hr>
          <div id='geojsonDrop'>
            <div className='mbx-text flex flex--center-cross flex--center-main h-full'>
              <div>Drag & drop a GeoJSON here.</div>
            </div>
          </div>
          <hr className='txt-hr'></hr>
          <div className='mb6 txt-s'>
            Inspired by Benjamin Tran Dinh&apos;s original{' '}
            <ExternalLink to='https://github.com/benjamintd/what-the-tile'>
              &quot;What the Tile?&quot;
            </ExternalLink>
            .
          </div>
        </div>
      </FullscreenMapLayout>
    </div>
  )
}

export default App
