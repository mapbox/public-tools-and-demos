## Store Locator Developer Demo - React

This is a developer demo app built with React and various Mapbox tools and services, demonstrating the UI/UX of store locator app. This application contains many customization which are not needed for a simple store locator, but provides the framework for you to build your own, and a demonstration of more complex Mapbox features/products like MTS clustering, marker animations, usage of users geolocation, custom animations and
different UI patterns for mobile vs desktop. 

## Data used in this demo
Mapbox has a data processing pipeline for creating custom tilests based on GeoJSON data.  This demo is using store location data which has been processed via the [Tilesets CLI](https://docs.mapbox.com/mapbox-tiling-service/guides/#tilesets-cli) and which is hosted on Mapbox infrastructure.  You can store your own data in a local GeoJSON file, upload your data via [Mapbox Studio](https://docs.mapbox.com/studio-manual/guides/geospatial-data/#uploading-data-to-add-to-a-map) or use the [Tilesets CLI](https://docs.mapbox.com/mapbox-tiling-service/guides/#tilesets-cli).


Products used:
* [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides)
* [Mapbox Search JS](https://docs.mapbox.com/mapbox-search-js/guides/)
* [Mapbox Tiling Service](https://docs.mapbox.com/mapbox-tiling-service/guides)


## Local Development

Install dependencies at the top level of the monorepo:

```
> yarn
```

cd into this directory and run the development server:

```
cd projects/demo-store-locator && yarn dev
```