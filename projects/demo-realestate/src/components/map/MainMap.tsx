import { useListings, useSelection } from '../../state/contexts'
import PropertyCard from '../property-card/PropertyCard'
import MapView from './MapView'

/**
 * The search map, wired to app state. `MapView` itself stays prop-driven, so
 * it knows nothing of the context or of what goes in its card.
 */
export default function MainMap() {
  const { rendered, visible, flyTo, boundary, removeBoundary, onBoundsChange } =
    useListings()
  const { selectedId, selected, select, closeCard, panelOpen, favorites } =
    useSelection()

  // The small card gives way to the full listing while that is open.
  const card = panelOpen ? null : selected

  return (
    <MapView
      listings={rendered}
      selectedId={selectedId}
      favorites={favorites}
      flyTo={flyTo}
      boundary={boundary}
      onRemoveBoundary={removeBoundary}
      totalInView={visible.length}
      onSelect={select}
      onBoundsChange={onBoundsChange}
      cardAt={card ? card.coordinates : null}
      card={card && <PropertyCard key={card.id} listing={card} />}
      onBackgroundClick={closeCard}
    />
  )
}
