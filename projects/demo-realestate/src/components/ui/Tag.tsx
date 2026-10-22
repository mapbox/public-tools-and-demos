import type { ListingTag } from '../../types/listing'

const STYLES: Record<ListingTag, string> = {
  new: 'bg-brand-wash text-brand-dark',
  'price-drop': 'bg-success-wash text-success-dark',
  featured: 'bg-accent-wash text-accent-deep'
}

const LABELS: Record<ListingTag, string> = {
  new: 'New',
  'price-drop': 'Price drop',
  featured: 'Featured'
}

export default function Tag({ tag }: { tag: ListingTag }) {
  return (
    <span
      className={`rounded-[4px] px-1.5 py-0.5 font-label text-[10px] font-bold uppercase ${STYLES[tag]}`}
    >
      {LABELS[tag]}
    </span>
  )
}
