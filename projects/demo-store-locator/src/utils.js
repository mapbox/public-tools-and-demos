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
            setDenyLocation(true);
            setIsLoading(false);
          }
        );
      
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
}