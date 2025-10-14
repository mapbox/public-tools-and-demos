import { useAppContext } from './useAppContext'

export const useAppState = () => {
  const { state } = useAppContext()
  return state
}

export const useAppActions = () => {
  const { actions } = useAppContext()
  return actions
}

export const useFavourites = () => {
  const { state, actions } = useAppContext()
  return {
    favouritesSet: state.favouritesSet,
    addFavourite: actions.addFavourite,
    removeFavourite: actions.removeFavourite
  }
}

export const useMap = () => {
  const { state, actions } = useAppContext()
  return {
    mapRef: state.mapRef,
    setMap: actions.setMap
  }
}

export const useVisited = () => {
  const { state, actions } = useAppContext()
  return {
    visitedSet: state.visitedSet,
    addVisited: actions.addVisited
  }
}

export const useFilters = () => {
  const { state, actions } = useAppContext()
  return {
    filters: state.filters,
    setFilter: actions.setFilter,
    removeFilter: actions.removeFilter,
    clearFilters: actions.clearFilters,
    updateGlobalFilter: actions.updateGlobalFilter
  }
}

export const useSelectedBuildings = () => {
  const { state, actions } = useAppContext()
  return {
    selectedBuildingsRef: state.selectedBuildingsRef,
    setSelectedBuildings: actions.setSelectedBuildings,
    clearSelectedBuildings: actions.clearSelectedBuildings
  }
}

export const useSelectedFeature = () => {
  const { state, actions } = useAppContext()
  return {
    selectedFeatureIdRef: state.selectedFeatureIdRef,
    setSelectedFeatureId: actions.setSelectedFeatureId
  }
}

export const useSearch = () => {
  const { state, actions } = useAppContext()
  return {
    searchQueryRef: state.searchQueryRef,
    setSearchQuery: actions.setSearchQuery
  }
}

export const useCategory = () => {
  const { state, actions } = useAppContext()
  return {
    categoryRef: state.categoryRef,
    setCategory: actions.setCategory
  }
}

export const usePOIFilters = () => {
  const { actions } = useAppContext()
  return {
    getRestaurantSelectedFilter: actions.getRestaurantSelectedFilter,
    getMiddlePOIFilter: actions.getMiddlePOIFilter,
    getTopPOIFilter: actions.getTopPOIFilter,
    getBottomPOIFilter: actions.getBottomPOIFilter
  }
}
