export const tooltipData = [
  {
    title: 'Mapbox GL JS',
    content: `[Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides) is a client-side JavaScript library for building web maps and web applications with Mapbox's modern mapping technology. You can use Mapbox GL JS to display Mapbox maps in a web browser or client, add user interactivity, and customize the map experience in your application.
  
In this demo, Mapbox GL JS is used via a custom React component. Once the map is rendered, Markers are used to add styled elements to the map based on locations in a static dataset.
  
* [Use Mapbox GL JS in a React App](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/)
* [Mapbox GL JS Code Examples](https://docs.mapbox.com/mapbox-gl-js/example/)`
  },
  {
    title: 'Mapbox Search JS',
    content: `[Mapbox Search JS](https://docs.mapbox.com/mapbox-search-js/guides/) is a set of client-side JavaScript libraries for building interactive search experiences using the [Mapbox Search Service](https://docs.mapbox.com/api/search/).
  
In addition to the [Search Box](https://docs.mapbox.com/mapbox-search-js/api/react/search/) component implemented here, the package can also add address autofill to your app's forms and retrieve suggestion coordinates programmatically. 
  
Implementation is available via [React components](https://docs.mapbox.com/mapbox-search-js/api/react/), [Web Components](https://docs.mapbox.com/mapbox-search-js/api/web/), or via the [Core package](https://docs.mapbox.com/mapbox-search-js/core/) which exposes lower-level functionality and allows you to craft a custom UX.`
  },
  {
    title: 'MTS Clustering',
    content: `
  [MTS Clustering](https://docs.mapbox.com/mapbox-tiling-service) allows you to cluster source data using MTS recipes for high point count, low zoom level data visualizations.
  
  Cluster tiled data directly via the Mapbox Tiling Service (MTS) using recipe features. You no longer need to pre-cluster source data before sending it to MTS, nor are you forced to use legacy tools like Tippecanoe if you want to use clustered tilesets with Mapbox. Instead, now you can directly cluster data within MTS, saving time and potentially costs.
  
  * [MTS Clustering Documentation](https://docs.mapbox.com/mapbox-tiling-service)
      `
  },
  {
    title: 'Mapbox Standard Style',
    content: `
  [Mapbox Standard](https://www.mapbox.com/blog/standard-core-style) is the default style used by Mapbox maps. Styles include all of the data and complex symbology for the map, including colors, labels, fonts, atmosphere, etc. Styles are highly customizable, but Mapbox Standard provides a professionally-designed general purpose map style to add your own data to. 
  
  Mapbox Standard enables a highly performant and elegant 3D mapping experience with powerful dynamic lighting capabilities, landmark 3D buildings, and an expertly crafted symbolic aesthetic.
  
  * [Mapbox Standard Demo](https://labs.mapbox.com/labs-standard/#16.2/48.859605/2.293506/-20/62)
  * [Mapbox Standard Documentation](https://docs.mapbox.com/mapbox-gl-js/guides/styles/?size=n_10_n#mapbox-standard-1)
      `
  },
  {
    title: 'Map Markers',
    content: `
  A [Mapbox GL JS Marker](https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker) displays an html element at a specific geographic location which stays fixed to the map as the user pans and zooms.
  
  Markers can be fully customized using html and css, and can trigger other actions on click.
  
  * [Add a default marker to a web map](https://docs.mapbox.com/mapbox-gl-js/example/add-a-marker/)
  * [Add custom icons with Markers](https://docs.mapbox.com/mapbox-gl-js/example/custom-marker-icons/)
      `
  },
  {
    title: 'Popups',
    content: `
  A [Mapbox GL JS Popup](https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup) displays text or html fixed to a geographic location on the map. Popups are often combined with markers to show more information when the marker is clicked.
  
  In this demo, a popup is rendering a custom React Card component. (The same component is used to display property listings in the sidebar)
  
  * [Attach a popup to a marker instance](https://docs.mapbox.com/mapbox-gl-js/example/set-popup/)
  * [Popup Documentation](https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup)
      `
  },
  {
    title: 'Source Code',
    content: `
  Want to learn how we built this?
  
  [Full source code](https://github.com/mapbox/public-tools-and-demos/tree/main/projects/demo-delivery) for this demo is available on Github.
      `
  },
  {
    title: 'Geocoding API',
    content: `
The [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/) is a web service that allows you to convert addresses into geographic coordinates (latitude and longitude) and vice versa. It can be used to search for places, addresses, and points of interest, and it returns structured data about the locations found. 

Use the [Geocoding API Playground](https://docs.mapbox.com/playground/geocoding) to test out the API and see how it works.
    `
  },
  {
    title: 'Static Images API',
    content: `
The [Mapbox Static Images API](https://docs.mapbox.com/api/navigation/static-images/) is a web service that allows you to generate static images of maps and is less resource-intensive alternative to loading an interactive map. You can customize the map style, size, and other parameters to create images that fit your needs. The API returns a URL for the generated image, which can be used in your application.

Use the [Static Images API Playground](https://docs.mapbox.com/playground/static-images) to test out the API and see how it works.`
  }
]
