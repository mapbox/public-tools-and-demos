import {
  parseString,
  denormalise,
  toPolylines,
  toSVG
} from '@alexander-belokon/dxf/src'
import { lineString, polygon } from '@turf/turf'
import uuid from './uuid'

function DXFDocument(file, id) {
  this.file = file
  this.name = ''
  this.parsed = undefined
  this.entities = undefined
  this.svg = undefined
  this.map = undefined
  this.transform = {
    rotation: 0,
    scale: { x: 1, y: 1 },
    translation: { x: 0, y: 0 },
    anchor: { x: 0, y: 0 }
  }
  this.opacity = 75
  this.loaded = false
  this.id = id || uuid()
  this.visible = true
  this.pinned = false
  this.mapStateWhenPinned = undefined
  this.mapLayers = undefined
  this.geojson = undefined
}

DXFDocument.prototype = {
  load: function (callback) {
    this._parse((err, result) => {
      if (err) return callback(err)

      this.parsed = parseString(result)
      var allLayers = this.parsed.entities.map((e) => {
        return e.layer
      })
      this.layers = allLayers.filter((item, i, arr) => {
        return arr.indexOf(item) === i
      })

      this.name = this.file.name
      this.loaded = true
      callback(null, this)
    })
  },
  filterLayers: function (layersToKeep) {
    this.parsed.entities = this.parsed.entities.filter((e) => {
      return layersToKeep.indexOf(e.layer) !== -1
    })
  },
  generateSVG: function () {
    this.entities = denormalise(this.parsed)
    this.svg = toSVG(this.parsed)

    // TODO: Add additional style info to SVG
  },
  _parse: function (callback) {
    try {
      var reader = new FileReader()
      reader.readAsText(this.file)
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          // Success
          callback(null, e.target.result)
          return
        }
        callback('File could not be loaded.')
      }

      reader.onerror = () => {
        callback('File could not be loaded.')
      }
    } catch (e) {
      callback('File could not be loaded.')
    }
  },

  getGeoreferencedGeoJSON: function (transform, map) {
    var collection = { type: 'FeatureCollection', features: [] }

    const { polylines, bbox } = toPolylines(this.parsed)

    let unprojected = polylines
      .map((d, i) => {
        const entity = this.parsed.entities[i]
        if (!entity) return null
        const { type } = entity

        // There are some DXF features that `dxf` doesn't really understand, like inserts of blocks.
        // These will cause `turf` to throw an exception because vertices is then empty.
        // It's better to salvage what we can instead of failing to process the whole document
        if (!d.vertices || !d.vertices.length) {
          console.error(`Unsupported DXF entity ${i}: ${type}`, entity)
          return
        }

        if (['LINE', 'POLYLINE', 'LWPOLYLINE'].includes(type)) {
          return lineString(d.vertices)
        }

        if (type === 'SPLINE') {
          return polygon([d.vertices])
        }
        console.warn(`Skipped nsupported DXF entity type: ${type}`)

        return null
      })
      .filter((d) => d !== null)

    unprojected = unprojected.filter((f) => {
      if (f === undefined) return false

      var onlyGoodPoints = true
      var rings =
        f.geometry.type === 'Polygon'
          ? f.geometry.coordinates
          : f.geometry.type === 'LineString'
          ? [f.geometry.coordinates]
          : [[f.geometry.coordinates]]
      rings.forEach((r) => {
        r.forEach((p) => {
          if (!onlyGoodPoints) return
          if (
            isNaN(p[0]) ||
            isNaN(p[1]) ||
            p[0] === Infinity ||
            p[1] === Infinity ||
            p[0] === -Infinity ||
            p[1] === -Infinity
          )
            onlyGoodPoints = false
        })
      })

      return onlyGoodPoints
    })

    // Calculate bounding box in a way that mirrors the SVG generation of the DXF library
    unprojected.forEach((f) => {
      var rings =
        f.geometry.type === 'Polygon'
          ? f.geometry.coordinates
          : f.geometry.type === 'LineString'
          ? [f.geometry.coordinates]
          : [[f.geometry.coordinates]]
      rings.forEach((r) => {
        r.forEach((p) => {
          bbox.expandByPoint({
            x: p[0],
            y: p[1]
          })
        })
      })
    })

    var innerWidth = transform.dimensions.svgWidth // - (this._transform.padding * 2) - 1;
    var innerHeight = transform.dimensions.svgHeight // - (this._transform.padding * 2) - 1;

    const rotationRad = (transform.rotation * Math.PI) / 180

    var screenTransformed = unprojected.map((f) => {
      var rings =
        f.geometry.type === 'Polygon'
          ? f.geometry.coordinates
          : f.geometry.type === 'LineString'
          ? [f.geometry.coordinates]
          : [[f.geometry.coordinates]]
      rings.forEach((r) => {
        r = r.forEach((coord) => {
          // 1. Convert coordinates into normalized position within viewbox
          coord[0] =
            (coord[0] - transform.dimensions.viewBox.x) /
            transform.dimensions.viewBox.width
          coord[1] =
            -(coord[1] - -transform.dimensions.viewBox.y) /
            transform.dimensions.viewBox.height

          // 2. Re-center at midpoint
          coord[0] -= 0.5
          coord[1] -= 0.5

          // 3. Scale to SVG DOM size
          coord[0] *= innerWidth
          coord[1] *= -innerHeight

          // 4. Scale coordinates
          coord[0] *= transform.scale.x
          coord[1] *= transform.scale.y

          // 5. Rotate coordinates
          var rot = []
          rot[0] =
            coord[0] * Math.cos(rotationRad) + coord[1] * Math.sin(rotationRad)
          rot[1] =
            coord[0] * Math.sin(rotationRad) - coord[1] * Math.cos(rotationRad)
          coord[0] = rot[0]
          coord[1] = rot[1]

          // 6. Translate coordinates
          coord[0] += transform.translation.x + innerWidth / 2
          coord[1] += transform.translation.y + innerHeight / 2

          // 7. Account for padding
          coord[0] += transform.padding
          coord[1] += transform.padding
        })
        return r
      })

      //feat.geometry.coordinates === "SOLID" ? rings : rings[0];
      return f
    })

    var projected = screenTransformed.map((f) => {
      var rings =
        f.geometry.type === 'Polygon'
          ? f.geometry.coordinates
          : f.geometry.type === 'LineString'
          ? [f.geometry.coordinates]
          : [[f.geometry.coordinates]]
      rings.forEach((r) => {
        r = r.forEach((coord) => {
          var p = map.unproject(coord)
          coord[0] = p.lng
          coord[1] = p.lat

          return coord
        })
        return r
      })

      //feat.geometry.coordinates === "SOLID" ? rings : rings[0];
      return f
    })

    collection.features = projected

    return collection
  }
}

export default DXFDocument
