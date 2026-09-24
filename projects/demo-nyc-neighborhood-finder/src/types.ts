export const NEIGHBORHOOD_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f97316', // orange
  '#a855f7', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#ca8a04', // amber
]

export type RecommendedNeighborhood = {
  name: string
  borough: string
  reason: string
  color: string
  // Enriched from GeoJSON after matching
  summary?: string
  wikipedia_url?: string
  slug?: string
}

// Raw shape from GeoJSON properties
export type NeighborhoodFeatureProps = {
  name: string
  borough: string
  summary?: string
  wikipedia_url?: string
  slug?: string
  color: number
  kind: string
}
