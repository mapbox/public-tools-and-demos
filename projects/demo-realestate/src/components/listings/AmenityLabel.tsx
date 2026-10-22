import bathIcon from '../../img/icons/bath.svg'
import bedIcon from '../../img/icons/bed.svg'
import rulerIcon from '../../img/icons/ruler.svg'

const ICONS = {
  bed: bedIcon,
  bath: bathIcon,
  area: rulerIcon
} as const

export default function AmenityLabel({
  kind,
  children
}: {
  kind: keyof typeof ICONS
  children: React.ReactNode
}) {
  return (
    <span className='flex items-end gap-1 rounded-[4px] bg-surface-sunken px-1 py-0.5'>
      <img
        src={ICONS[kind]}
        alt=''
        width={16}
        height={16}
        className='max-md:size-3.5'
      />
      <span className='text-sm font-medium text-ink whitespace-nowrap max-md:text-xs'>
        {children}
      </span>
    </span>
  )
}
