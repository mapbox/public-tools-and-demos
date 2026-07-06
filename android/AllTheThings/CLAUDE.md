# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"All The Things" is a public demo project used to showcase and get familiar with Mapbox SDKs.

This folder contains an Android app based on the canonical template created by the Android CLI: `android create --name="All The Things" --output=AllTheThings --minSdk=26`. It has a single `:app` module, package `com.example.allthethings`) built with Jetpack Compose, Navigation 3, and Kotlin coroutines/serialization.

## Requirements

- Java 17.
- Android CLI (optional).

## Credentials

Mapbox SDKs require both a `MAPBOX_DOWNLOADS_TOKEN` (at build time) to get the SDK artifacts from the Maven repository, and a `MAPBOX_ACCESS_TOKEN` to use Mapbox services (at runtime). Assume both are installed under `~/.gradle/gradle.properties`, we do not want to commit either token to the repository.

## New Feature Development

When adding a new feature to the app, follow this workflow:
1. Make the necessary code changes to implement the new feature. Add new composables to new files to keep the main screen manageable.
2. Verify the app is building without errors (`./gradlew assembleDebug`)
3. Install (`./gradlew installDebug`), launch the app on the connected device (with `adb`) and wait for the user to validate the new feature. Do not interact with the running application or capture videos or screenshots. The user will validate the feature and provide feedback if necessary.   

Because this is a demo project, do not update or run tests when adding new features.
There is no lint/format tool configured in this repo yet (no ktlint/detekt/spotless).

## Dependencies

- The project integrates Mapbox Maps SDK, Search SDK, and Navigation SDK. It also includes the Mapbox Java Services for easier access to Mapbox REST APIs.
- If you need to install additional Mapbox dependencies, follow the existing patterns to make sure you are using SDKs with the same minor version number. For example if you are using v1.25 of the Navigation SDK, you should use v2.25 of the Search SDK. This ensures version compatibility with the shared Mapbox Common SDK.
- The project uses AGP 9 that enforces that each library has a distinct package name. If you encounter related build issues, set `android.uniquePackageNames=false` in `gradle.properties`.

## Architecture

- Navigation: Uses Navigation 3 (`androidx.navigation3`), not the older Navigation Compose library. `NavigationKeys.kt` defines `@Serializable` `NavKey` objects/data classes for each destination (currently just `Main`). `Navigation.kt` builds the back stack with `rememberNavBackStack` and wires destinations via `entryProvider { entry<T> { ... } }` inside a `NavDisplay`. Add new screens by declaring a new `NavKey` and a corresponding `entry<T>` block.
- Screen structure: Each feature lives under `ui/<feature>/` with two files: a `*Screen.kt` (stateful `@Composable` that collects a `StateFlow` from the ViewModel via `collectAsStateWithLifecycle`, plus a stateless `@Composable` overload for previews/tests) and a `*ViewModel.kt` (exposes a sealed `UiState` interface with `Loading` / `Success` / `Error` variants, built with `.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), Loading)`). Follow this Loading/Success/Error pattern for new screens. ViewModels are constructed manually via `viewModel { MainScreenViewModel(DefaultDataRepository()) }` (no DI framework wired up yet).
- Sample data: `app/src/main/assets/attractions.json` is a GeoJSON `FeatureCollection` of points of interest (id, name, description, tags, category) intended as sample/demo content.
- Version catalog: All dependency versions are centralized in `gradle/libs.versions.toml` (Gradle version catalogs) and referenced via `libs.*` aliases in `app/build.gradle.kts` — add new dependencies there rather than hardcoding coordinates.
