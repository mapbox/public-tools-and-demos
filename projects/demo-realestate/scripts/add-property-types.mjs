#!/usr/bin/env node
// Joins listings to the King County Assessor's parcel extract to recover a real
// property type. The Kaggle `id` is the county PIN (6-digit Major + 4-digit
// Minor), which matches ~99.6% of parcels.
//
// Get the extract (~30MB zipped) from:
//   https://aqua.kingcounty.gov/extranet/assessor/Parcel.zip
// then:
//   node scripts/add-property-types.mjs path/to/EXTR_Parcel.csv
//
// Codes come from LUType 102 in the assessor's EXTR_LookUp.csv. Note the
// extract describes a parcel's use *today*, while these are 2014-15 sales, so a
// handful now read as vacant. Anything not clearly residential is left without
// a type rather than guessed at.

import { readFile, writeFile } from 'node:fs/promises'

const source = process.argv[2]
if (!source) {
  console.error('usage: add-property-types.mjs <path-to-EXTR_Parcel.csv>')
  process.exit(1)
}

const DATA = 'public/data/listings.json'

const TYPE_BY_USE = {
  2: 'house', // Single Family (Res Use/Zone)
  6: 'house', // Single Family (C/I Zone)
  29: 'townhouse', // Townhouse Plat
  3: 'multi-family', // Duplex
  4: 'multi-family', // Triplex
  5: 'multi-family', // 4-Plex
  11: 'multi-family' // Apartment
}

const parcels = await readFile(source, 'latin1')
const [headerLine, ...lines] = parcels.trim().split('\n')
const header = headerLine.split(',').map((h) => h.replace(/^"|"$/g, '').trim())
const iMajor = header.indexOf('Major')
const iMinor = header.indexOf('Minor')
const iUse = header.indexOf('PresentUse')

const useByPin = new Map()
for (const line of lines) {
  const cells = line.split(',')
  const major = cells[iMajor]?.replace(/^"|"$/g, '').trim()
  const minor = cells[iMinor]?.replace(/^"|"$/g, '').trim()
  if (!major || !minor) continue
  useByPin.set(
    major.padStart(6, '0') + minor.padStart(4, '0'),
    Number(cells[iUse]?.replace(/^"|"$/g, '').trim())
  )
}
console.log(`parcels: ${useByPin.size.toLocaleString()}`)

const collection = JSON.parse(await readFile(DATA, 'utf8'))
const counts = {}
let matched = 0

for (const feature of collection.features) {
  const use = useByPin.get(feature.properties.id)
  if (use === undefined) continue
  matched += 1
  const type = TYPE_BY_USE[use]
  if (type) {
    feature.properties.type = type
    counts[type] = (counts[type] ?? 0) + 1
  } else {
    delete feature.properties.type
    counts.untyped = (counts.untyped ?? 0) + 1
  }
}

const out = ['{"type":"FeatureCollection","features":[']
collection.features.forEach((feature, index) => {
  out.push(
    JSON.stringify(feature) +
      (index === collection.features.length - 1 ? '' : ',')
  )
})
out.push(']}')
await writeFile(DATA, out.join('\n') + '\n')

const total = collection.features.length
console.log(`matched ${matched.toLocaleString()} / ${total.toLocaleString()}`)
console.log(counts)
