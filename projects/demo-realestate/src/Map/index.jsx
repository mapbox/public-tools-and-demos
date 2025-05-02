import PropTypes from 'prop-types'
import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import Marker from '../Marker'
import Card from '../Card'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

// This demo imports accessToken from your .env file and it's exported for use in App.jsx by SearchBox. To use this demo rename your .env.sample file to .env and add your Mapbox access token.
export const accessToken = (mapboxgl.accessToken =
  import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN)

const Map = ({ data, onLoad, onFeatureClick }) => {
  const mapContainer = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  let mapRef = useRef(null)

  useEffect(() => {
    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      center: [-75.15654, 39.94596],
      zoom: 12
    }))

    map.addControl(new mapboxgl.NavigationControl())

    map.on('load', () => {
      onLoad(map)
      setMapLoaded(true)
    })
  }, [])

  return (
    <>
      <div ref={mapContainer} className='h-full w-full' />
      {mapLoaded &&
        data &&
        data.map((d, i) => (
          <Marker key={i} feature={d} map={mapRef.current}>
            <Card feature={d} width={300} shortImage onClick={onFeatureClick} />
          </Marker>
        ))}
    </>
  )
}

Map.propTypes = {
  data: PropTypes.object,
  onFeatureClick: PropTypes.func,
  onLoad: PropTypes.func
}

export default Map
