import type { PropertyType } from '../types/listing'

export const TYPE_LABEL: Record<PropertyType, string> = {
  house: 'House',
  'multi-family': 'Multi-family',
  townhouse: 'Townhouse'
}

/** The "What's special" tag names the building form rather than the use. */
export const TYPE_TAG: Record<PropertyType, string> = {
  house: 'Detached home',
  'multi-family': 'Multi-family',
  townhouse: 'Townhouse'
}
