import type { RecommendedNeighborhood } from '../types'
import './NeighborhoodCard.css'

type Props = {
  neighborhood: RecommendedNeighborhood
  onHoverEnter: (name: string) => void
  onHoverLeave: () => void
  onClick: (neighborhood: RecommendedNeighborhood) => void
}

export default function NeighborhoodCard({ neighborhood, onHoverEnter, onHoverLeave, onClick }: Props) {
  return (
    <div
      className="neighborhood-card"
      style={{ borderLeftColor: neighborhood.color }}
      onMouseEnter={() => onHoverEnter(neighborhood.name)}
      onMouseLeave={onHoverLeave}
      onClick={() => onClick(neighborhood)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(neighborhood)}
    >
      <div className="neighborhood-card-header">
        <span className="neighborhood-card-dot" style={{ background: neighborhood.color }} />
        <span className="neighborhood-card-name">{neighborhood.name}</span>
        <span className="neighborhood-card-borough">{neighborhood.borough}</span>
      </div>
      <p className="neighborhood-card-reason">{neighborhood.reason}</p>
      <span className="neighborhood-card-cta">View profile →</span>
    </div>
  )
}
