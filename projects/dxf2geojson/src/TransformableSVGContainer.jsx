import React from 'react'
import update from 'immutability-helper'

import TransformableSVG from './TransformableSVG'

class TransformableSVGContainer extends React.Component {
  constructor(props) {
    super(props)

    this.docElements = {}

    this.state = {
      interactionState: 'static',
      dragStart: null,
      scaleStart: null,
      rotationStart: null,
      dragZone: null,
      lastMouseDrag: null,
      activeEl: null
    }

    this.ref = React.createRef()

    this.docIsReady = this.docIsReady.bind(this)
    this.setDragZone = this.setDragZone.bind(this)
    this.classifyZone = this.classifyZone.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseOver = this.onMouseOver.bind(this)
    this.onMouseOut = this.onMouseOut.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.moveToPointer = this.moveToPointer.bind(this)
    this.scaleToPointer = this.scaleToPointer.bind(this)
    this.rotateToPointer = this.rotateToPointer.bind(this)
    this.getActiveDoc = this.getActiveDoc.bind(this)
    this.getAnchorPoint = this.getAnchorPoint.bind(this)
    this.getDocSize = this.getDocSize.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeDocument !== this.props.activeDocument) {
      if (this.props.activeDocument) {
        // active document changed
        this.setState({
          activeEl: this.docElements[this.props.activeDocument].ref.current
        })
      }
    }

