## Real Estate Developer Demo - React

This is a developer demo app built with React and various Mapbox tools and services, demonstrating the UI/UX of a home search app. It has split, list and map views of around 21,000 homes in King County, Washington, with filters, location search, a draw-your-own search area, a property card on the map, and a full listing with travel times and an interactive map.

Built with React 19, TypeScript, Tailwind CSS 4 and Vite. The "Learn Mapbox" bar at the bottom of the app explains how each Mapbox product is used; its copy lives in `src/data/products.ts`.

Products used:
* [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides)
* [Mapbox Search JS](https://docs.mapbox.com/mapbox-search-js/guides/)
* [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)
* [Mapbox Static Images API](https://docs.mapbox.com/api/maps/static-images/)
* [Mapbox GL Draw](https://github.com/mapbox/mapbox-gl-draw)
* [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/) (used by the data scripts, not at runtime)

Product Features Used Here:
* [Mapbox Standard Style](https://docs.mapbox.com/map-styles/standard/guides/) - customised entirely through configuration properties, with a menu to switch to Standard Satellite and between light presets
* [Custom Markers](https://docs.mapbox.com/mapbox-gl-js/example/custom-marker-icons/) - price labels and dots, placed so labels never collide
* [Popups](https://docs.mapbox.com/mapbox-gl-js/example/popup/) - the property card, anchored to the selected listing's marker
* Building highlight - the selected listing's building, through Mapbox Standard's buildings featureset
* Search Box sessions - `suggest` and `retrieve` from Search JS Core, sharing a session token
* A custom GL Draw mode - freehand drawing of an area to limit listings to

## Data used in this demo

The listings come from the public [House Sales in King County, USA](https://www.kaggle.com/datasets/harlfoxem/housesalesprediction) dataset, converted to GeoJSON and served from `public/data/listings.json`. Each listing's location and address come from [King County GIS](https://gis-kingcounty.opendata.arcgis.com/) address points, and its property type from the King County Assessor's parcel data. The dataset has no photos, so listings show CC0 stock interior photos listed in `src/data/interiors.json`.

The scripts in `scripts/` build the dataset and photos; you only need them to regenerate the data. Each one explains its usage at the top of the file.

Street view uses 360° imagery from [KartaView](https://kartaview.org), an open, third-party imagery platform licensed CC BY-SA 4.0, shown with [Photo Sphere Viewer](https://photo-sphere-viewer.js.org).

## Local Development

Install dependencies at the top level of the monorepo:

```
> yarn
```

Copy `projects/.env.sample` to `projects/.env` and add your Mapbox access token, which you can get from your [Mapbox account](https://console.mapbox.com/):

```
VITE_YOUR_MAPBOX_ACCESS_TOKEN=your_access_token_here
```

cd into this directory and run the development server:

```
cd projects/demo-realestate && yarn dev
```
