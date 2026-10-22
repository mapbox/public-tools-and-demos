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
