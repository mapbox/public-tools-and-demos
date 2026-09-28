#!/usr/bin/env node
// Replaces each listing's Kaggle coordinate, and its address, with King
// County's own address point for the parcel.
//
//   node scripts/add-address-points.mjs
//
// The Kaggle data rounds longitude to 3 decimals and latitude to 4. At
// Seattle's latitude 0.001° of longitude is ~75m, so markers landed a lot or
// two from the house, and reverse geocoding those points returned the
// neighbour's address. The Kaggle `id` is the county parcel PIN, and the
// county's address points carry that PIN with a surveyed point on the site
// (a parcel can have several; the one flagged PRIM_ADDR is the primary).
//
// Source: King County GIS, Address/KingCo_AddressPoints (public ArcGIS REST).
// Responses are cached under .address-points-cache/, so re-runs are offline.
//
// The county's address is authoritative, so it replaces the reverse-geocoded
// one. Measured against it, only 49% of the old reverse-geocoded house numbers
// were right. Reverse geocoding the corrected points gets 99% right, and the
// misses name a neighbouring house, so the county text is used wherever there
// is one, reformatted to match the Mapbox style ("15607 NE 62ND CT" becomes
// "15607 Northeast 62nd Court").
//
// Pipeline order: build-listings → add-address-points → geocode-listings
// (which then only fills address where the county had none, plus every
// neighborhood) → add-property-types.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const DATA = 'public/data/listings.json'
const CACHE = '.address-points-cache'
const ENDPOINT =
  'https://gismaps.kingcounty.gov/arcgis/rest/services/Address/KingCo_AddressPoints/MapServer/0/query'
// The service returns at most 1,000 records per query, and a multi-unit parcel
// can have dozens of points, so batches stay well under that.
const BATCH = 100
/** ~0.1m, finer than the county's own survey accuracy. */
const COORD_DP = 6

const DIRECTION = {
  N: 'North', S: 'South', E: 'East', W: 'West',
  NE: 'Northeast', NW: 'Northwest', SE: 'Southeast', SW: 'Southwest'
}
const SUFFIX = {
  AVE: 'Avenue', ST: 'Street', PL: 'Place', CT: 'Court', DR: 'Drive',
  RD: 'Road', LN: 'Lane', BLVD: 'Boulevard', TER: 'Terrace', CIR: 'Circle',
  PKWY: 'Parkway', HWY: 'Highway', WAY: 'Way', LOOP: 'Loop', TRL: 'Trail',
  PT: 'Point', SQ: 'Square', KY: 'Key', RDG: 'Ridge', XING: 'Crossing',
  VW: 'View', LNDG: 'Landing', GRN: 'Green', HL: 'Hill', HTS: 'Heights',
  CV: 'Cove', TRCE: 'Trace', GLN: 'Glen', PLZ: 'Plaza', CRST: 'Crest',
  VIS: 'Vista', BND: 'Bend', LK: 'Lake', PARK: 'Park', ROW: 'Row',
  WALK: 'Walk', RUN: 'Run', PATH: 'Path', MEWS: 'Mews'
}
/** Name prefixes the county abbreviates: "MT BAKER", "ST ANDREWS". */
const PREFIX = { MT: 'Mount', ST: 'Saint' }

const formatAddress = (raw) => {
  const words = raw.trim().split(/\s+/)
  const last = words.length - 1
  return words
    .map((word, i) => {
      if (i === 0) return word.toLowerCase() // "1135B" → "1135b", as Mapbox writes it
      if (DIRECTION[word] && (i === 1 || i === last)) return DIRECTION[word]
      if (SUFFIX[word] && i >= last - 1) return SUFFIX[word]
      if (PREFIX[word]) return PREFIX[word]
      if (/^\d+(ST|ND|RD|TH)$/.test(word)) return word.toLowerCase()
      return word[0] + word.slice(1).toLowerCase()
    })
    .join(' ')
}

const round = (value) => Number(value.toFixed(COORD_DP))
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Haversine distance in metres, for reporting how far listings moved. */
const metres = ([lng1, lat1], [lng2, lat2]) => {
  const rad = Math.PI / 180
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lng2 - lng1) * rad) / 2) ** 2
  return 2 * 6_371_000 * Math.asin(Math.sqrt(a))
}

async function query(pins, attempt = 1) {
  const body = new URLSearchParams({
    where: `PIN IN (${pins.map((pin) => `'${pin}'`).join(',')})`,
    outFields: 'PIN,LAT,LON,PRIM_ADDR,ADDR_FULL',
    returnGeometry: 'false',
    f: 'json'
  })
  const response = await fetch(ENDPOINT, { method: 'POST', body })
  const json = response.ok ? await response.json() : null
  if (json && !json.error) {
    if (json.exceededTransferLimit) throw new Error('batch exceeded the 1,000 record limit')
    return json.features.map((feature) => feature.attributes)
  }
  if (attempt <= 5) {
    const wait = 2 ** attempt * 500
    console.warn(`  ${response.status}; retrying in ${wait}ms (attempt ${attempt})`)
    await sleep(wait)
    return query(pins, attempt + 1)
  }
  throw new Error(`${response.status}: ${JSON.stringify(json?.error ?? '')}`)
}

const collection = JSON.parse(await readFile(DATA, 'utf8'))
const pins = collection.features.map((feature) => feature.properties.id)
await mkdir(CACHE, { recursive: true })

const points = new Map()
const batches = Math.ceil(pins.length / BATCH)
for (let i = 0; i < batches; i++) {
  const file = path.join(CACHE, `batch-${String(i).padStart(3, '0')}.json`)
  const slice = pins.slice(i * BATCH, (i + 1) * BATCH)
  let rows
  // A cached batch is only reused if it was fetched for exactly these PINs.
  if (existsSync(file)) {
    const cached = JSON.parse(await readFile(file, 'utf8'))
    if (cached.pins.join() === slice.join()) rows = cached.rows
  }
  if (!rows) {
    rows = await query(slice)
    await writeFile(file, JSON.stringify({ pins: slice, rows }))
    console.log(`[${i + 1}/${batches}] ${rows.length} points`)
    await sleep(150)
  }
  for (const row of rows) {
    const current = points.get(row.PIN)
    // Prefer the parcel's primary address; otherwise keep the first seen.
    if (!current || (row.PRIM_ADDR === 1 && current.PRIM_ADDR !== 1)) {
      points.set(row.PIN, row)
    }
  }
}

const moved = []
let unmatched = 0
for (const feature of collection.features) {
  const point = points.get(feature.properties.id)
  if (!point || point.LAT == null || point.LON == null) {
    unmatched += 1
    continue
  }
  const next = [round(point.LON), round(point.LAT)]
  moved.push(metres(feature.geometry.coordinates, next))
  feature.geometry.coordinates = next
  if (point.ADDR_FULL) feature.properties.address = formatAddress(point.ADDR_FULL)
}

const out = ['{"type":"FeatureCollection","features":[']
collection.features.forEach((feature, index) => {
  out.push(JSON.stringify(feature) + (index === collection.features.length - 1 ? '' : ','))
})
out.push(']}')
await writeFile(DATA, out.join('\n') + '\n')

moved.sort((a, b) => a - b)
const at = (q) => Math.round(moved[Math.floor(q * (moved.length - 1))])
console.log(
  `updated ${moved.length}/${collection.features.length}; ${unmatched} kept their Kaggle point\n` +
    `moved: median ${at(0.5)}m, p90 ${at(0.9)}m, p99 ${at(0.99)}m, max ${at(1)}m`
)
