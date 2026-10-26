import { useCallback, useSyncExternalStore } from 'react'

/** Tailwind's `max-md`, so JS and CSS agree on where mobile starts. */
const MOBILE_QUERY = '(width < 48rem)'

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query]
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}

/**
 * For the few places mobile changes structure rather than styling, such as
 * the filters moving into a sheet. Styling alone uses `max-md:` classes.
 */
export const useIsMobile = () => useMediaQuery(MOBILE_QUERY)

/**
 * Split's listing column is 420px, which on a portrait iPad up to the 11"
 * (834px) leaves the map too narrow to use. Tailwind's `max-[835px]` matches.
 */
export const useNoSplit = () => useMediaQuery('(width < 835px)')

/**
 * Search, price, beds, types and Saved need ~1340px of window in one row, and
 * Map view's result count ~100px more; narrower than that (tablets, small
 * laptops) they wrap and overflow the card, so the filters collapse behind a
 * button as on a phone.
 */
export const useCompactFilters = (withCount: boolean) =>
  useMediaQuery(withCount ? '(width < 91rem)' : '(width < 84rem)')
