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
import Instructions from './Instructions'
import AdminMockUI from './AdminMockUI'

import './styles.css'

export const ORIGIN_COORDINATES = [-118.2096765, 33.7699914] // Los Angeles, CA

export default function Home() {
  const [adminPanelData, setAdminPanelData] = useState([
    {
      timestamp: '2025-06-09 08:30',
      location: '130 Pico Avenue, Long Beach, California 90802, United States',
      fuelStatus: '100%',
      averageSpeed: '--',
      legDistance: '--'
    }
  ])

  const [status, setStatus] = useState('ready to ship')
  const [location, setLocation] = useState('In warehouse')
  const [point, setPoint] = useState({
    type: 'Point',
    coordinates: ORIGIN_COORDINATES
  })

  const [waypoints, setWaypoints] = useState([ORIGIN_COORDINATES])

  const [track, setTrack] = useState({
    type: 'Feature',
    properties: {},
    geometry: {
      coordinates: [ORIGIN_COORDINATES],
      type: 'LineString'
    }
  })

  const [pointMoved, setPointMoved] = useState(false)

  // A ref to hold the Mapbox GL JS Map instance
  const mapInstanceRef = useRef()

  // when the map loads
  const handleMapLoad = (map) => {
    mapInstanceRef.current = map

    setTrack({
      ...track
    })
  }

  const handleMarkerMove = (point) => {
    setPoint(point)
    setPointMoved(true)
    setWaypoints((prev) => {
      return [...prev, point.coordinates]
    })
  }
  useEffect(() => {
    if (!pointMoved || !point?.coordinates) return

    const run = async () => {
      const newCoords = point.coordinates
      const prevCoords = waypoints[waypoints.length - 2]

      try {
        const [geoRes, directionsRes] = await Promise.all([
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${newCoords[0]},${newCoords[1]}.json?access_token=${accessToken}`
          ),
          fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${prevCoords[0]},${prevCoords[1]};${newCoords[0]},${newCoords[1]}?alternatives=false&geometries=geojson&overview=simplified&steps=false&access_token=${accessToken}`
          )
        ])

        const geoData = await geoRes.json()
        const dirData = await directionsRes.json()

        const locationContext = geoData?.features[0]?.context

        const city =
          locationContext?.find((context) => context.id.startsWith('place'))
            ?.text || 'Unknown City'

        const state =
          locationContext
            ?.find((context) => context.id.startsWith('region'))
            ?.short_code.slice(-2) || 'Unknown State'

        const locationName = `${city}, ${state}`

        const legDistance = Math.round(dirData.routes[0].distance / 1000)
        const routeGeometry = dirData.routes[0].geometry

        const currentTime = new Date()
        const lastEntry = adminPanelData[adminPanelData.length - 1]
        const lastTime = lastEntry ? new Date(lastEntry.timestamp) : currentTime
        const addedHours = Math.floor(Math.random() * 12) + 12
        currentTime.setHours(lastTime.getHours() + addedHours)

        const newEntry = {
          timestamp: currentTime.toISOString().slice(0, 16).replace('T', ' '),
          location: geoData.features[0].place_name,
          fuelStatus: `${Math.floor(Math.random() * 40) + 20}%`,
          averageSpeed: `${Math.floor(Math.random() * 30) + 60}`,
          legDistance: legDistance.toString()
        }

        setAdminPanelData((prev) => [...prev, newEntry])
        setTrack((prev) => ({
          ...prev,
          geometry: {
            ...prev.geometry,
            coordinates: [
              ...prev.geometry.coordinates,
              ...routeGeometry.coordinates
            ]
          }
        }))

        setLocation(locationName)
        setStatus('In transit')
      } catch (err) {
        console.error('Error processing marker move:', err)
      } finally {
        setPointMoved(false)
      }
    }

    run()
  }, [waypoints])

  return (
    <>
      <main className='flex flex-col h-screen relative'>
        <Navbar />

        {/* Main Content Wrapper */}
        <div className='grow relative min-h-0 p-6 flex flex-col sm:flex-row gap-6 overflow-hidden'>
          <div className='grow relative min-w-0 h-1/2 sm:h-auto flex gap-6 flex-col'>
            {/* left side  */}
            <Instructions />
            <div className='w-full grow h-full sm:h-1/2'>
              <Map
                track={track}
                waypoints={waypoints}
                onLoad={handleMapLoad}
                onMarkerMove={handleMarkerMove}
              />
            </div>
            <div className='block hidden sm:block h-1/2 w-full'>
              <AdminMockUI data={adminPanelData} />
            </div>
          </div>
          <div
            className='overflow-scroll h-1/2 sm:h-auto'
            style={{ minWidth: 306 }}
          >
            <PhoneFrame>
              <DeliveryAppUI
                location={location}
                status={status}
                point={point}
              />
            </PhoneFrame>
          </div>
        </div>
      </main>
    </>
  )
}
