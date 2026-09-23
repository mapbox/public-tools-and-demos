import closeIcon from '../../img/icons/close.svg'
import searchIcon from '../../img/icons/search.svg'
import MaskIcon from '../ui/MaskIcon'

export default function SearchBar({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className='flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-4'>
      <span className='flex items-center rounded-full border border-gray-200 p-1.5 text-ink-muted'>
        <MaskIcon src={searchIcon} />
      </span>
      <input
        type='search'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder='Search an address, neighborhood, or ZIP'
        aria-label='Search an address, neighborhood, or ZIP'
        className='w-[336px] bg-transparent text-base text-ink outline-none placeholder:text-line-strong [&::-webkit-search-cancel-button]:appearance-none'
      />
      <button
        type='button'
        onClick={() => onChange('')}
        aria-label='Clear search'
        className={`flex cursor-pointer items-center rounded-full bg-surface-sunken p-1 text-ink-muted transition-opacity ${
          value ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <MaskIcon src={closeIcon} size={16} />
      </button>
    </div>
  )
}
