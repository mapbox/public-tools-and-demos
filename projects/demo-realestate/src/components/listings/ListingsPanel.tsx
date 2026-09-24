import clsx from 'clsx'

import type { Listing } from '../../types/listing'
import ListingCard, { type CardLayout } from './ListingCard'

export default function ListingsPanel({
  listings,
  totalInView,
  layout,
  selectedId,
  favorites,
  onSelect,
  onToggleFavorite
}: {
  listings: Listing[]
  totalInView: number
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
        <p className='text-sm text-ink-muted'>
          {totalInView.toLocaleString()} results
        </p>
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
          <div
            key={listing.id}
            style={{
              contentVisibility: 'auto',
              containIntrinsicSize: layout === 'vertical' ? '344px' : '136px'
            }}
          >
            <ListingCard
              listing={listing}
              layout={layout}
              selected={listing.id === selectedId}
              favorited={favorites.has(listing.id)}
              onSelect={() => onSelect(listing.id)}
              onToggleFavorite={() => onToggleFavorite(listing.id)}
            />
          </div>
        ))}
        {listings.length === 0 && (
          <p className='py-12 text-center text-sm text-ink-muted'>
            No listings in this area match these filters.
          </p>
        )}
        {totalInView > listings.length && (
          <p className='py-4 text-center text-xs text-ink-muted'>
            Showing {listings.length.toLocaleString()} of{' '}
            {totalInView.toLocaleString()} — zoom in to narrow the area.
          </p>
        )}
      </div>
    </div>
  )
}
