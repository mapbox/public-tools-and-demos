import clsx from 'clsx'

import type { Listing } from '../../types/listing'
import ListingCard, { type CardLayout } from './ListingCard'

export default function ListingsPanel({
  listings,
  layout,
  selectedId,
  favorites,
  onSelect,
  onToggleFavorite
}: {
  listings: Listing[]
  layout: CardLayout
  selectedId: string | null
  favorites: Set<string>
  onSelect: (id: string) => void
  onToggleFavorite: (id: string) => void
}) {
  const isGrid = layout === 'vertical'

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex items-center justify-between border-b border-line px-4 py-4'>
        <h2 className='text-lg text-ink'>Listings in this area</h2>
        <p className='text-sm text-ink-muted'>{listings.length} results</p>
      </div>
      <div
        className={clsx(
          'min-h-0 flex-1 overflow-y-auto',
          isGrid
            ? 'grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] content-start gap-4 p-4'
            : 'px-4'
        )}
      >
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            layout={layout}
            selected={listing.id === selectedId}
            favorited={favorites.has(listing.id)}
            onSelect={() => onSelect(listing.id)}
            onToggleFavorite={() => onToggleFavorite(listing.id)}
          />
        ))}
        {listings.length === 0 && (
          <p className='py-12 text-center text-sm text-ink-muted'>
            No listings match these filters.
          </p>
        )}
      </div>
    </div>
  )
}
