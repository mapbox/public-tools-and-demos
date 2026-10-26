/**
 * The slice of Mapbox GL Draw this app uses. Draw ships no types of its own,
 * and the community `@types/mapbox__mapbox-gl-draw` trails the package, so
 * this covers only the constructor options and the custom-mode API that
 * `lib/freehand.ts` relies on.
 */
declare module '@mapbox/mapbox-gl-draw' {
  import type { IControl, Map } from 'mapbox-gl'

  /** A Draw feature, as handed to a mode by `newFeature`. */
  export interface DrawFeature<G extends GeoJSON.Geometry = GeoJSON.Geometry> {
    id: string
    setCoordinates(coordinates: unknown): void
    toGeoJSON(): GeoJSON.Feature<G>
  }

  /** What `this` is inside a custom mode's handlers. */
  export interface DrawModeContext {
    map: Map
    newFeature<G extends GeoJSON.Geometry>(
      geojson: GeoJSON.Feature<G>
    ): DrawFeature<G>
    addFeature(feature: DrawFeature): void
    deleteFeature(id: string, options?: { silent?: boolean }): void
    clearSelectedFeatures(): void
    updateUIClasses(classes: { mouse?: string }): void
  }

  // Each handler types its own `this` and state; Draw calls them by name.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type DrawCustomMode = Record<string, (...args: any[]) => unknown>

  export interface DrawOptions {
    displayControlsDefault?: boolean
    controls?: Record<string, boolean>
    modes?: Record<string, DrawCustomMode | object>
    defaultMode?: string
    styles?: object[]
    boxSelect?: boolean
    touchEnabled?: boolean
  }

  export default class MapboxDraw implements IControl {
    constructor(options?: DrawOptions)
    static modes: Record<string, object>
    onAdd(map: Map): HTMLElement
    onRemove(map: Map): void
  }
}
