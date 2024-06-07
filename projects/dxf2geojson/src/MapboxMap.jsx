import React from 'react'
import mapboxgl from 'mapbox-gl'

class MapboxMap extends React.Component {
  /* TODO:
        - [ ] Allow for change in map style json
        - [ ] Take in a handler for map view changes (keep this component stateless)
        - [ ] Watch lock/unlock prop changes
    */

  constructor(props) {
    super(props)

    this.state = {
      map: undefined
    }
  }

  UNSAFE_componentWillMount() {
    mapboxgl.accessToken = this.props.token
  }
  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.props.id,
      style: this.props.style,
      center: [7.7, 30.5],
      zoom: 1.5,
      hash: true,
      minZoom: 1,
      maxZoom: 27,
      projection: 'mercator'
    })

    map.on('load', () => {
      this.props.onLoad(map)
    })

    map.addControl(new mapboxgl.NavigationControl())

    this.setState({ map: map })
  }
  render() {
    return (
      <div id={this.props.id} className='bg-darken10 w-full h-full absolute'>
        <div className='absolute bottom left z1 px12 z1'>
          <a
            href='https://mapbox.com/about/maps/'
            className='mb-attribution'
            title='Mapbox'
            target='_blank'
            rel='noreferrer'
          ></a>
        </div>
      </div>
    )
  }
}

export default MapboxMap
