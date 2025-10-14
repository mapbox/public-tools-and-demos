import React, { useCallback, useRef, useState } from 'react'
import { AppContext } from '../hooks/useAppContext'

export type Category = 'food_and_drink' | 'lodging'

export interface AppState {
  mapRef: React.RefObject<mapboxgl.Map | null>
  favouritesSet: Set<number>
  visitedSet: Set<number>
  filters: Map<string, mapboxgl.ExpressionSpecification>
  selectedBuildingsRef: { current: mapboxgl.TargetFeature[] }
  selectedFeatureIdRef: { current: number }
  searchQueryRef: { current: string }
  categoryRef: { current: Category }
}

export interface AppActions {
  setMap: (map: mapboxgl.Map) => void
  addFavourite: (id: number) => void
  removeFavourite: (id: number) => void
  addVisited: (id: number) => void
  setFilter: (name: string, exp: mapboxgl.ExpressionSpecification) => void
  removeFilter: (name: string) => void
  clearFilters: () => void
  setSelectedBuildings: (buildings: mapboxgl.TargetFeature[]) => void
  clearSelectedBuildings: () => void
  setSelectedFeatureId: (id: number) => void
  setSearchQuery: (query: string) => void
  setCategory: (category: Category) => void
  updateGlobalFilter: (
    map: mapboxgl.Map,
    name?: string,
    exp?: mapboxgl.ExpressionSpecification
  ) => void
  getRestaurantSelectedFilter: () => mapboxgl.ExpressionSpecification
  getMiddlePOIFilter: () => mapboxgl.ExpressionSpecification
  getTopPOIFilter: () => mapboxgl.ExpressionSpecification
  getBottomPOIFilter: () => mapboxgl.ExpressionSpecification
}

export interface AppContextType {
  state: AppState
  actions: AppActions
}

interface AppProviderProps {
  children: React.ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [favouritesSet] = useState(() => new Set<number>())
  const [visitedSet] = useState(() => new Set<number>())
  const [filters] = useState(
    () => new Map<string, mapboxgl.ExpressionSpecification>()
  )
  const selectedBuildingsRef = useRef<mapboxgl.TargetFeature[]>([])
  const selectedFeatureIdRef = useRef<number>(-1)
  const searchQueryRef = useRef<string>('')
  const categoryRef = useRef<Category>('food_and_drink')

  const state: AppState = {
    mapRef,
    favouritesSet,
    visitedSet,
    filters,
    selectedBuildingsRef,
    selectedFeatureIdRef,
    searchQueryRef,
    categoryRef
  }

  const getRestaurantSelectedFilter =
    useCallback((): mapboxgl.ExpressionSpecification => {
      return [
        'all',
        ['match', ['get', 'category'], ['food_and_drink'], true, false],
        ['match', ['id'], [selectedFeatureIdRef.current], true, false]
      ]
    }, [])

  const getMiddlePOIFilter =
    useCallback((): mapboxgl.ExpressionSpecification => {
      let filter: mapboxgl.ExpressionSpecification = [
        'all',
        ['match', ['get', 'category'], [categoryRef.current], true, false],
        ['match', ['id'], [selectedFeatureIdRef.current], false, true],
        [
          'any',
          searchQueryRef.current !== '' || filters.size > 0 ? true : null,
          ['in', ['id'], ['literal', Array.from(favouritesSet)]],
          ['>=', ['zoom'], 18],
          [
            'all',
            [
              '<=',
              ['get', 'reality_score'],
              ['step', ['zoom'], 0.999, 14, 0.997, 15, 0.995, 16, 0.99]
            ],
            [
              '>',
              ['get', 'reality_score'],
              ['step', ['zoom'], 0.8, 14, 0.9, 16, 0.91]
            ]
          ]
        ].filter(Boolean)
      ]

      if (categoryRef.current === 'lodging') {
        filter = [
          'all',
          ['match', ['get', 'category'], ['lodging'], true, false],
          [
            'any',
            ['in', ['id'], ['literal', Array.from(favouritesSet)]],
            ['match', ['id'], [selectedFeatureIdRef.current], true, false],
            ['>=', ['zoom'], 17],
            [
              '>',
              ['get', 'reality_score'],
              ['step', ['zoom'], 0.9, 15, 0.89, 16, 0.88]
            ]
          ]
        ]
      } else {
        for (const exp of filters.values()) {
          filter.push(exp)
        }
      }

      return filter
    }, [favouritesSet, filters])

