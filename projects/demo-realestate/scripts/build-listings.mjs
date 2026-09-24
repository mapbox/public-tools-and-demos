#!/usr/bin/env node
// Converts the Kaggle "House Sales in King County, USA" CSV into the trimmed
// GeoJSON this demo loads at runtime.
//
//   node scripts/build-listings.mjs ~/Downloads/kc_house_data.csv
//
// The CSV is not committed — it is a third-party dataset. Only the generated
// GeoJSON ships, in public/data/ so it stays out of the JS bundle.

import { createWriteStream } from 'node:fs'
import { readFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const source = process.argv[2]
if (!source) {
  console.error('usage: build-listings.mjs <path-to-kc_house_data.csv>')
  process.exit(1)
}

// Deliberately .json, not .geojson: the deploy script derives Content-Type from
// the extension, and .geojson yields application/geo+json, which is not on
// CloudFront's compressible list — it would ship ~6.5MB uncompressed.
const OUT = 'public/data/listings.json'
/** ~1.1m of precision; the source data is no better than this anyway. */
const COORD_DP = 5

const round = (value, dp) => Number(Number(value).toFixed(dp))

// Split on commas outside double quotes — the id, date, floors and zipcode
// columns are quoted in this export.
const splitRow = (line) =>
  line
    .match(/("[^"]*"|[^,]*)(,|$)/g)
    .slice(0, -1)
    .map((cell) => cell.replace(/,$/, '').replace(/^"|"$/g, ''))

const text = await readFile(source, 'utf8')
const [headerLine, ...lines] = text.trim().split('\n')
const header = splitRow(headerLine)
const col = Object.fromEntries(header.map((name, index) => [name, index]))

let skipped = 0
const features = []

for (const line of lines) {
  if (!line.trim()) continue
  const cells = splitRow(line)
  const lng = Number(cells[col.long])
  const lat = Number(cells[col.lat])
  const price = Number(cells[col.price])

  if (!Number.isFinite(lng) || !Number.isFinite(lat) || !price) {
    skipped += 1
    continue
  }

  features.push({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [round(lng, COORD_DP), round(lat, COORD_DP)]
    },
    properties: {
      id: cells[col.id],
      price,
      beds: Number(cells[col.bedrooms]),
      baths: Number(cells[col.bathrooms]),
      area: Number(cells[col.sqft_living]),
      lot: Number(cells[col.sqft_lot]),
      floors: Number(cells[col.floors]),
      waterfront: Number(cells[col.waterfront]) === 1,
      view: Number(cells[col.view]),
      condition: Number(cells[col.condition]),
      grade: Number(cells[col.grade]),
      basement: Number(cells[col.sqft_basement]) > 0,
      built: Number(cells[col.yr_built]),
      renovated: Number(cells[col.yr_renovated]) || null,
      zip: cells[col.zipcode],
      // Source format is 20141013T000000; the time component is always zero.
      sold: cells[col.date].slice(0, 4) + '-' + cells[col.date].slice(4, 6) + '-' + cells[col.date].slice(6, 8)
    }
  })
}

// The CSV is sales records: one property can appear more than once. Keep only
// the most recent sale per id, or the app ends up with duplicate marker keys.
const latest = new Map()
for (const feature of features) {
  const existing = latest.get(feature.properties.id)
  if (!existing || feature.properties.sold > existing.properties.sold) {
    latest.set(feature.properties.id, feature)
  }
}
const unique = [...latest.values()]
console.log(`${features.length} rows -> ${unique.length} unique properties`)
features.length = 0
features.push(...unique)

await mkdir(path.dirname(OUT), { recursive: true })
const out = createWriteStream(OUT)
out.write('{"type":"FeatureCollection","features":[\n')
features.forEach((feature, index) => {
  out.write(JSON.stringify(feature) + (index === features.length - 1 ? '\n' : ',\n'))
})
out.write(']}\n')
await new Promise((resolve) => out.end(resolve))

console.log(`wrote ${features.length} features to ${OUT}${skipped ? ` (skipped ${skipped})` : ''}`)
