const ITEMS = [
  { label: 'House', color: 'bg-house' },
  { label: 'Condo', color: 'bg-condo' },
  { label: 'Townhouse', color: 'bg-townhouse' }
]

export default function MapLegend() {
  return (
    <div className='flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 drop-shadow-[0px_4px_2.5px_rgba(0,0,0,0.1)]'>
      {ITEMS.map((item) => (
        <span key={item.label} className='flex items-center gap-1'>
          <span className={`size-2 rounded-full ${item.color}`} />
          <span className='text-sm font-medium text-ink-muted'>
            {item.label}
          </span>
        </span>
      ))}
    </div>
  )
}