    this.props.documents.forEach((doc) => {
      var isNew = true
      prevProps.documents.forEach((oldDoc) => {
        if (!isNew) return
        if (oldDoc.id === doc.id) isNew = false
      })

      if (isNew) {
        this.docIsReady(doc)
      }
    })
  }
  docIsReady(doc) {
    // Called when a child document element is mounted and rendered and has width/height set
    const anchor = this.getAnchorPoint(doc)
    const size = this.getDocSize(doc)
    const transform = doc.transform
    var updatedTransform = update(transform, {
      anchor: { $set: anchor },
      dimensions: { $set: size },
      padding: { $set: 0 },
      translation: {
        $set: {
          x: document.body.clientWidth / 2 + 180 - size.svgWidth / 2,
          y: document.body.clientHeight / 2 - size.svgHeight / 2
        }
      }
    })

    this.props.onTransform(doc, updatedTransform)
  }

  setDragZone(z) {
    this.setState({ dragZone: z })
  }
  classifyZone(e) {
    if (!this.state.activeEl) return

    const transform = this.getActiveDoc().transform

    const buffer = 24 / transform.scale.x
    var left, right, top, bottom, centerVertical, centerHorizontal

    var offsetX = e.nativeEvent.offsetX
    var offsetY = e.nativeEvent.offsetY
    if (e.nativeEvent.target.classList.contains('transform-control-widget')) {
      offsetX += e.nativeEvent.target.offsetLeft
      offsetY += e.nativeEvent.target.offsetTop
    }

    left = offsetX < buffer / 2
    right = offsetX > this.state.activeEl.offsetWidth - buffer
    top = offsetY < buffer
    bottom = offsetY > this.state.activeEl.offsetHeight - buffer
    centerVertical =
      offsetY < this.state.activeEl.offsetHeight / 2 + buffer / 2 &&
      offsetY > this.state.activeEl.offsetHeight / 2 - buffer / 2
    centerHorizontal =
      offsetX < this.state.activeEl.offsetWidth / 2 + buffer / 2 &&
      offsetX > this.state.activeEl.offsetWidth / 2 - buffer / 2

    if (left && top) return { type: 'scaling', corner: 'top-left' }
    else if (right && top) return { type: 'scaling', corner: 'top-right' }
    else if (right && bottom) return { type: 'scaling', corner: 'bottom-right' }
    else if (left && bottom) return { type: 'scaling', corner: 'bottom-left' }
    else if (left && centerVertical) return { type: 'rotating', side: 'left' }
    else if (right && centerVertical) return { type: 'rotating', side: 'right' }
    else if (top && centerHorizontal) return { type: 'rotating', side: 'top' }
    else if (bottom && centerHorizontal)
      return { type: 'rotating', side: 'bottom' }
    else return { type: 'dragging' }
  }
  onMouseDown(e) {
    const dragZone = this.classifyZone(e)
    this.setState({ dragZone: dragZone, interactionState: dragZone.type })

    if (dragZone.type === 'dragging') {
      this.setState({ lastMouseDrag: { x: e.screenX, y: e.screenY } })
    }
    if (dragZone.type === 'scaling') {
      this.setState({ scaleStart: null })
    }
    if (dragZone.type === 'rotating') {
      this.setState({ rotationStart: null })
    }
  }
  onMouseOver() {}
  onMouseOut() {}
  onMouseMove(e) {
    if (e.buttons === 0) return this.onMouseUp(e)

    const dragZone = this.classifyZone(e)
    this.setState({ dragZone: dragZone })
    switch (this.state.interactionState) {
      case 'dragging':
        e.stopPropagation()
        this.moveToPointer(e)
        break
      case 'rotating':
        e.stopPropagation()
        this.rotateToPointer(e)
        break
      case 'scaling':
        e.stopPropagation()
        this.scaleToPointer(e)
        break
      default:
        e.stopPropagation()
    }
  }
  onMouseUp() {
    this.setState({
      lastMouseDrag: null,
      interactionState: 'static'
    })
  }
  moveToPointer(e) {
    if (!this.state.lastMouseDrag) return

    var dX = e.screenX - this.state.lastMouseDrag.x
    var dY = e.screenY - this.state.lastMouseDrag.y
    this.setState({ lastMouseDrag: { x: e.screenX, y: e.screenY } })

    const doc = this.getActiveDoc()
    const transform = doc.transform
    var updatedTransform = update(transform, {
      translation: {
        $set: {
          x: transform.translation.x + dX,
          y: transform.translation.y + dY
        }
      }
    })

    this.props.onTransform(doc, updatedTransform)
  }
  scaleToPointer(e) {
    const ev = e.nativeEvent
    const activeDoc = this.getActiveDoc()
    const transform = activeDoc.transform
    const anchor = this.getAnchorPoint(activeDoc)

    // Get offset from anchor point
    var aX = ev.clientX - anchor.pageX
    var aY = ev.clientY - anchor.pageY
    var distanceToAnchor = Math.sqrt(aX * aX + aY * aY)

    var w2 = this.state.activeEl.offsetWidth / 2
    var h2 = this.state.activeEl.offsetHeight / 2
    var naturalSize = Math.sqrt(w2 * w2 + h2 * h2)

    var dS = distanceToAnchor / naturalSize
    var scaleStart

    if (this.state.scaleStart === null) {
      scaleStart = dS / transform.scale.x
      this.setState({ scaleStart: scaleStart })
    } else {
      scaleStart = this.state.scaleStart
    }

    var scaleSize = dS / scaleStart

    var updatedTransform = update(transform, {
      scale: {
        $set: {
          x: scaleSize,
          y: scaleSize
        }
      }
    })

    this.props.onTransform(activeDoc, updatedTransform)
  }
  rotateToPointer(e) {
    const ev = e.nativeEvent
    const activeDoc = this.getActiveDoc()
    const transform = activeDoc.transform
    const anchor = this.getAnchorPoint(activeDoc)

    var R =
      (Math.atan2(ev.pageY - anchor.pageY, ev.pageX - anchor.pageX) * 180) /
      Math.PI
    var rotationStart
    if (this.state.rotationStart === null) {
      rotationStart = R - transform.rotation
      this.setState({ rotationStart: rotationStart })
    } else {
      rotationStart = this.state.rotationStart
    }

    var dR = R - rotationStart

    var updatedTransform = update(transform, { rotation: { $set: dR } })

    this.props.onTransform(activeDoc, updatedTransform)
  }
  getActiveDoc() {
    for (var i = 0; i < this.props.documents.length; i++) {
      if (this.props.documents[i].id === this.props.activeDocument)
        return this.props.documents[i]
    }
  }
  getAnchorPoint(doc) {
    if (doc === undefined) return { x: undefined, y: undefined }

    // Always return the center of the active element for now
    const thisEl = this.ref.current
    const docEl = this.docElements[doc.id].ref.current
    const transform = doc.transform

    var offset = getOffsetSum(thisEl)
    var localX = docEl.offsetWidth / 2
    var localY = docEl.offsetHeight / 2
    return {
      pageX: transform.translation.x + localX + offset.left,
      pageY: transform.translation.y + localY + offset.top,
      localX: localX,
      localY: localY
    }
  }
  getDocSize(doc) {
    const docEl = this.docElements[doc.id].ref.current
    const svgEl = docEl.getElementsByTagName('svg')[0]
    const v = svgEl.getAttribute('viewBox').split(' ')
    return {
      width: docEl.offsetWidth,
      height: docEl.offsetHeight,
      svgWidth: svgEl.getAttribute('width'),
      svgHeight: svgEl.getAttribute('height'),
      viewBox: { x: v[0], y: v[1], width: v[2], height: v[3] }
    }
  }

  render() {
    var svgs = this.props.documents.map((doc) => {
      var isActive = this.props.activeDocument === doc.id
      return (
        <TransformableSVG
          key={doc.id}
          container={this}
          onTransform={this.props.onTransform}
          doc={doc}
          onSelect={this.props.onSelect}
          onMouseDown={isActive ? this.onMouseDown : undefined}
          onMouseOver={this.onMouseOver}
          onMouseOut={isActive ? this.onMouseOut : undefined}
          onMouseMove={isActive ? this.onMouseMove : undefined}
          onMouseUp={isActive ? this.onMouseUp : undefined}
          active={doc.id === this.props.activeDocument}
          ref={(svg) => {
            this.docElements[doc.id] = svg
          }}
          containerRef={this.ref}
        />
      )
    })

    var classes = ['absolute', 'clip', 'z2', 'left', 'top', 'w-full', 'h-full']
    if (!this.props.mapLocked) classes.push('events-none') // Disable this layer if the map is unlocked

    return (
      <div
        className={classes.join(' ')}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
        id={this.props.id}
        ref={this.ref}
      >
        {svgs}
      </div>
    )
  }
}

function getOffsetSum(elem) {
  var top = 0,
    left = 0
  while (elem) {
    top = top + parseInt(elem.offsetTop)
    left = left + parseInt(elem.offsetLeft)
    elem = elem.offsetParent
  }
  return { top: top, left: left }
}

export default TransformableSVGContainer
