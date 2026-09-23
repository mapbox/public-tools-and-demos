import type { CSSProperties } from 'react'
import clsx from 'clsx'

/**
 * Figma exports each icon with its state's colour baked into the stroke, so the
 * same glyph arrives as a white file for the selected state and a grey one for
 * the rest. Masking paints the unmodified asset in `currentColor` instead, which
 * avoids shipping a near-duplicate file per state.
 */
export default function MaskIcon({
  src,
  size = 16,
  className
}: {
  src: string
  size?: number
  className?: string
}) {
  return (
    <span
      aria-hidden='true'
      className={clsx('mask-icon', className)}
      style={
        {
          width: size,
          height: size,
          '--mask-url': `url("${src}")`
        } as CSSProperties
      }
    />
  )
}
