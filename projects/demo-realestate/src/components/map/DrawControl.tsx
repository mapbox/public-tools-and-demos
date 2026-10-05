import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

import pencilIcon from '../../img/icons/pencil.svg'
import MaskIcon from '../ui/MaskIcon'

/**
 * The pencil button that starts drawing an area, and the Figma's banner
 * ("button boundary", state=result) shown while drawing. Like the basemap
 * button, the pencil is portalled into a GL JS control in the top-right stack,
 * and the banner renders where this component does, in the map's wrapper.
 *
 * Results only change on Apply, as on Zillow; Cancel or Escape leaves the map
 * as it was.
 */
export default function DrawControl({
  host,
  drawing,
  hasShape,
  onStart,
  onCancel,
  onApply
}: {
  /** The GL control's element, which the button is portalled into. */
  host: HTMLElement
  drawing: boolean
  /** Whether a finished shape is waiting to be applied. */
  hasShape: boolean
  onStart: () => void
  onCancel: () => void
  onApply: () => void
}) {
  useEffect(() => {
    if (!drawing) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawing, onCancel])

  return (
    <>
      {createPortal(
        <button
          type='button'
          aria-label='Draw an area'
          title='Draw an area'
          aria-pressed={drawing}
          onClick={drawing ? onCancel : onStart}
          className={clsx(
            // GL JS styles control buttons; this only adds the icon and state.
            'flex! items-center justify-center',
            drawing ? 'bg-brand-wash! text-brand' : 'text-ink'
          )}
        >
          <MaskIcon src={pencilIcon} size={18} />
        </button>,
        host
      )}

      {/* Clear of the control stack on the right, and of nothing on the
          left, so it centres over the map on desktop and fills it on a
          phone. Opaque white with the 16px corners of the card and basemap
          menu, rather than the Figma's translucent blue, so it matches the
          rest of what floats on the map. */}
      {drawing && (
        <div className='absolute left-3 right-[54px] top-2.5 z-20 mx-auto flex max-w-[910px] items-center justify-between gap-4 rounded-2xl bg-white p-4 text-base text-ink shadow-[0_1px_4px_rgba(0,0,0,0.18)] max-md:p-3 max-md:text-sm'>
          {/* The Figma's wording, shortened on a phone to fit two lines. */}
          <p className='min-w-0'>
            <span className='font-bold'>Draw a shape</span>
            <span className='max-md:hidden'>
              {' '}
              around the region you would like to live in
            </span>
            <span className='md:hidden'> around where you’d like to live</span>
          </p>
          <div className='flex shrink-0 items-center gap-8 font-medium max-md:gap-4'>
            <button
              type='button'
              onClick={onCancel}
              className='cursor-pointer hover:text-brand'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={onApply}
              disabled={!hasShape}
              className='cursor-pointer hover:text-brand disabled:cursor-default disabled:opacity-40 disabled:hover:text-ink'
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </>
  )
}
