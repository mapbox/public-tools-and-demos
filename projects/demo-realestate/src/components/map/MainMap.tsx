import { useListings, useSelection } from '../../state/contexts'
import PropertyCard from '../property-card/PropertyCard'
import MapView from './MapView'

/**
 * The search map, wired to app state. `MapView` itself stays prop-driven, so
 * it knows nothing of the context or of what goes in its card.
 */
export default function MainMap() {
  const {
    rendered,
    visible,
    flyTo,
    boundary,
    removeBoundary,
    applyDrawnArea,
    onBoundsChange
  } = useListings()
  const {
    selectedId,
    selected,
    select,
    visited,
    closeCard,
    panelOpen,
    favorites,
    mapStyle,
    setMapStyle,
    lightPreset,
    setLightPreset
  } = useSelection()

  // The small card gives way to the full listing while that is open.
  const card = panelOpen ? null : selected

  return (
    <MapView
      listings={rendered}
      selectedId={selectedId}
      visited={visited}
      favorites={favorites}
      mapStyle={mapStyle}
      onMapStyleChange={setMapStyle}
      lightPreset={lightPreset}
      onLightPresetChange={setLightPreset}
      flyTo={flyTo}
      boundary={boundary}
      onRemoveBoundary={removeBoundary}
      totalInView={visible.length}
      onSelect={select}
      onBoundsChange={onBoundsChange}
      cardAt={card ? card.coordinates : null}
      card={card && <PropertyCard key={card.id} listing={card} />}
      onBackgroundClick={closeCard}
      onApplyDrawnArea={applyDrawnArea}
    />
  )
}
