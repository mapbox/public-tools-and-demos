import clsx from 'clsx'

import listIcon from '../../img/icons/list.svg'
import mapIcon from '../../img/icons/map.svg'
import splitIcon from '../../img/icons/split.svg'
import type { ViewMode } from '../../types/view'
import MaskIcon from '../ui/MaskIcon'

const OPTIONS: { value: ViewMode; label: string; icon: string }[] = [
  { value: 'split', label: 'Split', icon: splitIcon },
  { value: 'map', label: 'Map', icon: mapIcon },
  { value: 'list', label: 'List', icon: listIcon }
]

export default function ViewSelector({
  value,
  onChange
}: {
  value: ViewMode
  onChange: (view: ViewMode) => void
}) {
  return (
    <div
      role='group'
      aria-label='View mode'
      className='flex shrink-0 gap-0.5 rounded-[999px] border border-gray-200 bg-white p-1'
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type='button'
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={clsx(
              'flex cursor-pointer items-center justify-center gap-1.5 rounded-[999px] px-3.5 py-1.5 text-sm font-bold',
              selected
                ? 'bg-surface-inverse text-white'
                : 'text-ink-muted hover:bg-surface-sunken'
            )}
          >
            <MaskIcon src={option.icon} />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
