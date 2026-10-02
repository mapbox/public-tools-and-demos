import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

import globeIcon from '../../img/icons/globe.svg'
import layersIcon from '../../img/icons/layers.svg'
import moonIcon from '../../img/icons/moon.svg'
import satelliteIcon from '../../img/icons/satellite.svg'
import sunDownIcon from '../../img/icons/sun-down.svg'
import sunUpIcon from '../../img/icons/sun-up.svg'
import sunIcon from '../../img/icons/sun.svg'
import type { LightPreset, MapStyle } from '../../lib/basemap'
import MaskIcon from '../ui/MaskIcon'

const STYLES: { value: MapStyle; label: string; icon: string }[] = [
  { value: 'standard', label: 'Standard', icon: globeIcon },
  { value: 'satellite', label: 'Satellite', icon: satelliteIcon }
]

const PRESETS: { value: LightPreset; label: string; icon: string }[] = [
  { value: 'dawn', label: 'Dawn', icon: sunUpIcon },
  { value: 'day', label: 'Day', icon: sunIcon },
  { value: 'dusk', label: 'Dusk', icon: sunDownIcon },
  { value: 'night', label: 'Night', icon: moonIcon }
]

function Section<T extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string
  options: { value: T; label: string; icon: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className='flex w-full flex-col gap-3'>
      <p className='text-[13px] font-bold text-ink'>{label}</p>
      <div
        role='radiogroup'
        aria-label={label}
        className='flex flex-wrap items-center gap-1'
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type='button'
              role='radio'
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={clsx(
                'flex cursor-pointer items-center gap-1 rounded-full border border-gray-200 py-1.5 pl-1.5 pr-3 text-[13px] font-medium',
                active
                  ? 'bg-surface-inverse text-ink-inverse'
                  : 'bg-surface-sunken text-ink-muted hover:border-line-strong'
              )}
            >
              <MaskIcon
                src={option.icon}
                size={16}
                className={clsx(!active && 'opacity-80')}
              />
              <span className={clsx(!active && 'opacity-80')}>
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * The Figma's layers button and its "Basemap" menu (`basemap-settings-menu`).
 * The button is portalled into `host`, a GL JS control above the zoom
 * buttons. The menu renders where this component does, in the map's wrapper:
 * inside the control, GL's own `.mapboxgl-ctrl-group button` rule would size
 * every chip as a 32px square. Two of the
 * menu's three sections: map style and light preset. The Figma's colour theme
 * section is left out, as the app's own customisation of Standard already
 * sets the theme.
 *
 * Both sections stay open rather than folding away behind the Figma's
 * chevrons; with only two, a closed state would just cost a click.
 *
 * The menu opens to the left, beside the controls rather than below the
 * button as in the Figma, so it does not cover the zoom buttons beneath.
 */
export default function BasemapControl({
  host,
  mapStyle,
  onMapStyleChange,
  lightPreset,
  onLightPresetChange
}: {
  /** The GL control's element, which the button is portalled into. */
  host: HTMLElement
  mapStyle: MapStyle
  onMapStyleChange: (style: MapStyle) => void
  lightPreset: LightPreset
  onLightPresetChange: (preset: LightPreset) => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // The button and the menu live in different parts of the DOM, so a press
  // counts as outside only when it is in neither.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!menuRef.current?.contains(target) && !host.contains(target))
        setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, host])

  return (
    <>
      {createPortal(
        <button
          type='button'
          aria-label='Basemap settings'
          title='Basemap settings'
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={clsx(
            // GL JS styles control buttons; this only adds the icon and state.
            'flex! items-center justify-center text-ink',
            open && 'bg-surface-sunken!'
          )}
        >
          <MaskIcon src={layersIcon} size={18} />
        </button>,
        host
      )}

      {/* Beside the control stack: 10px GL margin, the 32px controls and
          their 2px outline, and a 10px gap. Above the card's Popup. */}
      {open && (
        <div
          ref={menuRef}
          role='dialog'
          aria-label='Basemap'
          className='absolute right-[54px] top-2.5 z-20 flex w-[268px] flex-col items-start gap-3 rounded-2xl bg-white px-4 py-[18px] text-left drop-shadow-[0px_4px_2.5px_rgba(0,0,0,0.1)]'
        >
          <p className='w-full pb-1 text-base font-bold text-ink'>Basemap</p>
          <div className='h-px w-full bg-slate-200' />
          <Section
            label='Map style'
            options={STYLES}
            value={mapStyle}
            onChange={onMapStyleChange}
          />
          <div className='h-px w-full bg-slate-200' />
          <Section
            label='Light preset'
            options={PRESETS}
            value={lightPreset}
            onChange={onLightPresetChange}
          />
        </div>
      )}
    </>
  )
}
