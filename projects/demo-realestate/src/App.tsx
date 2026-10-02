import FilterBar from './components/layout/FilterBar'
import Header from './components/layout/Header'
import LearnMapbox from './components/layout/LearnMapbox'
import ListingsPanel from './components/listings/ListingsPanel'
import MainMap from './components/map/MainMap'
import PropertyPanel from './components/property-panel/PropertyPanel'
import { useIsMobile } from './hooks/useIsMobile'
import { useSelection } from './state/contexts'

/** Layout only; state lives in `AppProvider`. */
export default function App() {
  const { view, setView, selected, panelOpen } = useSelection()
  const isMobile = useIsMobile()

  return (
    <div className='relative flex h-full flex-col overflow-hidden bg-surface-sunken'>
      <Header view={view} onViewChange={setView} />

      {/* On a phone the container goes edge to edge, so the map runs the full
          width beneath the search and filters. */}
      <main className='min-h-0 flex-1 px-6 pb-6 max-md:p-0'>
        <div className='flex h-full min-h-0 flex-col gap-4 rounded-xl border border-line bg-white p-6 max-md:gap-0 max-md:rounded-none max-md:border-0 max-md:p-0'>
          <FilterBar />

          <div className='flex min-h-0 flex-1 gap-6'>
            {view !== 'map' && (
              <div
                className={
                  view === 'split'
                    ? 'flex w-[420px] shrink-0 flex-col'
                    : 'flex min-w-0 flex-1 flex-col'
                }
              >
                {/* A phone's List view uses the sidebar's horizontal cards. */}
                <ListingsPanel
                  layout={
                    view === 'split' || isMobile ? 'horizontal' : 'vertical'
                  }
                />
              </div>
            )}

            {view !== 'list' && (
              <div className='min-h-0 min-w-0 flex-1'>
                <MainMap />
              </div>
            )}
          </div>
        </div>
      </main>

      {selected && panelOpen && (
        <PropertyPanel key={selected.id} listing={selected} />
      )}

      <LearnMapbox />
    </div>
  )
}