  const getTopPOIFilter = useCallback((): mapboxgl.ExpressionSpecification => {
    const filter: mapboxgl.ExpressionSpecification = [
      'all',
      ['match', ['get', 'category'], [categoryRef.current], true, false],
      [
        'any',
        ['in', ['id'], ['literal', Array.from(favouritesSet)]],
        [
          '>',
          ['get', 'reality_score'],
          ['step', ['zoom'], 0.995, 14, 0.997, 17, 0.992]
        ]
      ]
    ]

    if (categoryRef.current === 'food_and_drink') {
      filter.push([
        'match',
        ['id'],
        [selectedFeatureIdRef.current],
        false,
        true
      ])
      for (const exp of filters.values()) {
        filter.push(exp)
      }
    }

    return filter
  }, [favouritesSet, filters])

  const getBottomPOIFilter =
    useCallback((): mapboxgl.ExpressionSpecification => {
      const filter: mapboxgl.ExpressionSpecification = [
        'all',
        ['match', ['get', 'category'], [categoryRef.current], true, false]
      ]

      filter.push([
        'case',
        ['in', ['id'], ['literal', Array.from(favouritesSet)]],
        false,
        ['==', ['id'], selectedFeatureIdRef.current],
        false,
        true
      ])

      if (categoryRef.current === 'food_and_drink') {
        for (const exp of filters.values()) {
          filter.push(exp)
        }
      }

      return filter
    }, [favouritesSet, filters])

  const updateGlobalFilter = useCallback(
    (
      map: mapboxgl.Map,
      name?: string,
      exp?: mapboxgl.ExpressionSpecification
    ) => {
      if (name) {
        if (exp) {
          filters.set(name, exp)
        } else {
          filters.delete(name)
        }
      }

      map.setFilter('poi bottom', getBottomPOIFilter())
      map.setFilter('poi middle', getMiddlePOIFilter())
      map.setFilter('poi top', getTopPOIFilter())
      map.setFilter('poi restaurant selected', getRestaurantSelectedFilter())
    },
    [
      filters,
      getBottomPOIFilter,
      getMiddlePOIFilter,
      getTopPOIFilter,
      getRestaurantSelectedFilter
    ]
  )

  const actions: AppActions = {
    setMap: useCallback((map: mapboxgl.Map) => {
      mapRef.current = map
    }, []),
    addFavourite: useCallback(
      (id: number) => {
        favouritesSet.add(id)
      },
      [favouritesSet]
    ),

    removeFavourite: useCallback(
      (id: number) => {
        favouritesSet.delete(id)
      },
      [favouritesSet]
    ),

    addVisited: useCallback(
      (id: number) => {
        visitedSet.add(id)
      },
      [visitedSet]
    ),

    setFilter: useCallback(
      (name: string, exp: mapboxgl.ExpressionSpecification) => {
        filters.set(name, exp)
      },
      [filters]
    ),

    removeFilter: useCallback(
      (name: string) => {
        filters.delete(name)
      },
      [filters]
    ),

    clearFilters: useCallback(() => {
      filters.clear()
    }, [filters]),

    setSelectedBuildings: useCallback((buildings: mapboxgl.TargetFeature[]) => {
      selectedBuildingsRef.current = buildings
    }, []),

    clearSelectedBuildings: useCallback(() => {
      selectedBuildingsRef.current = []
    }, []),

    setSelectedFeatureId: useCallback((id: number) => {
      selectedFeatureIdRef.current = id
    }, []),

    setSearchQuery: useCallback((query: string) => {
      searchQueryRef.current = query
    }, []),

    setCategory: useCallback((category: Category) => {
      categoryRef.current = category
    }, []),

    updateGlobalFilter,
    getRestaurantSelectedFilter,
    getMiddlePOIFilter,
    getTopPOIFilter,
    getBottomPOIFilter
  }

  const contextValue: AppContextType = {
    state,
    actions
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}
