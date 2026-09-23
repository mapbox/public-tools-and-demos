import { SearchBoxCore, SessionToken } from '@mapbox/search-js-core'

import accessToken from './mapbox'
import { MAP_CENTER } from './map-defaults'

export const searchBox = new SearchBoxCore({ accessToken })

/**
 * `suggest` and the `retrieve` that follows it must share a session token — the
 * Search Box API bills a session, not individual keystrokes. A session ends at
 * retrieve, so a fresh token is minted after each selection.
 *
 * https://docs.mapbox.com/api/search/search-box/#search-box-api-pricing
 */
export const newSession = () => new SessionToken()

/** Bias results toward the listings area rather than the whole world. */
export const SEARCH_PROXIMITY = MAP_CENTER
