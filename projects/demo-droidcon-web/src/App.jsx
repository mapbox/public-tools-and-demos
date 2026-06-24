import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { SearchBox } from '@mapbox/search-js-react'
import attractions from './data/attractions.json'
import './App.css'

const ACCESS_TOKEN = import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN
mapboxgl.accessToken = ACCESS_TOKEN

async function fetchIsochrones(lng, lat) {
  const url = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${lng},${lat}?contours_minutes=10,20&polygons=true&access_token=${ACCESS_TOKEN}`
  const res = await fetch(url)
  return res.json()
}

async function fetchDirections(originLng, originLat, destLng, destLat) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}?geometries=geojson&overview=full&access_token=${ACCESS_TOKEN}`
  const res = await fetch(url)
  return res.json()
}

function formatDuration(seconds) {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)} hr ${mins % 60} min`
}

function formatDistance(meters) {
  const miles = meters / 1609.34
  return `${miles.toFixed(1)} mi`
}

function createMarkerEl(imageUrl) {
  const el = document.createElement('div')
  el.className = 'custom-marker'
  const inner = document.createElement('div')
  inner.className = 'marker-inner'
  const circle = document.createElement('div')
  circle.className = 'marker-circle'
  circle.style.backgroundImage = `url(${imageUrl})`
  const tip = document.createElement('div')
  tip.className = 'marker-tip'
  inner.appendChild(circle)
  inner.appendChild(tip)
  el.appendChild(inner)
  return el
}

function createHomeEl() {
  const el = document.createElement('div')
  el.className = 'home-marker'
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>`
  return el
}

