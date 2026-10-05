import type {
  DrawCustomMode,
  DrawFeature,
  DrawModeContext
} from '@mapbox/mapbox-gl-draw'
import type { MapMouseEvent, MapTouchEvent } from 'mapbox-gl'

/**
 * A freehand lasso for Mapbox GL Draw, as on Zillow: press, drag a loop around
 * the area, release. GL Draw has no freehand mode of its own, but its custom
 * mode API (handlers named after events, given a state object) is built for
 * exactly this. Only one shape exists at a time: starting a new stroke
 * replaces the last, which is how a shape is "edited" here.
 *
 * Draw sends a touch drag to a mode as both `touchmove` and `drag`, so points
 * are recorded on `drag` alone. A stroke that barely moved arrives as `click`
 * or `tap` instead of `mouseup` or `touchend`, so all four end it.
 *
 * The polygon is only handed to Draw once the stroke has three points: GL JS's
 * GeoJSON worker throws on a polygon with fewer, which a press without a drag
 * would otherwise produce.
 *
 * Draw renders into two GeoJSON sources, "hot" for features changed since the
 * last render and "cold" for the rest, and renders after every event a mode
 * handles. A render after a pointer move too small to record would find the
 * shape unchanged and move it to cold, and the next move back to hot. Each
 * source updates in its own worker round trip, so for a frame neither holds
 * it and the line flashes (178 hops on one slow stroke, measured). A handler
 * that returns true tells Draw to skip that render, so every handler call that
 * changes nothing does: the shape stays hot for the whole stroke and moves to
 * cold once, on release.
 */

/** Screen pixels the pointer must travel before another point is kept. */
const MIN_STEP_PX = 4
/** The fewest points that enclose an area. */
const MIN_POINTS = 3

type DrawEvent = MapMouseEvent | MapTouchEvent

interface State {
  polygon: DrawFeature<GeoJSON.Polygon> | null
  points: [number, number][]
  last: { x: number; y: number } | null
  drawing: boolean
}

type Context = DrawModeContext

/** Returned by a handler to skip Draw's render: nothing changed. */
const SKIP_RENDER = true

/**
 * `onChange` receives the shape after each stroke, or null when a stroke was
 * too small to enclose anything.
 */
export const createFreehandMode = (
  onChange: (shape: GeoJSON.Polygon | null) => void
): DrawCustomMode => {
  // A new stroke replaces the last shape straight away, so Apply is never
  // left offering a shape that is no longer on the map.
  const start = function (this: Context, state: State, event: DrawEvent) {
    state.points = [[event.lngLat.lng, event.lngLat.lat]]
    state.last = event.point
    state.drawing = true
    if (!state.polygon) return SKIP_RENDER
    this.deleteFeature(state.polygon.id, { silent: true })
    state.polygon = null
    onChange(null)
  }

  const finish = function (this: Context, state: State) {
    if (!state.drawing) return
    state.drawing = false
    onChange(state.polygon ? state.polygon.toGeoJSON().geometry : null)
  }

  return {
    onSetup(this: Context): State {
      this.clearSelectedFeatures()
      this.updateUIClasses({ mouse: 'add' })
      // Dragging draws instead of panning. Whoever removes Draw re-enables
      // both: Draw restores what it saw on connecting, which on a map still
      // loading tiles can be after this has already turned them off.
      this.map.dragPan.disable()
      this.map.doubleClickZoom.disable()
      return { polygon: null, points: [], last: null, drawing: false }
    },
    onMouseDown: start,
    onTouchStart: start,
    onDrag(this: Context, state: State, event: DrawEvent) {
      if (!state.drawing || !state.last) return SKIP_RENDER
      const { x, y } = event.point
      if (Math.hypot(x - state.last.x, y - state.last.y) < MIN_STEP_PX) {
        return SKIP_RENDER
      }
      state.last = event.point
      state.points.push([event.lngLat.lng, event.lngLat.lat])
      if (state.points.length < MIN_POINTS) return SKIP_RENDER
      if (!state.polygon) {
        // GeoJSON in, so the ring is closed here; Draw keeps it open inside.
        state.polygon = this.newFeature<GeoJSON.Polygon>({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[...state.points, state.points[0]]]
          }
        })
        this.addFeature(state.polygon)
        return
      }
      state.polygon.setCoordinates([[...state.points]])
    },
    onMouseUp: finish,
    onClick: finish,
    onTouchEnd: finish,
    onTap: finish,
    toDisplayFeatures(
      _state: State,
      geojson: GeoJSON.Feature,
      display: (feature: GeoJSON.Feature) => void
    ) {
      display(geojson)
    }
  }
}
