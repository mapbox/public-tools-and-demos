# Mapbox Standard Style Theme Editor

An interactive tool for creating custom color themes for the [Mapbox Standard Style](https://docs.mapbox.com/map-styles/standard/guides/) using 3D [Look-Up Tables](https://en.wikipedia.org/wiki/3D_lookup_table) (LUTs).

Adjust parameters and see the results applied to a live Mapbox GL JS map in real time. Export the LUT as a PNG for use in Mapbox Studio, or copy the Base64 string to use directly in Mapbox GL JS or Mobile Maps SDK projects.

## Controls

- **Exposure / Brightness / Contrast** — Basic tonal adjustments
- **Hue / Saturation / Value / Vibrancy** — Global color adjustments
- **Cross Process** — Film-style color shift
- **Color Curves** — Per-channel (R/G/B) tone curves
- **Color Wheels** — Lift / Gamma / Gain color grading
- **Color Corrections** — Targeted hue/saturation/value shifts for specific colors sampled from the map

## Getting Started

```bash
# From the repo root
npm run dev --workspace=projects/standard-style-theme-editor
```

Requires a `VITE_YOUR_MAPBOX_ACCESS_TOKEN` in `projects/.env`.

## Credits

Controls inspired by [lut-maker](https://o-l-l-i.github.io/lut-maker/) by o-l-l-i.
