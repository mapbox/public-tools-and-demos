import listingsGeojson from '../data/starbucks-locations.js'

export const getFeatures = () => {
  // only use the first 60 features in the dataset
  console.log("There are ", listingsGeojson.features.length, "starbucks stores in the US.")
  return listingsGeojson.features
    .slice(0, 300)
    .map((d, i) => {
      // assign an image url to the feature's properties
      d.properties.imageUrl = `./img/demo-real-estate-popup-${i % 4}.png`
      return d
    })
}
