import clsx from 'clsx'

import checkMultifamily from '../../img/icons/check-multifamily.svg'
import checkHouse from '../../img/icons/check-house.svg'
import checkTownhouse from '../../img/icons/check-townhouse.svg'
import type { PropertyType } from '../../types/listing'

const TYPES: {
  value: PropertyType
  label: string
  check: string
  ring: string
}[] = [
  { value: 'house', label: 'House', check: checkHouse, ring: 'border-house' },
  {
    value: 'multi-family',
    label: 'Multi-family',
    check: checkMultifamily,
    ring: 'border-multifamily'
  },
  {
    value: 'townhouse',
    label: 'Townhouse',
    check: checkTownhouse,
    ring: 'border-townhouse'
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
              'flex cursor-pointer items-center gap-1.5 rounded-lg border py-2 pl-2 pr-3.5 text-sm font-medium text-ink-muted',
              isOn
                ? 'border-line bg-brand-wash/20'
                : 'border-gray-200 bg-white hover:bg-surface-sunken'
            )}
          >
            {isOn ? (
              <img src={type.check} alt='' width={18} height={18} />
            ) : (
              // An empty ring in the type colour. Figma's unchecked asset bakes a
              // white tick inside the circle, which would turn the type colour too
              // if it were masked — so the circle is drawn in CSS instead.
              <span
                className={clsx(
                  'size-[18px] shrink-0 rounded-full border-[1.5px]',
                  type.ring
                )}
              />
            )}
            {type.label}
          </button>
        )
      })}
    </div>
  )
}
