export default function getUserLocation(
  setActiveLocation,
  setLoadingUserLocation,
  setDenyLocation
) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setActiveLocation({
          coords: [position.coords.longitude, position.coords.latitude],
          type: 'user'
        })
        setLoadingUserLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setLoadingUserLocation(false)
        setDenyLocation(true)
      }
    )
  } else {
    console.error('Geolocation is not supported by this browser.')
  }
}