function createDestEl() {
  const el = document.createElement('div')
  el.className = 'dest-marker'
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>`
  return el
}

function Drawer({ feature, hasHome, onClose, onNavigate }) {
  const {
    name, description, imageUrl, category, rating, reviewCount,
    priceRange, openHours, phone, address, tags,
  } = feature

  return (
    <div className="drawer">
      <button className="drawer-close" onClick={onClose}>✕</button>
      <div className="drawer-scroll">
        <img className="drawer-image" src={imageUrl} alt={name} />
        <div className="drawer-body">
          <div className="drawer-meta-row">
            <span className="drawer-category">{category}</span>
            <span className="drawer-price">{priceRange}</span>
          </div>
          <h2 className="drawer-name">{name}</h2>
          <div className="drawer-rating">
            {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
            <span className="drawer-review-count"> {rating} ({reviewCount.toLocaleString()} reviews)</span>
          </div>
          <p className="drawer-description">{description}</p>
          <div className="drawer-tags">
            {tags.map(tag => <span key={tag} className="drawer-tag">{tag}</span>)}
          </div>
          <div className="drawer-details">
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">Hours</span>
              <span>{openHours}</span>
            </div>
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">Phone</span>
              <span>{phone}</span>
            </div>
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">Address</span>
              <span>{address}</span>
            </div>
          </div>
          {hasHome && (
            <button className="nav-btn" onClick={onNavigate}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
              </svg>
              Navigate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function NavigationPreview({ feature, route, onClose }) {
  const { name } = feature
  const { duration, distance } = route

  return (
    <div className="nav-preview">
      {/* Top bar */}
      <div className="nav-preview-header">
        <button className="nav-preview-back" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="nav-preview-title">
          <span className="nav-preview-label">Route preview</span>
          <span className="nav-preview-dest">{name}</span>
        </div>
      </div>

      {/* Bottom card */}
      <div className="nav-preview-card">
        <div className="nav-preview-stats">
          <div className="nav-stat">
            <span className="nav-stat-value">{formatDuration(duration)}</span>
            <span className="nav-stat-label">Drive time</span>
          </div>
          <div className="nav-stat-divider" />
          <div className="nav-stat">
            <span className="nav-stat-value">{formatDistance(distance)}</span>
            <span className="nav-stat-label">Distance</span>
          </div>
        </div>
        <button className="nav-start-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
          Start Navigation
        </button>
      </div>
    </div>
  )
}

function SearchPanel({ onClose, onSelect }) {
  const [value, setValue] = useState('')

  return (
    <div className="search-panel">
      <div className="search-panel-header">
        <button className="search-back" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="search-panel-title">Set home location</span>
      </div>
      <div className="search-box-wrap">
        <SearchBox
          accessToken={ACCESS_TOKEN}
          value={value}
          onChange={setValue}
          onRetrieve={(result) => {
            const feature = result.features[0]
            const [lng, lat] = feature.geometry.coordinates
            onSelect(lng, lat)
          }}
          placeholder="Search an address or place…"
          options={{ proximity: { lng: -81.3792, lat: 28.5383 } }}
          theme={{
            variables: {
              fontFamily: 'inherit',
              fontSize: '14px',
              borderRadius: '10px',
              boxShadow: 'none',
              border: '1.5px solid #e5e5e5',
            },
            cssText: `
              * { text-align: left !important; }
              .suggestions-container {
                border-radius: 10px;
                margin-top: 6px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.12);
                border: 1.5px solid #e5e5e5;
                overflow: hidden;
              }
              .suggestion {
                padding: 11px 14px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
              }
              .suggestion:last-child { border-bottom: none; }
              .suggestion:hover, .suggestion--active { background: #f5f8ff; }
            `,
          }}
        />
      </div>
    </div>
  )
}

function App() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef({})
  const homeMarker = useRef(null)
  const destMarker = useRef(null)
  const homeCoordsRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [hasHome, setHasHome] = useState(false)
  const [navMode, setNavMode] = useState(false)
  const [navRoute, setNavRoute] = useState(null)

  useEffect(() => {
    if (map.current) return
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-81.3792, 28.5383],
      zoom: 11,
    })

    map.current.on('load', () => {
      // Isochrone layers
      map.current.addSource('isochrones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.current.addLayer({
        id: 'isochrone-fill',
        type: 'fill',
        source: 'isochrones',
        paint: {
          'fill-color': '#4a90d9',
          'fill-opacity': ['match', ['get', 'contour'], 10, 0.5, 20, 0.25, 0.3],
        },
      })
      map.current.addLayer({
        id: 'isochrone-line',
        type: 'line',
        source: 'isochrones',
        paint: {
          'line-color': '#4a90d9',
          'line-width': ['match', ['get', 'contour'], 10, 3, 20, 2, 2],
          'line-opacity': 1,
        },
      })

      // Route layers
      map.current.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.current.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#fff', 'line-width': 8 },
      })
      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#3a7bd5', 'line-width': 5 },
      })

      // Attraction markers
      attractions.features.forEach((feature) => {
        const { coordinates } = feature.geometry
        const { imageUrl, id } = feature.properties
        const el = createMarkerEl(imageUrl)
        markersRef.current[id] = el
        el.addEventListener('click', () => {
          Object.values(markersRef.current).forEach(m => m.classList.remove('marker-active'))
          el.classList.add('marker-active')
          setSelected(feature.properties)
        })
        new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(coordinates)
          .addTo(map.current)
      })
    })
  }, [])

  const handleHomeSelect = async (lng, lat) => {
    setSearchOpen(false)
    setHasHome(true)
    homeCoordsRef.current = [lng, lat]

    if (homeMarker.current) {
      homeMarker.current.setLngLat([lng, lat])
    } else {
      homeMarker.current = new mapboxgl.Marker({ element: createHomeEl(), anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map.current)
    }

    map.current.easeTo({ center: [lng, lat], zoom: 11, duration: 600 })
    const data = await fetchIsochrones(lng, lat)
    map.current.getSource('isochrones').setData(data)
  }

  const handleNavigate = async () => {
    const [homeLng, homeLat] = homeCoordsRef.current
    const [destLng, destLat] = attractions.features
      .find(f => f.properties.id === selected.id).geometry.coordinates

    const data = await fetchDirections(homeLng, homeLat, destLng, destLat)
    const route = data.routes[0]

    // Draw route
    map.current.getSource('route').setData({
      type: 'Feature',
      geometry: route.geometry,
    })

    // Destination marker
    if (destMarker.current) {
      destMarker.current.setLngLat([destLng, destLat])
    } else {
      destMarker.current = new mapboxgl.Marker({ element: createDestEl(), anchor: 'bottom' })
        .setLngLat([destLng, destLat])
        .addTo(map.current)
    }

    // Fit map to route
    const coords = route.geometry.coordinates
    const lngs = coords.map(c => c[0])
    const lats = coords.map(c => c[1])
    map.current.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: { top: 80, bottom: 200, left: 40, right: 40 }, duration: 700 }
    )

    setNavRoute({ duration: route.duration, distance: route.distance })
    setNavMode(true)
  }

  const handleNavClose = () => {
    setNavMode(false)
    setNavRoute(null)
    map.current.getSource('route').setData({ type: 'FeatureCollection', features: [] })
    if (destMarker.current) {
      destMarker.current.remove()
      destMarker.current = null
    }
    // Restore map view
    if (homeCoordsRef.current) {
      map.current.easeTo({ center: homeCoordsRef.current, zoom: 11, duration: 500 })
    }
  }

  const handleDrawerClose = () => {
    Object.values(markersRef.current).forEach(m => m.classList.remove('marker-active'))
    setSelected(null)
  }

  return (
    <div className="page">
      <div className="android-frame">
        <div className="android-notch" />
        <div className="android-screen">
          <div ref={mapContainer} className="map" />

          {!navMode && !selected && (
            <button className="search-trigger" onClick={() => setSearchOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>{hasHome ? 'Change home' : 'Set home location'}</span>
            </button>
          )}

          {searchOpen && (
            <SearchPanel
              onClose={() => setSearchOpen(false)}
              onSelect={handleHomeSelect}
            />
          )}

          {selected && !navMode && (
            <Drawer
              feature={selected}
              hasHome={hasHome}
              onClose={handleDrawerClose}
              onNavigate={handleNavigate}
            />
          )}

          {navMode && navRoute && (
            <NavigationPreview
              feature={selected}
              route={navRoute}
              onClose={handleNavClose}
            />
          )}
        </div>
        <div className="android-home-bar" />
      </div>
    </div>
  )
}

export default App
