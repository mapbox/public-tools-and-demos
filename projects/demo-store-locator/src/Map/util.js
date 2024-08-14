import listingsGeojson from '../data/stores.js'

export const getFeatures = () => {
  // only use the first 60 features in the dataset
  return listingsGeojson.features
    .slice(0, 60)
    .map((d, i) => {
      // assign an image url to the feature's properties
      d.properties.imageUrl = `./img/demo-real-estate-popup-${i % 4}.png`
      return d
    })
}
