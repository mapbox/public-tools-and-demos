#!/usr/bin/env node
// Reverse-geocodes every listing coordinate with the Mapbox Geocoding v6 batch
// endpoint and writes address + neighborhood back into the dataset.
//
//   node scripts/geocode-listings.mjs            # everything
//   node scripts/geocode-listings.mjs --limit 1000
//
// Results are cached per chunk under .geocode-cache/, so a re-run resumes
// rather than re-billing work that already succeeded.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const DATA = 'public/data/listings.json'
const CACHE = '.geocode-cache'
const CHUNK = 1000
const ENDPOINT = 'https://api.mapbox.com/search/geocode/v6/batch'
// The shared token is URL-restricted to this origin; Node sends no Referer of
// its own, so it has to be set explicitly or every request 403s.
const REFERER = 'http://localhost:5173/'

const limitArg = process.argv.indexOf('--limit')
const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity

const env = await readFile('../.env', 'utf8')
const token = env.match(/^VITE_YOUR_MAPBOX_ACCESS_TOKEN=(.+)$/m)?.[1].trim()
if (!token) throw new Error('No VITE_YOUR_MAPBOX_ACCESS_TOKEN in projects/.env')

const raw = await readFile(DATA, 'utf8')
const collection = JSON.parse(raw)
const features = collection.features.slice(0, limit)
console.log(`geocoding ${features.length} of ${collection.features.length} listings`)

await mkdir(CACHE, { recursive: true })
const done = new Set(await readdir(CACHE).catch(() => []))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function postChunk(chunk, attempt = 1) {
  const response = await fetch(`${ENDPOINT}?permanent=true&access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: REFERER },
    body: JSON.stringify(
      chunk.map(([lng, lat]) => ({ types: ['address'], longitude: lng, latitude: lat }))
    )
  })
  if (response.ok) return response.json()
  if ((response.status === 429 || response.status >= 500) && attempt <= 5) {
    const wait = 2 ** attempt * 500
    console.warn(`  ${response.status}; retrying in ${wait}ms (attempt ${attempt})`)
    await sleep(wait)
    return postChunk(chunk, attempt + 1)
  }
  throw new Error(`${response.status}: ${(await response.text()).slice(0, 200)}`)
}

const chunkCount = Math.ceil(features.length / CHUNK)
for (let i = 0; i < chunkCount; i++) {
  const name = `chunk-${String(i).padStart(3, '0')}.json`
  if (done.has(name)) {
    console.log(`[${i + 1}/${chunkCount}] cached`)
    continue
  }
  const slice = features.slice(i * CHUNK, (i + 1) * CHUNK)
  const result = await postChunk(slice.map((f) => f.geometry.coordinates))
  await writeFile(path.join(CACHE, name), JSON.stringify(result))
  console.log(`[${i + 1}/${chunkCount}] ${slice.length} geocoded`)
  await sleep(200)
}

let matched = 0
for (let i = 0; i < chunkCount; i++) {
  const name = `chunk-${String(i).padStart(3, '0')}.json`
  const { batch } = JSON.parse(await readFile(path.join(CACHE, name), 'utf8'))
  batch.forEach((entry, index) => {
    const feature = features[i * CHUNK + index]
    const props = entry.features?.[0]?.properties
    if (!props) return
    const context = props.context ?? {}
    feature.properties.address = context.address?.name ?? props.name
    feature.properties.neighborhood =
      context.neighborhood?.name ?? context.place?.name ?? null
    matched += 1
  })
}

const out = ['{"type":"FeatureCollection","features":[']
collection.features.forEach((feature, index) => {
  out.push(JSON.stringify(feature) + (index === collection.features.length - 1 ? '' : ','))
})
out.push(']}')
await writeFile(DATA, out.join('\n') + '\n')

console.log(`matched ${matched}/${features.length}; wrote ${DATA}`)
