## Isochrone Intersect Demo

This demonstration uses the Mapbox Isochrone API and the spatial analysis library turf.js to identify areas of overlap when traveling for a given time period from two nearby points. Once the overlap area is established, the Mapbox Geocoding API is used to find nearby Points of Interest (Cafes, Restautants, or Bars) that would serve as a suitable "meet-in-the-middle" location.

Products used:
* [Isochrone API](https://docs.mapbox.com/api/navigation/isochrone/)
* [Mapbox Search JS](https://docs.mapbox.com/mapbox-search-js/guides/)


## Local Development

Install dependencies at the top level of the monorepo:

```
> yarn
```

cd into this directory and run the development server:

```
cd projects/isochrone-intersect && yarn dev
```