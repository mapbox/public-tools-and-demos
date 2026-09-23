import heartActiveIcon from '../../img/icons/heart-active.svg'
import heartIcon from '../../img/icons/heart.svg'

export default function FavoriteButton({
  active,
  onToggle,
  label
}: {
  active: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type='button'
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Save'} ${label}`}
      onClick={onToggle}
      className='flex size-7 cursor-pointer items-center justify-center rounded-full bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.08)]'
    >
      <img
        src={active ? heartActiveIcon : heartIcon}
        alt=''
        width={16}
        height={16}
      />
    </button>
  )
}
