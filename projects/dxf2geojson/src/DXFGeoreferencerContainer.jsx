import React from 'react'
import update from 'immutability-helper'
import { FullscreenMapLayout, Map } from 'mapbox-demo-components'

import TransformableSVGContainer from './TransformableSVGContainer'
import GeoreferencerSidebar from './GeoreferencerSidebar'
import DragDropFileHandler from './DragDropFileHandler'
import ModalLayerSelector from './ModalLayerSelector'
import DXFDocument from './DXFDocument'

class DXFGeoreferencerContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      documents: [],
      activeDocument: undefined,
      mapLocked: false,
      map: undefined,
      importingDoc: undefined,
      loadingFile: false,
      documentsGeoJSON: {},
      showUnlockTip: false
    }

    this.setMapLock = this.setMapLock.bind(this)
    this.updateTransform = this.updateTransform.bind(this)
    this.updateOpacity = this.updateOpacity.bind(this)
    this.updateVisibility = this.updateVisibility.bind(this)
    this.setMapLayerVisibility = this.setMapLayerVisibility.bind(this)
    this.showUnlockTip = this.showUnlockTip.bind(this)
    this.dropFile = this.dropFile.bind(this)
    this.importFile = this.importFile.bind(this)
    this.updateLayerImport = this.updateLayerImport.bind(this)
    this.finishImport = this.finishImport.bind(this)
    this.cancelImport = this.cancelImport.bind(this)
    this.addDocument = this.addDocument.bind(this)
    this.removeDocument = this.removeDocument.bind(this)
    this.pinDocument = this.pinDocument.bind(this)
    this.unpinDocument = this.unpinDocument.bind(this)
    this.getDocByID = this.getDocByID.bind(this)
    this.fileError = this.fileError.bind(this)
    this.mapIsReady = this.mapIsReady.bind(this)
    this.selectDocument = this.selectDocument.bind(this)
    this.updateCombinedGeoJSON = this.updateCombinedGeoJSON.bind(this)
  }

  setMapLock(locked, doc) {
    doc = doc || this.getDocByID(this.state.activeDocument)
    this.setState({ mapLocked: locked })
    if (!locked && !doc.pinned) {
      this.setState({ activeDocument: undefined })
    }
  }
  updateTransform(doc, transform) {
    const index = this.state.documents.indexOf(doc)
    if (index === -1) return

    const updatedDocs = update(this.state.documents, {
      [index]: { transform: { $set: transform } }
    })
    this.setState({ documents: updatedDocs })
  }
  updateOpacity(doc, opacity) {
    const index = this.state.documents.indexOf(doc)
    if (index === -1) return

    const updatedDocs = update(this.state.documents, {
      [index]: { opacity: { $set: opacity } }
    })
    this.setState({ documents: updatedDocs })
  }
  updateVisibility(doc, visible) {
    const index = this.state.documents.indexOf(doc)
    if (index === -1) return

    const updatedDocs = update(this.state.documents, {
      [index]: { visible: { $set: visible } }
    })
    this.setState({ documents: updatedDocs })

    this.setMapLayerVisibility(doc, visible)
  }
  setMapLayerVisibility(doc, visible) {
    // Update map style layers
    for (var layer in doc.mapLayers) {
      this.state.map.setLayoutProperty(
        doc.mapLayers[layer].id,
        'visibility',
        visible ? 'visible' : 'none'
      )
    }
  }
  showUnlockTip(b) {
    this.setState({ showUnlockTip: b })
    if (b)
      window.setTimeout(() => {
        this.showUnlockTip(false)
      }, 20000)
  }
  dropFile() {
    this.setState({ loadingFile: true })
  }
  importFile(file) {
    const doc = new DXFDocument(file)
    doc.load((err) => {
      if (err) return this.fileError(file, err)

      var layers = doc.layers.map((l) => {
        return { layer: l, selected: true }
      })
      this.setState({ loadingFile: false })
      this.setState({ importingDoc: doc, importingLayers: layers })
    })
  }
  updateLayerImport(layer, selected) {
    const updatedLayers = update(this.state.importingLayers, {
      [layer]: { selected: { $set: selected } }
    })
    this.setState({ importingLayers: updatedLayers })
  }
  finishImport() {
    const layersToKeep = this.state.importingLayers
      .filter((l) => {
        return l.selected
      })
      .map((l) => {
        return l.layer
      })
    var doc = this.state.importingDoc
    doc.filterLayers(layersToKeep)
    doc.generateSVG()
    this.addDocument(doc)
    this.setState({ importingDoc: null })
  }
  cancelImport() {
    this.setState({ importingDoc: null })
  }
  addDocument(doc) {
    if (this.state.documents.length === 0) {
      this.showUnlockTip(true)
    }

    this.setState({ documents: this.state.documents.concat([doc]) })
    this.selectDocument(doc.id, true)
  }
  removeDocument(doc) {
    const updatedGeoJSON = Object.keys(this.state.documentsGeoJSON).reduce(
      (result, key) => {
        if (key !== doc.id) {
          result[key] = this.state.documentsGeoJSON[key]
        }
        return result
      },
      {}
    )

    this.setState({
      documents: this.state.documents.filter((d) => {
        return d !== doc
      }),
      activeDocument:
        this.state.activeDocument === doc
          ? undefined
          : this.state.activeDocument,
      documentsGeoJSON: updatedGeoJSON
    })

    // Update map style layers
    for (var layer in doc.mapLayers) {
      this.state.map.removeLayer(doc.mapLayers[layer].id)
      this.state.map.removeSource(doc.mapLayers[layer].id)
    }

    this.updateCombinedGeoJSON(updatedGeoJSON)
  }
  pinDocument(doc) {
    const index = this.state.documents.indexOf(doc)
    if (index === -1) return

    const geoJSON = DXFDocument.prototype.getGeoreferencedGeoJSON.call(
      doc,
      doc.transform,
      this.state.map
    )
    const layers = this.createMapLayersForDocument(doc.id)
    this.sendGeoJSONtoLayers(geoJSON, layers)
    this.setMapLayerVisibility(doc, true)

    const updatedDocs = update(this.state.documents, {
      [index]: {
        pinned: { $set: true },
        mapLayers: { $set: layers }
      }
    })

    const updatedGeoJSON = update(this.state.documentsGeoJSON, {
      [doc.id]: { $set: geoJSON }
    })

    // Unlock the map if all documents will be pinned
    var unpinned = 0
    updatedDocs.forEach((d) => {
      if (!d.pinned) unpinned += 1
    })
    if (unpinned === 0) this.setMapLock(false)

    this.setState({ documents: updatedDocs, documentsGeoJSON: updatedGeoJSON })

    this.updateCombinedGeoJSON(updatedGeoJSON)
  }
  unpinDocument(doc) {
    const index = this.state.documents.indexOf(doc)
    if (index === -1) return

    const updatedDocs = update(this.state.documents, {
      [index]: { pinned: { $set: false } }
    })
    this.setState({ documents: updatedDocs })
    this.setMapLock(true)

    this.setMapLayerVisibility(doc, false)

    this.updateCombinedGeoJSON()
  }
  getDocByID(docID) {
    var doc = undefined
    this.state.documents.forEach((d) => {
      if (doc) return
      if (d.id === docID) doc = d
    })
    return doc
  }
  fileError() {
    this.setState({ loadingFile: false, importingDoc: null })
  }
  selectDocument(docID, forceLock) {
    const doc = this.getDocByID(docID)

    this.setState({ activeDocument: docID })
    this.setMapLock(forceLock || !doc.pinned, doc)
  }
  mapIsReady({ target }) {
    this.setState({ map: target })
  }
  updateCombinedGeoJSON(geojson) {
    var documentsGeoJSON = geojson || this.state.documentsGeoJSON

    var combinedGeoJSON = { type: 'FeatureCollection', features: [] }
    for (var id in documentsGeoJSON) {
      if (!documentsGeoJSON[id]) continue
      combinedGeoJSON.features = combinedGeoJSON.features.concat(
        documentsGeoJSON[id].features
      )
    }

    if (combinedGeoJSON.features.length === 0) {
      combinedGeoJSON = undefined
    }

    const blob = new Blob([JSON.stringify(combinedGeoJSON)], {
      type: 'application/json'
    })
    const url = combinedGeoJSON ? URL.createObjectURL(blob) : undefined

    this.setState({
      combinedGeoJSON: combinedGeoJSON,
      combinedGeoJSONURL: url
    })
  }
  render() {
    var modalLayerSelector = undefined
    if (this.state.importingDoc) {
      modalLayerSelector = (
        <ModalLayerSelector
          layers={this.state.importingLayers}
          doc={this.state.importingDoc}
          onUpdateLayer={this.updateLayerImport}
          onImport={this.finishImport}
          onCancel={this.cancelImport}
        />
      )
    }

    var modalLoading = undefined
    if (this.state.loadingFile) {
      modalLoading = (
        <div className='flex flex--center-main flex--center-cross w-full h-full z5 fixed top left bg-darken50'>
          <div className='flex-child loading loading--dark' />
        </div>
      )
    }
    return (
      <>
        <DragDropFileHandler
          onAdd={this.importFile}
          onDrop={this.dropFile}
          onError={this.fileError}
          dropzone={document}
          validExtensions={['dxf']}
        />
        {modalLayerSelector}
        {modalLoading}

        <FullscreenMapLayout
          headerProps={{
            title: 'DXF Mapper'
          }}
          mapComponent={
            <>
              <Map
                // center={center}
                // zoom={zoom}
                onMapLoad={this.mapIsReady}
                // onMapDrag={updatePosition}
                // onMapZoom={updatePosition}
                // onMapRotate={updatePosition}
                // onMapPitch={updatePosition}
                // onMapMoveend={updatePosition}
                // onMapMove={updateTile}
                projection='mercator'
                addGeocoder
                hash
              />
              <TransformableSVGContainer
                documents={this.state.documents}
                onTransform={this.updateTransform}
                onSelect={this.selectDocument}
                activeDocument={this.state.activeDocument}
                id='overlay'
                mapLocked={this.state.mapLocked}
              />
            </>
          }
        >
          <GeoreferencerSidebar
            id='sidebar'
            onSelectDocument={this.selectDocument}
            onDeleteDocument={this.removeDocument}
            onVisibilityChange={this.updateVisibility}
            onOpacityChange={this.updateOpacity}
            onPinDocument={this.pinDocument}
            onUnpinDocument={this.unpinDocument}
            documents={this.state.documents}
            activeDocument={this.state.activeDocument}
            mapLocked={this.state.mapLocked}
            setMapLock={this.setMapLock}
            geoJSONURL={this.state.combinedGeoJSONURL}
            showUnlockTip={this.state.showUnlockTip}
          />
        </FullscreenMapLayout>
      </>
    )
  }
  sendGeoJSONtoLayers(geojson, layers) {
    // Separate lines and fills onto different layers
    var lines = { type: 'FeatureCollection', features: [] }
    var fills = { type: 'FeatureCollection', features: [] }
    var points = { type: 'FeatureCollection', features: [] }

    geojson.features.forEach(function (f) {
      if (
        f.geometry.type === 'LineString' ||
        f.geometry.type === 'MultiLineString'
      ) {
        lines.features.push(f)
      } else if (
        f.geometry.type === 'Polygon' ||
        f.geometry.type === 'MultiPolygon'
      ) {
        fills.features.push(f)
      } else if (
        f.geometry.type === 'Point' ||
        f.geometry.type === 'MultiPoint'
      ) {
        points.features.push(f)
      }
    })

    layers.line.source.setData(lines)
    layers.fill.source.setData(fills)
    layers.stroke.source.setData(fills)
    layers.point.source.setData(points)
  }
  createMapLayersForDocument(prefix) {
    var fillID = prefix + '-fill'
    var strokeID = prefix + '-fill-stroke'
    var lineID = prefix + '-line'
    var pointID = prefix + '-point'

    if (this.state.map.getLayer(fillID) === undefined) {
      this.state.map.addLayer({
        id: fillID,
        type: 'fill',
        source: {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          maxzoom: 24
        },
        paint: {
          'fill-color': 'rgba(0,161,189,0.25)',
          'fill-opacity': 1
        }
      })
    }

    if (this.state.map.getLayer(lineID) === undefined) {
      this.state.map.addLayer({
        id: lineID,
        type: 'line',
        source: {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          maxzoom: 24
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-width': {
            stops: [
              [0, 1],
              [12, 2]
            ]
          },
          'line-color': 'rgb(0,161,189)'
        }
      })
    }

    if (this.state.map.getLayer(strokeID) === undefined) {
      this.state.map.addLayer({
        id: strokeID,
        type: 'line',
        source: {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          maxzoom: 24
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-width': {
            stops: [
              [0, 1],
              [12, 2]
            ]
          },
          'line-color': 'rgb(0,161,189)'
        }
      })
    }

    if (this.state.map.getLayer(pointID) === undefined) {
      this.state.map.addLayer({
        id: pointID,
        type: 'circle',
        source: {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          maxzoom: 24
        },
        paint: {
          'circle-color': '#D9F7FC',
          'circle-opacity': 0.75,
          'circle-radius': 2
        }
      })
    }

    return {
      fill: {
        layer: this.state.map.getLayer(fillID),
        source: this.state.map.getSource(fillID),
        id: fillID
      },
      stroke: {
        layer: this.state.map.getLayer(strokeID),
        source: this.state.map.getSource(strokeID),
        id: strokeID
      },
      line: {
        layer: this.state.map.getLayer(lineID),
        source: this.state.map.getSource(lineID),
        id: lineID
      },
      point: {
        layer: this.state.map.getLayer(pointID),
        source: this.state.map.getSource(pointID),
        id: pointID
      }
    }
  }
}

export default DXFGeoreferencerContainer
