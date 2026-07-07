# Demo Feature Tour

An interactive product demo built with React and [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) that tours a single map through several Mapbox capabilities. Selecting a use case from the panel flies the camera to a new scene and reconfigures the map to demonstrate that feature.

## Use cases demonstrated

- **Globe View** — rotating 3D globe with the Mapbox Standard style
- **3D Basemap** — buildings, landmarks, and trees
- **Markers** — custom pins with popups
- **Data Overlay (2D)** — live seismic event heatmap
- **Wind Speed** — global particle-based wind animation
- **Navigation** — turn-by-turn route guidance
- **Asset Tracking** — fleet locations and delivery isochrones
- **Terrain** — 3D landscape with elevation

Each scene lives in its own module under `src/scenes/`, and is wired up in `src/App.jsx`.

Products used:
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) — map rendering, Standard style config properties, terrain, custom layers/sources
- [Isochrone API](https://docs.mapbox.com/api/navigation/isochrone/) — drive-time contours in the Asset Tracking scene

## Query parameters

- `cooperativeGestures=true` — enables [cooperative gestures](https://docs.mapbox.com/mapbox-gl-js/api/map/#map-parameters) so the map requires a modifier key (or two-finger touch) to pan/zoom instead of capturing all scroll/touch input. Off by default; intended for embedding the demo in an iframe alongside scrollable page content.

## Prerequisites

- Node v18.20 or higher
- Yarn

## How to run

This project lives in a Yarn workspaces monorepo, so dependencies are installed from the repo root.

- Clone this repository
- Install dependencies at the top level of the monorepo: `yarn`
- Copy `projects/.env.sample` to `projects/.env` and add your Mapbox access token:
  ```
  VITE_YOUR_MAPBOX_ACCESS_TOKEN=your_access_token_here
  ```
  You can get a token from your [Mapbox account](https://console.mapbox.com/).
- Run the development server: `cd projects/demo-feature-tour && yarn dev`, then open [http://localhost:5173](http://localhost:5173).
