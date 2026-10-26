import clsx from 'clsx'

/** `null` means no minimum — the "Any beds" option. */
const OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Any beds' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' }
]

export default function BedsFilter({
  value,
  onChange
}: {
  value: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <div
      role='group'
      aria-label='Minimum bedrooms'
      className='flex items-center gap-1'
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.label}
            type='button'
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={clsx(
              'cursor-pointer rounded-full border border-gray-200 px-4 py-2 text-sm font-bold',
              selected
                ? 'bg-surface-inverse text-white'
                : 'bg-white text-ink-muted hover:bg-surface-sunken'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
