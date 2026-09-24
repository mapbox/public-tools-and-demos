import type { RecommendedNeighborhood } from '../types'
import './NeighborhoodProfile.css'

type Props = {
  neighborhood: RecommendedNeighborhood
  onClose: () => void
}

export default function NeighborhoodProfile({ neighborhood, onClose }: Props) {
  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <button className="profile-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="profile-header" style={{ borderTopColor: neighborhood.color }}>
          <div className="profile-dot" style={{ background: neighborhood.color }} />
          <div>
            <h2 className="profile-name">{neighborhood.name}</h2>
            <p className="profile-borough">{neighborhood.borough}</p>
          </div>
        </div>

        <div className="profile-body">
          <section className="profile-section">
            <h3>Why it matches</h3>
            <p>{neighborhood.reason}</p>
          </section>

          {neighborhood.summary && (
            <section className="profile-section">
              <h3>About</h3>
              <p>{neighborhood.summary}</p>
            </section>
          )}

          {neighborhood.wikipedia_url && (
            <a
              className="profile-wiki-link"
              href={neighborhood.wikipedia_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read more on Wikipedia →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
