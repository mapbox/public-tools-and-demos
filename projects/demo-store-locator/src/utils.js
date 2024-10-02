export default function getUserLocation(setActiveLocation, setIsLoading, setDenyLocation) {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setActiveLocation({
              coords: [ position.coords.longitude, position.coords.latitude ],
              type: 'user'
            });
            setIsLoading(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            setIsLoading(false);
            setDenyLocation(true);
          }
        );
      
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
}