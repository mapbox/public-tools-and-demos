import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import backIcon from '../../img/icons/arrow-left.svg'
import MaskIcon from '../ui/MaskIcon'

/**
 * The full-screen layout the listing's map and street view open into, as on
 * Zillow: a bar with "Back to listing" over content that fills the screen.
 *
 * Portalled to the body, since the listing sheet's backdrop-filter would
 * otherwise become the containing block for `fixed` and scroll it away.
 * Escape goes back to the listing rather than closing it: the listener runs
 * in the capture phase and stops the event before the sheet's own handler.
 */
export default function FullScreenView({
  title,
  label,
  onBack,
  children
}: {
  title: string
  /** Names the dialog for screen readers, e.g. "Street view". */
  label: string
  onBack: () => void
  children: React.ReactNode
}) {
  const backRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    backRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onBack()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      opener?.focus()
    }
  }, [onBack])

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-label={label}
      className='fixed inset-0 z-[60] flex flex-col bg-white'
    >
      <header className='flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 px-6 max-md:h-14 max-md:px-4'>
        <button
          ref={backRef}
          type='button'
          onClick={onBack}
          className='flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full py-2 pl-2 pr-3 text-base font-bold text-ink transition-colors hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
        >
          <MaskIcon src={backIcon} size={20} />
          Back to listing
        </button>
        <span className='h-6 w-px shrink-0 bg-gray-200 max-md:hidden' />
        <p className='min-w-0 flex-1 truncate text-base font-medium text-ink-muted max-md:hidden'>
          {title}
        </p>
      </header>
      <div className='relative min-h-0 flex-1 bg-surface-sunken'>
        {children}
      </div>
    </div>,
    document.body
  )
}
