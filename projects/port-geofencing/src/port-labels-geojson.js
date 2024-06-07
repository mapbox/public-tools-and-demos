const portLabels = {
  type: 'FeatureCollection',
  crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
  features: [
    {
      type: 'Feature',
      properties: { Name: 'Port of Helsinki' },
      geometry: { type: 'Point', coordinates: [25.187877, 60.216991] }
    },
    {
      type: 'Feature',
      properties: { Name: 'Port of Kotka' },
      geometry: { type: 'Point', coordinates: [26.907769, 60.425167] }
    },
    {
      type: 'Feature',
      properties: { Name: 'Port of Turku' },
      geometry: { type: 'Point', coordinates: [22.201961, 60.441131] }
    },
    {
      type: 'Feature',
      properties: { Name: 'Port of Hamina' },
      geometry: { type: 'Point', coordinates: [27.164052, 60.527659] }
    },
    {
      type: 'Feature',
      properties: { Name: 'Port of Rauma' },
      geometry: { type: 'Point', coordinates: [21.455399, 61.120962] }
    },
    {
      type: 'Feature',
      properties: { Name: 'Port of Pori' },
      geometry: { type: 'Point', coordinates: [21.493214, 61.596604] }
    },
    {
      type: 'Feature',
      properties: { Name: 'Port of Oulu' },
      geometry: { type: 'Point', coordinates: [25.414311, 65.001704] }
    }
  ]
}

export default portLabels
