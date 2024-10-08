import { SearchBox } from '@mapbox/search-js-react'
import mapboxgl from 'mapbox-gl'
import { accessToken } from './Map'

export default function SearchBoxWrapper({
  searchValue,
  handleSearchChange,
  handleSearchResult,
  activeLocation,
  mapInstanceRef
}) {
  return (
    <SearchBox
      className='w-32 sticky'
      options={{
        types: ['postcode', 'place', 'locality', 'neighborhood', 'street', 'address'],
        country: 'US'
      }}
      value={searchValue}
      onChange={handleSearchChange}
      accessToken={accessToken}
      mapboxgl={mapboxgl}
      placeholder={activeLocation?.type === 'user' ? 'Your Location ' : 'Search for an address, city, zip, etc'}
      map={mapInstanceRef.current}
      onRetrieve={handleSearchResult}
      theme={{
        variables: {
          fontFamily: '"Open Sans", sans-serif',
          fontWeight: 300,
          unit: '16px',
          borderRadius: '8px',
        }
      }}
    />
  )
}
