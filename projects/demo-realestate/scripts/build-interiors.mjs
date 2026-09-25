#!/usr/bin/env node
// Downloads the interior photos listed in src/data/interiors.json and writes
// them to public/img/interiors/ as WebP at two widths, for srcset.
//
//   node scripts/build-interiors.mjs
//
// Needs ImageMagick 7 (`magick`) on the PATH. Every photo is CC0 stock found
// via the Openverse API; the manifest keeps each one's source page as a credit.
// Originals are cached under .interiors-cache/, so a re-run only re-encodes.

import { execFile } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'

const run = promisify(execFile)

const MANIFEST = 'src/data/interiors.json'
const CACHE = '.interiors-cache'
const OUT = 'public/img/interiors'
// 480 covers the list-layout thumbnail at 2x; 960 covers the grid card and the
// property card gallery at 2x. Most sources top out at 1024px wide anyway.
const WIDTHS = [480, 960]

const exists = (file) =>
  access(file).then(
    () => true,
    () => false
  )

const photos = JSON.parse(await readFile(MANIFEST, 'utf8'))
await mkdir(CACHE, { recursive: true })
await mkdir(OUT, { recursive: true })

for (const photo of photos) {
  const original = `${CACHE}/${photo.file}.jpg`
  if (!(await exists(original))) {
    const response = await fetch(photo.source)
    if (!response.ok) throw new Error(`${photo.file}: ${response.status}`)
    await writeFile(original, Buffer.from(await response.arrayBuffer()))
  }
  for (const width of WIDTHS) {
    await run('magick', [
      original,
      '-auto-orient',
      '-strip',
      '-resize',
      // `>` only shrinks, so a small source is never upscaled.
      `${width}x>`,
      '-quality',
      '72',
      `${OUT}/${photo.file}-${width}.webp`
    ])
  }
  console.log(photo.file)
}
