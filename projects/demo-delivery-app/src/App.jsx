// Top Level App component
// Sets up the app layout and imports our
// Navbar, Phone frame, Phone Content, and Map

'use client'

import { useRef, useEffect, useState } from 'react'
import { accessToken } from 'mapbox-demo-components'

import Navbar from './Navbar'
import PhoneFrame from './PhoneFrame'
import Map from './Map'
import DeliveryAppUI from './DeliveryAppUI'

import './styles.css'

export const ORIGIN_COORDINATES = [-118.2096765, 33.7699914] // Los Angeles, CA

const Link = ({ to, children }) => (
  <a className="text-blue-600 hover:text-blue-500 font-bold hover:underline" href={to} rel="noopener noreferrer">{children}</a>
)

export default function Home() {


  const [status, setStatus] = useState('ready to ship');
  const [location, setLocation] = useState('In warehouse');
  const [point, setPoint] = useState({
    type: 'Point',
    coordinates: ORIGIN_COORDINATES
  })

  const [waypoints, setWaypoints] = useState([ORIGIN_COORDINATES]);

  const [track, setTrack] = useState({
    "type": "Feature",
    "properties": {},
    "geometry": {
      "coordinates": [
        ORIGIN_COORDINATES
      ],
      "type": "LineString"
    }
  });

  const [pointMoved, setPointMoved] = useState(false);


  // A ref to hold the Mapbox GL JS Map instance
  const mapInstanceRef = useRef()


  // when the map loads
  const handleMapLoad = (map) => {
    mapInstanceRef.current = map

    setTrack({
      ...track
    })
  }

  const fetchDirectionsAPI = async (start, end) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?alternatives=false&geometries=geojson&overview=simplified&steps=false&notifications=none&access_token=${accessToken}`
    try {
      const response = await fetch(url)
      const data = await response.json()
      return data.routes[0].geometry
    } catch (error) {
      console.error('Error fetching directions:', error)
    }
  }


  const handleMarkerMove = async (point) => {
    setPoint(point)
    setPointMoved(true)
    setWaypoints(prevWaypoints => [...prevWaypoints, point.coordinates])

    // Use a function to get the latest coordinates yourself
    setTrack(prevTrack => {
      const lastCoord = prevTrack.geometry.coordinates[prevTrack.geometry.coordinates.length - 1];

      // Call the API *within* the updater
      fetchDirectionsAPI(lastCoord, point.coordinates).then(routeLineString => {
        setTrack(innerPrev => ({
          ...innerPrev,
          geometry: {
            ...innerPrev.geometry,
            coordinates: [
              ...innerPrev.geometry.coordinates,
              ...routeLineString.coordinates
            ]
          }
        }));
      });

      // Return the original track unchanged for now
      return prevTrack;
    });
  }

  useEffect(() => {
    if (!point?.coordinates) return;

    if (!pointMoved) return;

    const [lng, lat] = point.coordinates;

    const fetchReverseGeocode = async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`
        );

        const data = await res.json();

        // get the 'place' feature (2nd in the array)
        // and use it to set the location state
        // if there is no place, set it to "Unknown location"
        const place = data?.features?.[1]?.place_name || "Unknown location";
        setLocation(place)
        setStatus("In transit");
      } catch (err) {
        console.error("Reverse geocoding error:", err);
      }
    };

    fetchReverseGeocode();
  }, [point]);

  return (
    <>
      <main className='flex flex-col h-screen relative'>
        <Navbar />

        {/* Main Content Wrapper */}
        <div className='grow relative min-h-0 p-6 flex flex-col sm:flex-row gap-6 overflow-hidden'>
          <div className='grow relative min-w-0 h-1/2 sm:h-auto flex gap-6 flex-col sm:flex-row'>
            <div className='sm:absolute top-6 left-6 right-6 bg-white z-10 text-xs rounded-md sm:p-4 sm:max-w-96 sm:shadow'>
              <p className='mb-3'>Drag the truck icon to a new location to simulate a shipment in progress.</p>

              <p className='mb-3'>When the truck stops, the app initiates a <Link to="https://docs.mapbox.com/api/search/geocoding/#reverse-geocoding">reverse geocoding request</Link> to fetch a human-readable address from its GPS coordinates</p>

              <p className=''>You can then use this location text, along with a <Link to="https://docs.mapbox.com/api/maps/static-images/">static map image</Link>, to show the shipment's location in a consumer-facing app.</p>

            </div>
            <div className='w-full grow sm:h-full'>
            <Map track={track} waypoints={waypoints} onLoad={handleMapLoad} onMarkerMove={handleMarkerMove} />
            </div>
          </div>
          <div className='w-128 overflow-scroll h-1/2 sm:h-auto'>
            <PhoneFrame>
              <DeliveryAppUI location={location} status={status} point={point} />
            </PhoneFrame>
          </div>
        </div>
      </main>
    </>
  )
}
