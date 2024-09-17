export default function getUserLocation(setActiveLocation, setDenyLocation) {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setActiveLocation({
              coords: [ position.coords.longitude, position.coords.latitude ],
              type: 'user'
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            setDenyLocation(true);
            
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
}


// export function handlePermission() {
//     console.log("handlePermissions runs")
//     navigator.permissions.query({ name: "geolocation" }).then((result) => {
//       if (result.state === "granted") {
//         //report(result.state);
//         console.log(result.state)
//       } else if (result.state === "prompt") {
//         //report(result.state);
//         console.log(result.state)

//         navigator.geolocation.getCurrentPosition(
//           revealPosition,
//           positionDenied,
//           geoSettings,
//         );
//       } else if (result.state === "denied") {
//         //report(result.state);
//         console.log(result.state)
//       }
//       result.addEventListener("change", () => {
//         //report(result.state);
//         console.log(result.state)

//       });
//     });
//   }