/**
 * Read straight from the env rather than via `mapbox-demo-components`. That
 * package's barrel also exports a `Map` component which imports its own nested
 * mapbox-gl v2 — pulling a second, conflicting copy of GL JS into this bundle
 * just to obtain a string.
 */
const accessToken = import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN as
  | string
  | undefined

if (!accessToken) {
  console.warn(
    'Missing VITE_YOUR_MAPBOX_ACCESS_TOKEN. Add it to projects/.env — see projects/.env.sample.'
  )
}

export default accessToken ?? ''
