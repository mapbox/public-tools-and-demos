import MapboxTooltip from "./MapboxTooltip";

const MapboxTooltips = () => {

    return (
    <div className='px-3 flex shrink-0 justify-start h-14 items-center border-b border-gray-200  overflow-scroll'>
        <MapboxTooltip title='Mapbox Search JS' className='mr-3'>
        {`
    [Mapbox Search JS](https://docs.mapbox.com/mapbox-search-js/guides/) is a set of client-side JavaScript libraries for building interactive search experiences using the [Mapbox Search Service](https://docs.mapbox.com/api/search/).

    In addition to the [Search Box](https://docs.mapbox.com/mapbox-search-js/api/react/search/) component implemented here, the package can also add address autofill to your app's forms and retrieve suggestion coordinates programmatically. 

    Implementation is available via [React components](https://docs.mapbox.com/mapbox-search-js/api/react/), [Web Components](https://docs.mapbox.com/mapbox-search-js/api/web/), or via the [Core package](https://docs.mapbox.com/mapbox-search-js/core/) which exposes lower-level functionality and allows you to craft a custom UX.          
        `}
        </MapboxTooltip>
        <MapboxTooltip title='Mapbox GL JS' className={'mr-3'}>
        {`
    [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides) is a client-side JavaScript library for building web maps and web applications with Mapbox's modern mapping technology. You can use Mapbox GL JS to display Mapbox maps in a web browser or client, add user interactivity, and customize the map experience in your application.

    In this demo, Mapbox GL JS is used via a custom React component. Once the map is rendered, Markers are used to add styled elements to the map based on locations in a static dataset.

    * [Use Mapbox GL JS in a React App](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/)
    * [Mapbox GL JS Code Examples](https://docs.mapbox.com/mapbox-gl-js/example/)
    `}
        </MapboxTooltip>

        <MapboxTooltip title='Mapbox Standard Style' className={'mr-3'}>
        {`
    [Mapbox Standard](https://www.mapbox.com/blog/standard-core-style) is the default style used by Mapbox maps. Styles include all of the data and complex symbology for the map, including colors, labels, fonts, atmosphere, etc. Styles are highly customizable, but Mapbox Standard provides a professionally-designed general purpose map style to add your own data to. 

    Mapbox Standard enables a highly performant and elegant 3D mapping experience with powerful dynamic lighting capabilities, landmark 3D buildings, and an expertly crafted symbolic aesthetic.

    * [Mapbox Standard Demo](https://labs.mapbox.com/labs-standard/#16.2/48.859605/2.293506/-20/62)
    * [Mapbox Standard Documentation](https://docs.mapbox.com/mapbox-gl-js/guides/styles/?size=n_10_n#mapbox-standard-1)
    `}
        </MapboxTooltip>

        <MapboxTooltip title='Map Markers' className={'mr-3'}>
        {`
    A [Mapbox GL JS Marker](https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker) displays an html element at a specific geographic location which stays fixed to the map as the user pans and zooms.

    Markers can be fully customized using html and css, and can trigger other actions on click.

    * [Add a default marker to a web map](https://docs.mapbox.com/mapbox-gl-js/example/add-a-marker/)
    * [Add custom icons with Markers](https://docs.mapbox.com/mapbox-gl-js/example/custom-marker-icons/)
    `}
        </MapboxTooltip>

        <MapboxTooltip title='Popups' className={'mr-3'}>
        {`
    A [Mapbox GL JS Popup](https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup) displays text or html fixed to a geographic location on the map. Popups are often combined with markers to show more information when the marker is clicked.

    In this demo, a popup is rendering a custom React Card component. (The same component is used to display property listings in the sidebar)

    * [Attach a popup to a marker instance](https://docs.mapbox.com/mapbox-gl-js/example/set-popup/)
    * [Popup Documentation](https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup)
    `}
        </MapboxTooltip>

        <MapboxTooltip title='Source Code' className={'mr-3'}>
        {` Want to learn how we built this?
        
    [Full source code](https://github.com/mapbox/public-tools-and-demos/tree/main/projects/demo-realestate) for this demo is available on Github.`}
        </MapboxTooltip>
    </div>
    )

}

export default MapboxTooltips;