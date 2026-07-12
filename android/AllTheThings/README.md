# All The Things

"All The Things" is a demo Android application that integrates all the major building blocks of the Mapbox SDKs in a single app — hence the name. It combines the [Maps SDK](https://docs.mapbox.com/android/maps/guides/), the [Search SDK](https://docs.mapbox.com/android/search/guides/), and the [Navigation SDK UX Framework](https://docs.mapbox.com/android/navigation/ux/guides/) to go from a map, to place search, to turn-by-turn navigation.

## What it demonstrates

- **Maps**: a full-screen `MapboxMap` composable with the Standard and Standard Satellite styles, a globe-to-city camera fly-in, markers loaded from a GeoJSON asset, an Isochrone API layer, and an automated camera tour of the attractions.
- **Search**: a Place Autocomplete bottom sheet with live results (name, category, icon, and distance), biased around Orlando, FL.
- **Navigation**: a turn-by-turn navigation screen powered by `DashNavigationFragment`, launched by tapping "Navigate" on an attraction or a search result, with location simulation enabled for demoing.

## Requirements

- Java 17
- A Mapbox account with:
  - `MAPBOX_DOWNLOADS_TOKEN` — a secret token used at build time to download the SDK artifacts.
  - `MAPBOX_ACCESS_TOKEN` — a public token used at runtime to access Mapbox services.

Add both to `~/.gradle/gradle.properties`:

```properties
MAPBOX_DOWNLOADS_TOKEN=sk.ey...
MAPBOX_ACCESS_TOKEN=pk.ey...
```

Neither token should be committed to the repository.

## Build and run

```bash
./gradlew assembleDebug   # build
./gradlew installDebug    # install on a connected device
```

## Following along

The repository is tagged at two checkpoints so you can check out the demo at either end of its development:

```bash
# Step 00: initial project setup with the Mapbox dependencies installed
git checkout att/step-00

# Step 99: final project with map, search, and the full Navigation SDK integrated
git checkout att/step-99
```

## Developing with AI tools

The project includes a [`CLAUDE.md`](CLAUDE.md) file with project context, conventions, and workflows to help AI coding assistants (such as Claude Code) work effectively in this codebase. Developers are also encouraged to integrate the official [Mapbox MCP server](https://docs.mapbox.com/api/guides/mcp-server/) and its skills, which give AI assistants direct access to Mapbox services like geocoding, routing, isochrones, and static maps.

## Project structure

The app is a single `:app` module built with Jetpack Compose, Navigation 3, and Kotlin coroutines. Each feature lives under `ui/<feature>/` with a `*Screen.kt` and a `*ViewModel.kt` following a `Loading`/`Success`/`Error` state pattern. Sample data comes from `app/src/main/assets/attractions.json`, a GeoJSON `FeatureCollection` of points of interest around Orlando, FL. Dependency versions are centralized in `gradle/libs.versions.toml`.

## Prompts

Sample prompts to give your coding agent:

> Discard any local changes and check out the `att/step-99` tag.

### Project Setup

> Follow the instructions on https://docs.mapbox.com/android/navigation/ux/guides/install/ to install the Mapbox Navigation UXF in this project. Initialize the framework and make sure the app builds without errors, but don't modify any screens just yet. If you encounter any issues, follow the guidance in the instructions' troubleshooting section.

> Follow the instructions on https://docs.mapbox.com/android/maps/guides/install/ to install the Maps Compose extension in this project. Like before, only make sure the application builds without errors; do not modify any screens yet.

> Follow the instructions on https://docs.mapbox.com/android/search/guides/install/ to install the Search Autocomplete extension in this project. Like before, only make sure the application builds without errors; do not modify any screens yet.

### Project Features

> Remove the placeholder content and the padding in the MainScreen and add a MapboxMap composable that uses all the available space. Add the necessary top and bottom padding to the scale bar, logo, and attribution to avoid overlapping with the system bars. Follow the guidance on https://docs.mapbox.com/android/maps/guides/install/#part-3-add-a-map

> I can see the globe. Could you make the map animate over 2 seconds from the globe view to a zoomed-in view of Orlando, Florida?

> The animation is working. Add a BottomAppBar that has one toggle button to switch between the Mapbox Standard (default) and Mapbox Satellite styles on the map. Add the necessary padding to avoid overlapping with the bottom system bar. Center the button horizontally.

> Looking good. Now use the Mapbox Java Services library to render an isochrone layer using the mapbox/driving-traffic profile around the map's initial location in Orlando. Otherwise, use reasonable default values. API docs are available here: https://docs.mapbox.com/api/navigation/isochrone/

> All is working. Next, use the attractions GeoJSON data in the assets folder to add a marker on the map for each feature. When I tap on a marker, show me a summary of that feature's information in a modal bottom sheet. The map should adjust its camera to show all the markers. Make sure to load the image URLs included in the feature data with Coil to make this feature visually rich. The bottom sheet should include a "Navigate" button that for now doesn't do anything. Documentation for Mapbox map markers is available here: https://docs.mapbox.com/android/maps/guides/add-your-data/markers/

> Add a new Play/Pause toggle to the BottomAppBar. When we're in Play mode, execute a camera flyby where you spend 5 seconds on each attraction, and rotate through them indefinitely. The flyby stops when you hit Pause.

> Read https://docs.mapbox.com/android/search/guides/search-by-text/ - Then add a new button to the BottomAppBar that opens a bottom sheet over the map. The bottom sheet includes a text input centered at the top. Under the hood, it uses the Mapbox Search SDK PlaceAutocomplete object to show live results. We want to build the standard autocomplete experience. Each row shows the name, category, icon, and distance of the search result, and nothing needs to happen when you tap on a result. Use Orlando, Florida as the proximity bias.

> Connect the Navigate button that we attached to each feature summary earlier to open a new Navigation Activity that includes the navigation fragment documented on https://docs.mapbox.com/android/navigation/ux/guides/install/ and sets the place coordinates as the destination with DashNavigationFragment.setDestination(). The same thing should happen when you tap on a search result in the autocomplete screen.
