import type { ViewMode } from '../../types/view'
import Logo from './Logo'
import SearchBar from './SearchBar'
import ViewSelector from './ViewSelector'

export default function Header({
  view,
  onViewChange,
  search,
  onSearchChange
}: {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  search: string
  onSearchChange: (value: string) => void
}) {
  return (
    <header className='flex items-center justify-between bg-surface-sunken px-6 py-4'>
      <div className='flex items-center gap-8'>
        <Logo />
        <SearchBar value={search} onChange={onSearchChange} />
      </div>
      <ViewSelector value={view} onChange={onViewChange} />
    </header>
  )
}
