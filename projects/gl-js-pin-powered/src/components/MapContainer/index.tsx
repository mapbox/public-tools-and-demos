import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import styles from './MapContainer.module.css'

import { ACCESS_TOKEN } from '../../constants'
import {
  useVisited,
  useFavourites,
  useFilters,
  useCategory,
  useSelectedFeature,
  useSelectedBuildings,
  usePOIFilters,
  useMap
} from '../../hooks/useAppState'
import { getBbox } from '../../getBbox'

import { POICard } from '../POICard'
import { Filters } from '../Filters'
import { SwitchView } from '../SwitchView'

const MapContainer: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedFeature, setSelectedFeature] =
    useState<mapboxgl.TargetFeature | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const updateIconsRef = useRef<(() => void) | null>(null)
  const { mapRef, setMap } = useMap()
  const { visitedSet } = useVisited()
  const { favouritesSet } = useFavourites()
  const { updateGlobalFilter } = useFilters()
  const { categoryRef } = useCategory()
  const { selectedFeatureIdRef, setSelectedFeatureId } = useSelectedFeature()
  const { selectedBuildingsRef, clearSelectedBuildings } =
    useSelectedBuildings()
  const {
    getRestaurantSelectedFilter,
    getBottomPOIFilter,
    getMiddlePOIFilter,
    getTopPOIFilter
  } = usePOIFilters()

  const clearSelectedBuildingsAndReset = React.useCallback(() => {
    selectedBuildingsRef.current.forEach((f) =>
      mapRef.current?.setFeatureState(f, { select: false })
    )
    clearSelectedBuildings()
  }, [clearSelectedBuildings, mapRef, selectedBuildingsRef])

  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          composite: {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-poi-v2'
          }
        },
        imports: [
          {
            config: {
              showPointOfInterestLabels: false,
              showLandmarkIcons: true
            },
            id: 'basemap',
            url: 'mapbox://styles/mapbox/standard'
          }
        ],
        glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
        sprite:
          'mapbox://sprites/mapbox-map-design/cmetu1bho01cj01pjg3fz41if/cb928gwx5l1l0ml37adao6el5',
        featuresets: {
          poi: {
            selectors: [
              { layer: 'poi bottom' },
              { layer: 'poi middle' },
              { layer: 'poi top' }
            ]
          }
        },
        layers: []
      },
      center: [2.3522, 48.8566],
      zoom: 16,
      hash: true,
      accessToken: ACCESS_TOKEN
    })

    setMap(map)

    function updateBottomIcons() {
      const visitedInExpression: mapboxgl.ExpressionSpecification = [
        'in',
        ['id'],
        ['literal', Array.from(visitedSet)]
      ]
      const color1Expression: mapboxgl.ExpressionSpecification = [
        'case',
        visitedInExpression,
        '#9CAFED',
        'rgb(15, 56, 191)'
      ]

      map.setLayoutProperty('poi bottom', 'icon-image', [
        'image',
        'marker',
        { params: { 'color-1': color1Expression } }
      ])
    }

    function updateRestaurantsTopIcons() {
      const visitedInExpression: mapboxgl.ExpressionSpecification = [
        'in',
        ['id'],
        ['literal', Array.from(visitedSet)]
      ]
      const colorExpression: mapboxgl.ExpressionSpecification = [
        'case',
        visitedInExpression,
        '#9CAFED',
        'rgb(15, 56, 191)'
      ]
      const textColorExpression: mapboxgl.ExpressionSpecification = [
        'case',
        visitedInExpression,
        '#5373DF',
        'rgb(15, 56, 191)'
      ]

      map.setPaintProperty('poi top', 'text-color', textColorExpression)
      map.setLayoutProperty('poi top', 'icon-image', [
        'let',
        'icon_name',
        [
          'case',
          ['==', ['get', 'icon'], 'marker'],
          'restaurant',
          ['get', 'icon']
        ],
        [
          'case',
          // Use icon but fallback to "restaurant"
          ['in', ['id'], ['literal', Array.from(favouritesSet)]],
          [
            'image',
            ['concat', ['to-string', ['var', 'icon_name']]],
            { params: { 'color-1': colorExpression } }
          ],
          [
            'image',
            [
              'concat',
              ['var', 'icon_name'],
              '_rating_',
              [
                'to-string',
                [
                  'case',
                  ['<', ['%', ['round', ['/', ['id'], 10]], 10], 5],
                  [
                    'at',
                    ['%', ['round', ['/', ['id'], 10]], 2],
                    ['literal', ['3.0', 3.5]]
                  ],
                  [
                    'at',
                    ['%', ['round', ['/', ['id'], 10]], 5],
                    ['literal', [4.1, 4.3, 4.5, 4.7, 4.9]]
                  ]
                ]
              ]
            ],
            {
              params: {
                'color-1': colorExpression,
                'color-2': colorExpression
              }
            }
          ]
        ]
      ])
      map.setLayoutProperty('poi top', 'text-offset', [
        'case',
        ['in', ['id'], ['literal', Array.from(favouritesSet)]],
        [2, 0.2],
        [2.6, 0.2]
      ])
    }

    function updateRestaurantMiddleIcons() {
      map.setLayoutProperty('poi middle', 'icon-size', 0.6)
      map.setLayoutProperty('poi middle', 'text-field', [
        'to-string',
        ['get', 'name']
      ])
      map.setPaintProperty('poi middle', 'text-halo-width', 1)

      const visitedInExpression: mapboxgl.ExpressionSpecification = [
        'in',
        ['id'],
        ['literal', Array.from(visitedSet)]
      ]
      const color1Expression: mapboxgl.ExpressionSpecification = [
        'case',
        visitedInExpression,
        '#9CAFED',
        'rgb(15, 56, 191)'
      ]
      const textColorExpression: mapboxgl.ExpressionSpecification = [
        'case',
        visitedInExpression,
        '#5373DF',
        'rgb(15, 56, 191)'
      ]

      map.setPaintProperty('poi middle', 'icon-opacity', 1)
      map.setLayoutProperty('poi middle', 'icon-image', [
        'let',
        'icon_name',
        [
          'case',
          ['==', ['get', 'icon'], 'marker'],
          'restaurant',
          ['get', 'icon']
        ],
        [
          'case',
          ['in', ['id'], ['literal', Array.from(favouritesSet)]],
          [
            'image',
            ['concat', ['to-string', ['var', 'icon_name']]],
            { params: { 'color-1': color1Expression } }
          ],
          [
            'image',
            ['concat', ['to-string', ['var', 'icon_name']], '_big'],
            { params: { 'color-1': color1Expression } }
          ]
        ]
      ])
      map.setPaintProperty('poi middle', 'text-color', textColorExpression)
      map.setLayoutProperty('poi middle', 'text-font', [
        'Raleway SemiBold',
        'Arial Unicode MS Regular'
      ])
      map.setLayoutProperty('poi middle', 'text-offset', [
        'case',
        ['in', ['id'], ['literal', Array.from(favouritesSet)]],
        [1.5, 0.2],
        [1.1, 0]
      ])
    }

    function updateHotelsMiddleIcons() {
      const places = map.queryRenderedFeatures({
        layers: ['poi middle'],
        filter: getMiddlePOIFilter()
      })

      const visitedInExpression: mapboxgl.ExpressionSpecification = [
        'in',
        ['id'],
        ['literal', Array.from(visitedSet)]
      ]
      const color1Expression: mapboxgl.ExpressionSpecification = [
        'case',
        visitedInExpression,
        '#9CAFED',
        'rgb(15, 56, 191)'
      ]

      map.setPaintProperty(
        'poi middle',
        'icon-opacity',
        places.length > 0 ? 1 : 0
      )
      map.setPaintProperty('poi middle', 'text-color', 'white')
      map.setLayoutProperty('poi middle', 'text-font', ['Inter Bold'])
      map.setLayoutProperty('poi middle', 'icon-image', [
        'let',
        'price_length',
        [
          'length',
          [
            'to-string',
            ['+', ['*', ['%', ['round', ['/', ['id'], 10]], 5], 100], 99]
          ]
        ],
        [
          'case',
          ['in', ['id'], ['literal', Array.from(favouritesSet)]],
          [
            'image',
            ['concat', 'price_fav_', ['to-string', ['var', 'price_length']]],
            { params: { 'color-1': color1Expression } }
          ],
          [
            'image',
            ['concat', 'price_', ['to-string', ['var', 'price_length']]],
            { params: { 'color-1': color1Expression } }
          ]
        ]
      ])
      map.setLayoutProperty('poi middle', 'text-size', [
        'case',
        ['match', ['id'], [selectedFeatureIdRef.current], true, false],
        15,
        12
      ])
      map.setLayoutProperty('poi middle', 'icon-size', [
        'case',
        ['match', ['id'], [selectedFeatureIdRef.current], true, false],
        1.2,
        1
      ])
      map.setLayoutProperty('poi middle', 'text-field', [
        'concat',
        [
          'to-string',
          ['+', ['*', ['%', ['round', ['/', ['id'], 10]], 5], 100], 99]
        ],
        ' €'
      ])
      map.setPaintProperty('poi middle', 'text-halo-width', 0)
      map.setLayoutProperty('poi middle', 'text-offset', [
        'let',
        'price_length',
        [
          'length',
          [
            'to-string',
            ['+', ['*', ['%', ['round', ['/', ['id'], 10]], 5], 100], 99]
          ]
        ],
        [
          'case',
          ['in', ['id'], ['literal', Array.from(favouritesSet)]],
          [-1.05, 0.15],
          ['==', ['var', 'price_length'], 2],
          [-1.15, 0.1],
          [-1.35, 0.1]
        ]
      ])
    }

    function updateIcons() {
      if (categoryRef.current === 'food_and_drink') {
        map.setLayoutProperty('poi top', 'visibility', 'visible')
        updateRestaurantsTopIcons()
        updateRestaurantMiddleIcons()
      } else {
        map.setLayoutProperty('poi top', 'visibility', 'none')
        updateHotelsMiddleIcons()
      }
      updateBottomIcons()
    }

    updateIconsRef.current = updateIcons

    map.once('load', () => {
      map.addLayer({
        id: 'poi bottom',
        type: 'symbol',
        source: 'composite',
        'source-layer': 'poi',
        filter: getBottomPOIFilter(),
        layout: { 'icon-image': 'marker' },
        paint: {}
      })

      map.addLayer({
        id: 'poi middle',
        type: 'symbol',
        source: 'composite',
        'source-layer': 'poi',
        filter: getMiddlePOIFilter(),
        layout: {
          'text-size': 13,
          'icon-image': [
            'let',
            'icon_name',
            [
              'case',
              ['==', ['get', 'icon'], 'marker'],
              'restaurant',
              ['get', 'icon']
            ],
            ['concat', ['to-string', ['var', 'icon_name']], '_big']
          ],
          'text-font': ['Raleway SemiBold', 'Arial Unicode MS Regular'],
          'text-justify': 'left',
          'text-anchor': 'left',
          'text-offset': [1.1, 0],
          'icon-size': 0.6,
          'text-field': ['to-string', ['get', 'name']]
        },
        paint: {
          'icon-emissive-strength': 0.9,
          'text-color': 'rgb(15, 56, 191)',
          'text-emissive-strength': 0.8,
          'text-halo-color': 'rgb(255, 255, 255)',
          'text-halo-width': 1
        }
      })

      map.addLayer({
        id: 'poi top',
        type: 'symbol',
        source: 'composite',
        'source-layer': 'poi',
        filter: getTopPOIFilter(),
        layout: {
          'text-optional': true,
          'text-size': 15,
          'icon-image': [
            'let',
            'icon_name',
            [
              'case',
              ['==', ['get', 'icon'], 'marker'],
              'restaurant',
              ['get', 'icon']
            ],
            ['concat', ['to-string', ['var', 'icon_name']], '_big']
          ],
          'text-font': ['Raleway SemiBold', 'Arial Unicode MS Regular'],
          'text-justify': 'left',
          'text-offset': [1.5, 0],
          'text-anchor': 'left',
          'text-field': [
            'concat',
            ['to-string', ['get', 'name']],
            '\n',
            ['get', 'sub_category']
          ]
        },
        paint: {
          'icon-emissive-strength': 0.9,
          'text-color': 'rgb(15, 56, 191)',
          'text-emissive-strength': 0.8,
          'text-halo-color': 'rgb(255, 255, 255)',
          'text-halo-width': 1.5
        }
      })

      map.addLayer({
        id: 'poi restaurant selected',
        filter: getRestaurantSelectedFilter(),
        source: 'composite',
        'source-layer': 'poi',
        type: 'symbol',
        paint: {
          'text-color': 'white'
        },
        layout: {
          'text-offset': [-1.7, -2.4],
          'text-size': 13,
          'text-font': ['Raleway SemiBold', 'Arial Unicode MS Regular'],
          'icon-offset': [0, 17],
          'icon-anchor': 'bottom',
          'icon-image': [
            'let',
            'icon_name',
            [
              'case',
              ['==', ['get', 'icon'], 'marker'],
              'restaurant',
              ['get', 'icon']
            ],
            ['concat', ['to-string', ['var', 'icon_name']], '_selected']
          ],
          'text-field': [
            'to-string',
            [
              'case',
              ['<', ['%', ['round', ['/', ['id'], 10]], 10], 5],
              [
                'at',
                ['%', ['round', ['/', ['id'], 10]], 2],
                ['literal', ['3.0', 3.5]]
              ],
              [
                'at',
                ['%', ['round', ['/', ['id'], 10]], 5],
                ['literal', [4.1, 4.3, 4.5, 4.7, 4.9]]
              ]
            ]
          ]
        }
      })

      map.once('idle', updateIcons)
      map.on('moveend', updateIcons)

      map.on('click', () => {
        setShowFilters(categoryRef.current === 'food_and_drink')
        clearSelectedBuildingsAndReset()
        setSelectedFeatureId(-1)
        setSelectedFeature(null)
        updateGlobalFilter(map)
        updateIcons()
      })

      map.addInteraction('poi-card-open', {
        type: 'click',
        target: { featuresetId: 'poi' },
        handler: (e) => {
          setSelectedFeatureId(Number(e.feature!.id))
          updateGlobalFilter(map)
          setSelectedFeature(e.feature!)
          updateIcons()

          const buildings = map.queryRenderedFeatures({
            target: { featuresetId: 'buildings', importId: 'basemap' },
            filter: ['<=', ['distance', e.feature!.geometry], 0]
          })

          if (buildings.length > 0) {
            const mediaQuery = window.matchMedia('(max-width: 1024px)')
            const allBuildingsGeometry = buildings.reduce((acc, f) => {
              const geom = f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
              if (geom.type === 'Polygon') acc.push(...geom.coordinates)
              if (geom.type === 'MultiPolygon')
                acc.push(...geom.coordinates.flat())
              return acc
            }, [] as GeoJSON.Position[][])
            const bbox = getBbox(allBuildingsGeometry)
            map.fitBounds(bbox, {
              padding: {
                top: 20,
                bottom: 20,
                left: mediaQuery.matches ? 20 : 400,
                right: 20
              },
              maxZoom: 16.5,
              duration: 2000
            })
            clearSelectedBuildingsAndReset()
            buildings.forEach((f) => map.setFeatureState(f, { select: true }))
            selectedBuildingsRef.current = buildings
          } else {
            const geometry = e.feature!.geometry as GeoJSON.Polygon
            map.flyTo({
              center: geometry.coordinates as unknown as mapboxgl.LngLatLike,
              zoom: 16.5,
              duration: 2000
            })
          }

          return true
        }
      })

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      function handleColorSchemeChange(matches: boolean) {
        map.setConfigProperty(
          'basemap',
          'lightPreset',
          matches ? 'night' : 'day'
        )
      }

      handleColorSchemeChange(mediaQuery.matches)
      mediaQuery.addEventListener('change', (e) => {
        handleColorSchemeChange(e.matches)
      })
    })

    return () => {
      map.remove()
    }
  }, [
    categoryRef,
    clearSelectedBuildingsAndReset,
    favouritesSet,
    getBottomPOIFilter,
    getMiddlePOIFilter,
    getRestaurantSelectedFilter,
    getTopPOIFilter,
    selectedBuildingsRef,
    selectedFeatureIdRef,
    setMap,
    setSelectedFeatureId,
    updateGlobalFilter,
    visitedSet
  ])

  const handlePOICardClose = () => {
    // setShowFilters(categoryRef.current === 'food_and_drink')
    setSelectedFeatureId(-1)
    setSelectedFeature(null)
    if (mapRef.current) {
      updateGlobalFilter(mapRef.current)
      updateIconsRef.current?.()
    }
  }

  const handleFavouriteChange = () => {
    updateIconsRef.current?.()
  }

  const handleCategoryChange = (category: 'food_and_drink' | 'lodging') => {
    clearSelectedBuildingsAndReset()
    setSelectedFeature(null)
    setSelectedFeatureId(-1)
    setShowFilters(category === 'food_and_drink')

    if (mapRef.current) {
      updateGlobalFilter(mapRef.current)
      updateIconsRef.current?.()
      // Wait for the map to be idle before updating icons
      mapRef.current.once('idle', () => {
        updateIconsRef.current?.()
      })
    }
  }

  return (
    <div className={styles.MapContainer}>
      <div
        ref={mapContainerRef}
        id='map'
        style={{ width: '100%', height: '100%' }}
      />
      <POICard
        selectedFeature={selectedFeature}
        onClose={handlePOICardClose}
        onFavouriteChange={handleFavouriteChange}
      />
      <Filters isHidden={!showFilters} />
      <SwitchView onCategoryChange={handleCategoryChange} />
    </div>
  )
}

export default MapContainer
