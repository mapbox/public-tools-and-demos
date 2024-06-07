import React, { useState, useEffect } from 'react'
import { Map, FullscreenMapLayout, ExternalLink } from 'mapbox-demo-components'
import mapboxgl from 'mapbox-gl'
import ControlToggleSet from '@mapbox/mr-ui/control-toggle-set'
import ControlSelect from '@mapbox/mr-ui/control-select'

import { getIntersection, getPlaces, fetchIsos, getArea } from './util'
import addSourcesAndLayers from './add-sources-and-layers'

import '@mapbox/mbx-assembly/dist/assembly.js'
import '@mapbox/mbx-assembly/dist/assembly.css'

function App() {
  const mapRef = React.useRef()
  const geocoderRef = React.useRef()

  const [profile, setProfile] = useState('cycling/')
  const [duration, setDuration] = useState('10')
  const [category, setCategory] = useState('cafe')
  const [origins, setOrigins] = useState({
    a: [-97.759458, 30.272055],
    b: [-97.729046, 30.260793]
  })
  const [isos, setIsos] = useState({
    a: {},
    b: {}
  })
  const [message, setMessage] = useState('')
  const [mapLoaded, setMapLoaded] = useState(false)

  // update the marker location after drag
  const updateOrigin = (e, originId) => {
    const { lng, lat } = e.target.getLngLat()
    setOrigins((origins) => {
      return {
        ...origins,
        [originId]: [lng, lat]
      }
    })
  }

  // after the isos are received, update the map and calculate the intersection
  useEffect(() => {
    if (mapLoaded && mapRef.current && Object.keys(isos.a).length !== 0) {
      mapRef.current.getSource('isoA').setData(isos.a)
      mapRef.current.getSource('isoB').setData(isos.b)

      const intersection = getIntersection(isos)

      // Update the message to provide info to the user
      if (intersection) {
        mapRef.current.getSource('intersection').setData(intersection)
        const area = getArea(intersection)
        setMessage('Common Area: about ' + area + ' sq mi')

        getPlaces(intersection, category).then((meetHere) => {
          mapRef.current.getSource('places').setData(meetHere)
          mapRef.current.setLayoutProperty('meet-here', 'icon-image', category)
        })
      } else {
        mapRef.current.getSource('intersection').setData({
          type: 'FeatureCollection',
          features: []
        })
        mapRef.current.getSource('places').setData({
          type: 'FeatureCollection',
          features: []
        })
        setMessage(
          'There is no intersection. Try changing the travel mode or time limit.'
        )
      }
    }
  }, [isos])

  // get new isochrones whenever the markers are moved or any of the inputs are changed
  useEffect(() => {
    getIsos()
  }, [origins, profile, duration, category])

  // Create a popup
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: [0, -8]
  })

  useEffect(() => {
    if (!mapLoaded) return
    const map = mapRef.current

    if (!map.getSource('isoA')) {
      // Add sources and layers for the two isochrones
      addSourcesAndLayers(mapRef.current)

      map.on('mouseenter', 'meet-here', (e) => {
        map.getCanvas().style.cursor = 'pointer'

        const coordinates = e.features[0].geometry.coordinates.slice()
        const description =
          '<strong>' +
          e.features[0].properties.name +
          '</strong><br><span>' +
          e.features[0].properties.address +
          '</span>'

        popup.setLngLat(coordinates).setHTML(description).addTo(map)
      })

      map.on('mouseleave', 'meet-here', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
      })

      // Set up the origin markers and their interactivity
      const originA = new mapboxgl.Marker({
        draggable: true
      })
        .setLngLat(origins.a)
        .on('dragend', (e) => {
          updateOrigin(e, 'a')
        })
        .addTo(map)

      const originB = new mapboxgl.Marker({
        draggable: true
      })
        .setLngLat(origins.b)
        .on('dragend', (e) => {
          updateOrigin(e, 'b')
        })
        .addTo(map)

      geocoderRef.current.on('result', (e) => {
        const [lng, lat] = e.result.geometry.coordinates

        const derivedOriginA = [lng + 0.01, lat + 0.006]
        const derivedOriginB = [lng - 0.01, lat - 0.006]
        setOrigins({
          a: derivedOriginA,
          b: derivedOriginB
        })
        originA.setLngLat(derivedOriginA)
        originB.setLngLat(derivedOriginB)
        getIsos()
      })

      // Once the map is all set up, load some isochrones
      getIsos()
    }
  }, [mapLoaded, origins])

  const getIsos = () => {
    fetchIsos(origins, profile, duration).then((values) => {
      setIsos({
        a: values[0],
        b: values[1]
      })
    })
  }

  return (
    <div className='App h-viewport-full'>
      <FullscreenMapLayout
        headerProps={{
          title: 'Isochrone Intersect Demo'
        }}
        mapComponent={
          <Map
            center={[-97.743849, 30.265174]}
            zoom={13}
            style='mapbox://styles/mapbox/dark-v11'
            addGeocoder
            onMapLoad={() => {
              setMapLoaded(true)
            }}
            ref={mapRef}
            geocoderRef={geocoderRef}
          ></Map>
        }
      >
        <div className='px12 py12 scroll-auto'>
          <h3 className='txt-m txt-bold mb6'>Meet me in the middle</h3>
          <p className='mb12 txt-s'>
            This demonstration uses the{' '}
            <ExternalLink to='https://docs.mapbox.com/api/navigation/isochrone/'>
              Mapbox Isochrone API
            </ExternalLink>{' '}
            and the spatial analysis library{' '}
            <ExternalLink to='https://turfjs.org/'>turf.js</ExternalLink> to
            identify areas of overlap when traveling for a given time period
            from two nearby points. Once the overlap area is established, the{' '}
            <ExternalLink to='https://docs.mapbox.com/api/search/geocoding/'>
              Mapbox Geocoding API
            </ExternalLink>{' '}
            is used to find nearby Points of Interest (Cafes, Restautants, or
            Bars) that would serve as a suitable &quot;meet-in-the-middle&quot;
            location.
          </p>

          <p className='mb12 txt-s'>
            Drag the markers to view the results for different locations, and
            try changing the mode of travel, duration, and type of place using
            the controls below. Searching for a location will automatically set
            the markers to two nearby points.
          </p>
          <form id='params'>
            <div>
              <label
                className='inline-block txt-s txt-bold mb6'
                role='label'
                id='radix-:r1:'
              >
                Choose a travel mode{' '}
              </label>
            </div>
            <ControlToggleSet
              id='profile'
              value={profile}
              onChange={(value) => {
                setProfile(value)
              }}
              options={[
                {
                  label: 'Walking',
                  value: 'walking/'
                },
                {
                  label: 'Cycling',
                  value: 'cycling/'
                },
                {
                  label: 'Driving',
                  value: 'driving/'
                }
              ]}
            />
            <div>
              <label
                className='inline-block txt-s txt-bold mb6'
                role='label'
                id='radix-:r1:'
              >
                Choose a maximum duration
              </label>
            </div>
            <ControlToggleSet
              id='duration'
              value={duration}
              onChange={(value) => {
                setDuration(value)
              }}
              options={[
                {
                  label: '10 min',
                  value: '10'
                },
                {
                  label: '20 min',
                  value: '20'
                },
                {
                  label: '30 min',
                  value: '30'
                }
              ]}
            />
            <ControlSelect
              id='category'
              label='Choose a type of place'
              value={category}
              themeControlSelect='select--white bg-blue px12'
              onChange={(value) => {
                setCategory(value)
              }}
              options={[
                {
                  label: 'Cafe',
                  value: 'cafe'
                },
                {
                  label: 'Restaurant',
                  value: 'restaurant'
                },
                {
                  label: 'Bar',
                  value: 'bar'
                }
              ]}
            />
          </form>
          <hr className='txt-hr' />
          <h4 className='txt-m txt-bold mb6' id='msg'>
            {message}
          </h4>
        </div>
      </FullscreenMapLayout>
    </div>
  )
}

export default App
