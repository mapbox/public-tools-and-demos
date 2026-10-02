import { useState } from 'react'
import clsx from 'clsx'

import bikeIcon from '../../img/icons/bike.svg'
import carIcon from '../../img/icons/car.svg'
import closeIcon from '../../img/icons/close.svg'
import plusIcon from '../../img/icons/plus-brand.svg'
import walkIcon from '../../img/icons/walk.svg'
import {
  DESTINATION_STYLES,
  MAX_DESTINATIONS,
  destinationLetter
} from '../../lib/destinations'
import {
  PROFILES,
  formatDistance,
  formatDuration,
  type Profile
} from '../../lib/directions'
import type { SearchedLocation } from '../../lib/search'
import { useTravel } from '../../state/contexts'
import SuggestionList from '../search/SuggestionList'
import { useLocationSearch } from '../search/useLocationSearch'
import MaskIcon from '../ui/MaskIcon'
import type { RouteState } from './useRoutes'

const PROFILE_ICON: Record<Profile, string> = {
  driving: carIcon,
  walking: walkIcon,
  cycling: bikeIcon
}

/**
 * The small variant of the Figma `Selector` pill (the one its destination rows
 * use), so all three fit on the heading line. Filled when active, a quiet chip
 * otherwise.
 */
function ProfilePills({
  profile,
  onChange
}: {
  profile: Profile
  onChange: (profile: Profile) => void
}) {
  return (
    <div
      role='radiogroup'
      aria-label='Travel by'
      className='flex shrink-0 gap-0.5'
    >
      {PROFILES.map(({ id, label }) => {
        const active = id === profile
        return (
          <button
            key={id}
            type='button'
            role='radio'
            aria-checked={active}
            onClick={() => onChange(id)}
            className={clsx(
              'flex cursor-pointer items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs font-medium',
              active
                ? 'bg-surface-inverse text-ink-inverse'
                : 'bg-surface-sunken text-ink-muted hover:border-line-strong'
            )}
          >
            <MaskIcon
              src={PROFILE_ICON[id]}
              size={14}
              className={clsx(!active && 'opacity-80')}
            />
            <span className={clsx(!active && 'opacity-80')}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function TravelTime({ state }: { state: RouteState | undefined }) {
  if (!state || state.status === 'loading') {
    return <span className='text-sm text-ink-muted'>…</span>
  }
  if (state.status !== 'ready') {
    return (
      <span className='text-sm text-ink-muted'>
        {state.status === 'none' ? 'No route' : 'Unavailable'}
      </span>
    )
  }
  return (
    <span className='flex flex-col items-end'>
      <span className='text-base font-bold whitespace-nowrap text-ink-muted'>
        {formatDuration(state.route.duration)}
      </span>
      <span className='text-xs whitespace-nowrap text-ink-muted/80'>
        {formatDistance(state.route.distance)}
      </span>
    </span>
  )
}

function DestinationSearch({
  onSelect,
  onCancel
}: {
  onSelect: (location: SearchedLocation) => void
  onCancel: () => void
}) {
  const search = useLocationSearch(onSelect)

  return (
    <div className='relative w-full'>
      <div className='flex items-center justify-between gap-2 rounded-full border border-line bg-white py-1.5 pl-4 pr-1.5 drop-shadow-[0px_0px_2px_rgba(0,122,252,0.23)]'>
        <input
          type='text'
          role='combobox'
          aria-expanded={search.open}
          aria-controls='destination-suggestions'
          aria-autocomplete='list'
          autoFocus
          value={search.value}
          onChange={(event) => search.setValue(event.target.value)}
          onKeyDown={(event) => {
            // With no list open, Escape backs out of adding rather than
            // closing the whole listing.
            if (event.key === 'Escape' && !search.open) {
              event.stopPropagation()
              onCancel()
            } else {
              search.onKeyDown(event)
            }
          }}
          onFocus={() => search.suggestions.length > 0 && search.setOpen(true)}
          onBlur={() => window.setTimeout(() => search.setOpen(false), 120)}
          placeholder='Search for a place or address'
          aria-label='Search for a destination'
          className='min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted'
        />
        <button
          type='button'
          onClick={onCancel}
          aria-label='Cancel adding a destination'
          className='flex shrink-0 cursor-pointer items-center rounded-full bg-surface-sunken text-ink-muted'
        >
          <MaskIcon src={closeIcon} size={24} />
        </button>
      </div>

      {search.open && search.suggestions.length > 0 && (
        <SuggestionList
          id='destination-suggestions'
          suggestions={search.suggestions}
          activeIndex={search.activeIndex}
          onChoose={(suggestion) => void search.choose(suggestion)}
          onHover={search.setActiveIndex}
        />
      )}
    </div>
  )
}

/**
 * Places the viewer travels to — work, school, the gym — with the travel time
 * to each from this home, by the chosen profile. Destinations are found with
 * the Search Box API and routed with the Directions API.
 *
 * Destinations, and the chosen profile, belong to the viewer rather than the
 * listing, so they live in app state and carry over from one home to the next.
 */
export default function Destinations({
  routes
}: {
  routes: Map<string, RouteState>
}) {
  const {
    destinations,
    profile,
    setProfile: onProfileChange,
    addDestination: onAdd,
    removeDestination: onRemove
  } = useTravel()
  const [adding, setAdding] = useState(false)
  const full = destinations.length >= MAX_DESTINATIONS

  return (
    <div className='flex h-full flex-col items-start rounded-xl border border-gray-200 bg-white p-2'>
      <div className='flex w-full items-center justify-between gap-2 p-2'>
        <h3 className='truncate text-lg font-medium text-ink'>Travel Times</h3>
        <ProfilePills profile={profile} onChange={onProfileChange} />
      </div>

      {destinations.length === 0 && !adding && (
        <p className='px-2 pb-2 text-sm text-ink-muted'>
          Add the places you go most — work, school, the gym — to see how long
          it takes to get there from this home.
        </p>
      )}

      {destinations.length > 0 && (
        <ul className='w-full'>
          {destinations.map((destination, index) => (
            <li
              key={destination.id}
              className='flex items-center gap-2.5 border-b border-gray-200 p-2'
            >
              <span
                aria-hidden='true'
                className={clsx(
                  'flex size-[30px] shrink-0 items-center justify-center rounded-full border border-gray-200 text-base font-bold text-white',
                  DESTINATION_STYLES[index].className
                )}
              >
                {destinationLetter(index)}
              </span>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-base text-ink-muted'>
                  {destination.name}
                </p>
                {destination.place && (
                  <p className='truncate text-xs text-ink-muted/80'>
                    {destination.place}
                  </p>
                )}
              </div>
              <TravelTime state={routes.get(destination.id)} />
              <button
                type='button'
                onClick={() => onRemove(destination.id)}
                aria-label={`Remove ${destination.name}`}
                className='flex shrink-0 cursor-pointer items-center rounded-full text-ink-muted hover:bg-surface-sunken'
              >
                <MaskIcon src={closeIcon} size={24} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <div className='flex w-full flex-col items-start gap-2.5 px-2 pb-2 pt-4'>
          {adding ? (
            <DestinationSearch
              onSelect={(destination) => {
                onAdd(destination)
                setAdding(false)
              }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              type='button'
              onClick={() => setAdding(true)}
              className='flex cursor-pointer items-center gap-1.5 rounded-full text-sm font-medium text-brand'
            >
              <img src={plusIcon} alt='' width={16} height={16} />
              {destinations.length === 0
                ? 'Add a destination'
                : 'Add another destination'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
