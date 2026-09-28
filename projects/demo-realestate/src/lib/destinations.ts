/**
 * A destination's letter and colour are fixed by its position, and shared by
 * its Travel Times row, its map marker and its route line, so all three always
 * read as the same place. Hex values match the theme tokens named alongside;
 * GL JS paint properties need the raw colour, Tailwind needs the class.
 */
export const DESTINATION_STYLES = [
  { hex: '#007a43', className: 'bg-success-dark' },
  { hex: '#ca6800', className: 'bg-accent-dark' },
  { hex: '#7b4db1', className: 'bg-violet' }
] as const

export const MAX_DESTINATIONS = DESTINATION_STYLES.length

export const destinationLetter = (index: number) =>
  String.fromCharCode(65 + index)
