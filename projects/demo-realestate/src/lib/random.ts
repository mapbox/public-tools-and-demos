// FNV-1a, then mulberry32. Parcel ids are near-sequential within a
// neighbourhood, so the hash is what stops neighbours getting the same photos
// or the same description.
const seed = (key: string) => {
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 0x01000193)
  }
  return h >>> 0
}

/**
 * A deterministic stream of numbers in [0, 1) for a key. Callers wanting
 * independent streams from one listing salt the key, so adding a draw to one
 * never reshuffles the other.
 */
export const seededRandom = (key: string) => {
  let state = seed(key)
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
