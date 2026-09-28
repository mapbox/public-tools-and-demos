import type { Listing } from '../types/listing'
import { formatArea, formatLotAdjective, isLargeLot } from './format'
import { seededRandom } from './random'

/**
 * Stands in for the MLS description the dataset does not have. Every claim is
 * read off a real field, so it can be short but never wrong: the phrasing
 * varies per listing, the facts do not. King County's `view` (0–4), `condition`
 * (1–5) and `grade` (1–13, 7 is average) are the assessor's own ratings.
 */

const NOUN = {
  house: 'house',
  townhouse: 'townhouse',
  'multi-family': 'multi-family home'
} as const

const STORIES: Record<number, string> = {
  1: 'on a single level',
  1.5: 'across one and a half stories',
  2: 'across two stories',
  2.5: 'across two and a half stories',
  3: 'across three stories',
  3.5: 'across three and a half stories'
}

/**
 * "a" or "an" by how the figure is spoken: eight, eleven and eighteen open with
 * a vowel sound ("an 8,698 ft² lot", "an 11,200 ft² lot"), everything else not.
 */
const article = (figure: string) => {
  const lead = figure.split(/[,.-]/)[0]
  return `${
    /^8/.test(lead) || lead === '11' || lead === '18' ? 'an' : 'a'
  } ${figure}`
}

export const describe = (listing: Listing): string[] => {
  const next = seededRandom(`${listing.id}:description`)
  const pick = <T>(options: T[]) => options[Math.floor(next() * options.length)]

  const noun = listing.type ? NOUN[listing.type] : 'home'
  const place = listing.neighborhood

  // The intro never names the property type: the next sentence does, and
  // "A house in Ballard. This 3-bedroom house…" reads as a template.
  const where = place ? ` in ${place}` : ''
  const intro =
    (listing.grade ?? 0) >= 10
      ? pick([`A standout${where}.`, `Something special${where}.`])
      : (listing.condition ?? 0) >= 4
      ? pick([`Move-in ready${where}.`, `Well cared for${where}.`])
      : place
      ? pick([`Welcome to ${place}.`, `Located in ${place}.`])
      : 'Ready for its next owner.'

  const rooms =
    listing.beds > 0
      ? `${listing.beds}-bedroom, ${listing.baths}-bath`
      : `${listing.baths}-bath`
  const stories = listing.floors ? STORIES[listing.floors] : undefined
  const size =
    `This ${rooms} ${noun} offers ${formatArea(listing.area)} of living space` +
    `${stories ? ` ${stories}` : ''}` +
    `${
      listing.lot
        ? `, set on ${article(formatLotAdjective(listing.lot))} lot`
        : ''
    }.`

  const details: string[] = []

  if (listing.built) {
    details.push(
      listing.renovated
        ? `Built in ${listing.built} and renovated in ${listing.renovated}.`
        : pick([
            `Built in ${listing.built}.`,
            `Originally built in ${listing.built}.`
          ])
    )
  }
  if (listing.waterfront) {
    details.push(
      pick(['It sits right on the water.', 'A waterfront property.'])
    )
  } else if ((listing.view ?? 0) >= 3) {
    details.push(
      listing.view === 4
        ? 'The county rates its view as excellent.'
        : 'The county rates its view as very good.'
    )
  }
  if ((listing.grade ?? 0) >= 10) {
    details.push('Construction and finishes are graded well above average.')
  }
  if (listing.condition === 5) {
    details.push('It has been kept in excellent condition.')
  } else if (listing.condition === 4) {
    details.push('It is in good condition throughout.')
  }
  if (listing.basement) {
    details.push(
      pick([
        'A basement adds room for storage, a workshop or a guest space.',
        'There is a basement for extra space.'
      ])
    )
  }
  if (listing.lot && isLargeLot(listing.lot)) {
    details.push('The lot leaves real room to garden, entertain or expand.')
  }

  return [`${intro} ${size}`, details.join(' ')].filter(Boolean)
}
