import clsx from 'clsx'

import checkRing from '../../img/icons/check-ring.svg'
import checkCondo from '../../img/icons/check-condo.svg'
import checkHouse from '../../img/icons/check-house.svg'
import checkTownhouse from '../../img/icons/check-townhouse.svg'
import type { PropertyType } from '../../types/listing'
import MaskIcon from '../ui/MaskIcon'

const TYPES: {
  value: PropertyType
  label: string
  check: string
  tint: string
}[] = [
  { value: 'house', label: 'House', check: checkHouse, tint: 'text-house' },
  { value: 'condo', label: 'Condo', check: checkCondo, tint: 'text-condo' },
  {
    value: 'townhouse',
    label: 'Townhouse',
    check: checkTownhouse,
    tint: 'text-townhouse'
  }
]

export default function TypeFilter({
  selected,
  onToggle
}: {
  selected: PropertyType[]
  onToggle: (type: PropertyType) => void
}) {
  return (
    <div className='flex items-center gap-1'>
      {TYPES.map((type) => {
        const isOn = selected.includes(type.value)
        return (
          <button
            key={type.value}
            type='button'
            aria-pressed={isOn}
            onClick={() => onToggle(type.value)}
            className={clsx(
              'flex cursor-pointer items-center gap-1.5 rounded-lg border py-2 pl-2 pr-3.5 text-sm font-bold text-ink-muted',
              isOn
                ? 'border-line bg-brand-wash/20'
                : 'border-gray-200 bg-white hover:bg-surface-sunken'
            )}
          >
            {isOn ? (
              <img src={type.check} alt='' width={18} height={18} />
            ) : (
              <MaskIcon src={checkRing} size={18} className={type.tint} />
            )}
            {type.label}
          </button>
        )
      })}
    </div>
  )
}
