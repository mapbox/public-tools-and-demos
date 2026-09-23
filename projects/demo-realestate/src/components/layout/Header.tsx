import type { ViewMode } from '../../types/view'
import Logo from './Logo'
import ViewSelector from './ViewSelector'

export default function Header({
  view,
  onViewChange
}: {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
}) {
  return (
    <header className='flex items-center justify-between bg-surface-sunken px-6 py-4'>
      <Logo />
      <ViewSelector value={view} onChange={onViewChange} />
    </header>
  )
}
