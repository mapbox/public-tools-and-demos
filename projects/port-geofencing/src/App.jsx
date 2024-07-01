import { useRef, useState } from 'react'
import { ExternalLink, FullscreenMapLayout, Map } from 'mapbox-demo-components'
import moment from 'moment'
import numeral from 'numeral'
import LoaderLocal from '@mapbox/mr-ui/loader-local'
import mapboxgl from 'mapbox-gl'
import '@mapbox/mbx-assembly/dist/assembly.js'
import '@mapbox/mbx-assembly/dist/assembly.css'

import { addSourcesAndLayers, finlandDataFetch } from './util.js'
import BoatImage from './boat-image.jsx'
import portBoundaries from './port-boundaries-geojson.js'
import portLabels from './port-labels-geojson.js'
import finlandEezGeojson from './finland-eez-geojson.js'

function App() {
  const mapRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [boatdata, setBoatdata] = useState({})

  const fetchVesselData = async () => {
    // set loading state and await the data
    setLoading(true)
    const vesselGroups = await finlandDataFetch(
      portBoundaries,
      finlandEezGeojson
    )
    setLoading(false)

    // update react state with the vessel counts
    setBoatdata(vesselGroups)
    // update the map sources
    mapRef.current.getSource('allvessels').setData(vesselGroups.total)
  }

  const onMapLoad = async () => {
    // set up map options
    const scale = new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric'
    })
    mapRef.current.addControl(scale)
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current.setMinZoom(3.25)

    // create port sources & layers
    addSourcesAndLayers(mapRef, portBoundaries, portLabels)

    // fetch vessel data, get back
    fetchVesselData()

    // update static sources
    mapRef.current.getSource('finlandeez').setData(finlandEezGeojson)
    mapRef.current.getSource('portLabels').setData(portLabels)

    // change this to longer than 10 seconds when you're done
    setInterval(fetchVesselData, 60000)
  }

  const areas = [
    {
      name: 'Exclusive Economic Zone',
      property: 'eez'
    },
    {
      name: 'Port of Helsinki',
      property: 'helsinki'
    },
    {
      name: 'Port of Kotka',
      property: 'kotka'
    },
    {
      name: 'Port of Turku',
      property: 'turku'
    },
    {
      name: 'Port of Hamina',
      property: 'hamina'
    },
    {
      name: 'Port of Rauma',
      property: 'rauma'
    },
    {
      name: 'Port of Pori',
      property: 'pori'
    },
    {
      name: 'Port of Oulu',
      property: 'oulu'
    }
  ]

  // generate rows for the data table
  const areaRows = areas.map(({ name, property }, i) => {
    let content = '—'

    if (!loading && boatdata[property]) {
      content = boatdata[property].features.length
    }

    return (
      <tr key={i}>
        <td className='py6'>{name}</td>
        <td className='py6'>{content}</td>
      </tr>
    )
  })

  return (
    <div className='App h-viewport-full'>
      <FullscreenMapLayout
        headerProps={{
          title: 'Port Geofencing',
          githubLink:
            'https://github.com/mapbox/public-tools-and-demos/tree/main/projects/port-geofencing'
        }}
        mapComponent={
          <Map
            center={[24.121, 61.865]}
            style='mapbox://styles/mapbox/streets-v12'
            zoom={5.15}
            addNavigationControl={false}
            interactive={true}
            onMapLoad={onMapLoad}
            ref={mapRef}
            projection='globe'
            hash
            addGeocoder
          ></Map>
        }
      >
        <div className='px12 py12 scroll-auto txt-m'>
          <div className='mb6 txt-m'>
            <b>Geofencing with Mapbox</b>
          </div>
          <div className='mb6 txt-s'>
            <b>Geofencing</b> is the process by which points of interest are
            categorized by the area which contains them. For example, when
            sending political solicitations, politicians will often use ZIP code
            geofencing to ensure that mail is sent only to residents of certain
            ZIP codes (that is, ZIP codes in the politician&apos;s
            constituency).
          </div>
          <div className='mb6 txt-s'>
            This example uses{' '}
            <ExternalLink to='https://turfjs.org/'>Turf.js</ExternalLink> and{' '}
            <ExternalLink to='https://docs.mapbox.com/mapbox-gl-js/guides/'>
              Mapbox GL JS
            </ExternalLink>{' '}
            to geofence live data of shipping vessels tracked by{' '}
            <ExternalLink to='https://www.fintraffic.fi/en/vts'>
              Fintraffic&apos;s Vessel Traffic Services
            </ExternalLink>{' '}
            and by the{' '}
            <ExternalLink to='https://www.traficom.fi/en/transport/maritime'>
              Finnish Maritime Administration
            </ExternalLink>
            . Geofencing is used to enumerate vessels by port and to count
            vessels in Finland&apos;s{' '}
            <ExternalLink to='https://en.wikipedia.org/wiki/Exclusive_economic_zone'>
              exclusive economic zone
            </ExternalLink>
            . Port geofences have been provided by{' '}
            <ExternalLink to='https://www.kestrelinsights.com/'>
              Kestrel Insights
            </ExternalLink>
            .
          </div>
          <hr className='txt-hr mb0 mt12'></hr>

          <>
            <div className='flex my6'>
              <div className='flex-child-grow'>
                <div className='txt-m'>
                  <b>Vessels by Area</b>
                </div>
                <div className='txt-xs'>Data updates every 60 seconds.</div>
              </div>
              {loading && (
                <div className='flex flex--center-cross'>
                  <div className='h36 w-full flex flex--center-cross'>
                    <div className='h18 w18 relative'>
                      <LoaderLocal themeLoader='h18 w18' />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <table className='table txt-s mb12'>
              <thead>
                <tr>
                  <th className='py6'>Area</th>
                  <th className='py6'>Vessels</th>
                </tr>
              </thead>
              <tbody>{areaRows}</tbody>
            </table>
            <div className='mb6 txt-xs'>
              Total Vessels Tracked:{' '}
              <b>
                {numeral(
                  boatdata.total ? boatdata.total.features.length : '—'
                ).format('0,0')}
              </b>
            </div>
            <div className='mb6 txt-xs'>
              {loading ? (
                <>Fetching data...</>
              ) : (
                <>
                  Data fetched today at {moment(boatdata.time).format('h:mm a')}
                  .
                </>
              )}
            </div>
          </>
        </div>
      </FullscreenMapLayout>
      <div className='absolute bottom right mx6 my24 px6 py6 none block-ml z4 txt-s txt-bold'>
        <div className='bg-white h-auto-ml hmax-full px12 py12 round-ml scroll-auto shadow-darken25 shadow-none-ml viewport-third'>
          <div className='flex flex--center-cross'>
            <BoatImage color='white'></BoatImage>
            <div className=''>Vessel</div>
          </div>
          <div className='flex flex--center-cross'>
            <BoatImage color='#94b9ff'></BoatImage>
            <div className=''>Vessel within EEZ</div>
          </div>
          <div className='flex flex--center-cross'>
            <BoatImage color='#0000FF'></BoatImage>
            <div className=''>Vessel at Port</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
