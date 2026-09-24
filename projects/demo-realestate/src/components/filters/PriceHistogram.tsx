import { formatPriceShort } from '../../lib/format'
import {
  PRICE_CEILING,
  PRICE_FLOOR,
  PRICE_STEP,
  isUncapped,
  type PriceRange
} from '../../lib/price'

const percent = (value: number) =>
  ((value - PRICE_FLOOR) / (PRICE_CEILING - PRICE_FLOOR)) * 100

/** Two overlaid native range inputs: keyboard support and a11y come for free. */
const THUMB =
  'pointer-events-none absolute inset-x-0 bottom-0 h-2.5 w-full appearance-none bg-transparent ' +
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-[18px] ' +
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-grab ' +
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border ' +
  '[&::-webkit-slider-thumb]:border-[#eceff5] [&::-webkit-slider-thumb]:bg-white ' +
  '[&::-webkit-slider-thumb]:shadow-[0_0_3.3px_rgba(0,0,0,0.25)] ' +
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-[18px] ' +
  '[&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full ' +
  '[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#eceff5] ' +
  '[&::-moz-range-thumb]:bg-white'

export default function PriceHistogram({
  counts,
  range,
  onChange,
  onCommit
}: {
  counts: number[]
  range: PriceRange
  /** Fires on every drag step — cheap, local feedback only. */
  onChange: (range: PriceRange) => void
  /** Fires once the handle is released, when the filter actually applies. */
  onCommit: () => void
}) {
  const tallest = Math.max(1, ...counts)
  const width = (PRICE_CEILING - PRICE_FLOOR) / counts.length

  return (
    <div className='flex w-[300px] flex-col gap-3 rounded-xl border border-gray-200 bg-surface-sunken px-4 py-3'>
      <div className='flex h-[60px] items-end justify-center gap-[3px]'>
        {counts.map((count, index) => {
          const from = PRICE_FLOOR + index * width
          // Bars outside the selected range read as excluded.
          const included =
            from + width > range.min && (isUncapped(range) || from <= range.max)
          return (
            <span
              key={from}
              title={`${formatPriceShort(from)} – ${formatPriceShort(
                from + width
              )}: ${count.toLocaleString()}`}
              className={`min-w-px flex-1 rounded-t-md ${
                included ? 'bg-brand-tint' : 'bg-line'
              }`}
              style={{
                height: `${Math.max(count && 2, (count / tallest) * 60)}px`
              }}
            />
          )
        })}
      </div>

      <div className='relative h-2.5'>
        <div className='absolute inset-0 rounded-full bg-[#eceff5]' />
        <div
          className='absolute inset-y-0 rounded-full bg-brand'
          style={{
            left: `${percent(range.min)}%`,
            right: `${100 - percent(range.max)}%`
          }}
        />
        <input
          type='range'
          aria-label='Minimum price'
          onPointerUp={onCommit}
          onKeyUp={onCommit}
          min={PRICE_FLOOR}
          max={PRICE_CEILING}
          step={PRICE_STEP}
          value={range.min}
          onChange={(event) =>
            onChange({
              ...range,
              min: Math.min(Number(event.target.value), range.max - PRICE_STEP)
            })
          }
          className={THUMB}
        />
        <input
          type='range'
          aria-label='Maximum price'
          onPointerUp={onCommit}
          onKeyUp={onCommit}
          min={PRICE_FLOOR}
          max={PRICE_CEILING}
          step={PRICE_STEP}
          value={range.max}
          onChange={(event) =>
            onChange({
              ...range,
              max: Math.max(Number(event.target.value), range.min + PRICE_STEP)
            })
          }
          className={THUMB}
        />
      </div>

      <div className='flex items-center justify-between text-sm font-medium text-ink-muted'>
        <span>{formatPriceShort(range.min)}</span>
        <span>
          {isUncapped(range)
            ? `${formatPriceShort(PRICE_CEILING)}+`
            : formatPriceShort(range.max)}
        </span>
      </div>
    </div>
  )
}
