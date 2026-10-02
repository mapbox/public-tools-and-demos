import clsx from 'clsx'

import heartActiveIcon from '../../img/icons/heart-active.svg'
import heartIcon from '../../img/icons/heart.svg'

export default function FavoriteButton({
  active,
  onToggle,
  label,
  size = 'sm'
}: {
  active: boolean
  onToggle: () => void
  label: string
  /** `md` is the property card's larger control; `sm` sits on listing cards. */
  size?: 'sm' | 'md'
}) {
  const icon = size === 'md' ? 18 : 16
  return (
    <button
      type='button'
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Save'} ${label}`}
      onClick={onToggle}
      className={clsx(
        'flex cursor-pointer items-center justify-center rounded-full bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.08)]',
        size === 'md' ? 'size-8' : 'size-7'
      )}
    >
      <img
        src={active ? heartActiveIcon : heartIcon}
        alt=''
        width={icon}
        height={icon}
      />
    </button>
  )
}
