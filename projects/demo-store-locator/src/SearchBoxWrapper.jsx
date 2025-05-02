// This component uses Mapbox Search JS's SearchBox component
// Learn more about the props available at https://docs.mapbox.com/mapbox-search-js/api/react/search/

'use client'

import { useContext } from 'react'
import { SearchBox } from '@mapbox/search-js-react'
import mapboxgl from 'mapbox-gl'
import { AppContext } from './Context/AppContext'
import PropTypes from 'prop-types'

const SearchBoxWrapper = ({ mapInstanceRef }) => {
  // Imported access token from your .env file
  const accessToken = import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN

  const {
    searchValue,
    setSearchValue,
    setSearchResult,
    activeLocation,
    setActiveLocation,
    setFeatures
  } = useContext(AppContext)

  // set the search value as the user types
  const handleSearchChange = (newValue) => {
    setSearchValue(newValue)
  }

  const handleSearchResult = (value) => {
    setFeatures('')
    setActiveLocation({
      coords: value.features[0].geometry.coordinates,
      type: 'search'
    })
    setSearchResult(value)
    return value
  }

  return (
    <SearchBox
      className='w-32 sticky'
      options={{
        types: [
          'postcode',
          'place',
          'locality',
          'neighborhood',
          'street',
          'address'
        ],
        country: 'US'
      }}
      value={searchValue}
      onChange={handleSearchChange}
      accessToken={accessToken}
      mapboxgl={mapboxgl}
      placeholder={
        activeLocation?.type === 'user'
          ? 'Your Location '
          : 'Search for an address, city, zip, etc'
      }
      map={mapInstanceRef.current}
      onRetrieve={handleSearchResult}
      theme={{
        variables: {
          fontFamily: '"Open Sans", sans-serif',
          fontWeight: 300,
          unit: '16px',
          borderRadius: '8px'
        }
      }}
    />
  )
}

export default SearchBoxWrapper

SearchBoxWrapper.propTypes = {
  mapInstanceRef: PropTypes.object
}
