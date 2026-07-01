import { useState, useRef, useEffect } from 'react'
import { USE_CASES } from './useCasesData'

const LIGHT_PRESETS = [
  {
    id: 'dawn',
    label: 'Dawn',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M12 2v8' />
        <path d='m4.93 10.93 1.41 1.41' />
        <path d='M2 18h2' />
        <path d='M20 18h2' />
        <path d='m19.07 10.93-1.41 1.41' />
        <path d='M22 22H2' />
        <path d='m8 6 4-4 4 4' />
        <path d='M16 18a4 4 0 0 0-8 0' />
      </svg>
    )
  },
  {
    id: 'day',
    label: 'Day',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <circle cx='12' cy='12' r='4' />
        <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' />
      </svg>
    )
  },
  {
    id: 'dusk',
    label: 'Dusk',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M12 10v8' />
        <path d='m4.93 10.93 1.41 1.41' />
        <path d='M2 18h2' />
        <path d='M20 18h2' />
        <path d='m19.07 10.93-1.41 1.41' />
        <path d='M22 22H2' />
        <path d='m16 6-4 4-4-4' />
        <path d='M16 18a4 4 0 0 0-8 0' />
      </svg>
    )
  },
  {
    id: 'night',
    label: 'Night',
    icon: (
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
      </svg>
    )
  }
]

const COLOR_THEMES = [
  {
    id: 'default',
    label: 'Default',
    swatches: ['#4264FB', '#F5F5F5', '#A3C4A8']
  },
  { id: 'faded', label: 'Faded', swatches: ['#9BA8C0', '#D5CFC5', '#B8C4B8'] },
  { id: 'monochrome', label: 'Mono', swatches: ['#555', '#999', '#CCC'] },
  { id: 'ocean', label: 'Ocean', swatches: ['#1A6B9E', '#2DB4C0', '#7EC8C8'] },
  { id: 'warm', label: 'Warm', swatches: ['#C67C3A', '#D4A96A', '#8B5E3C'] },
  { id: 'vivid', label: 'Vivid', swatches: ['#FF4D4D', '#4DFF91', '#4D79FF'] }
]

function ControlField({ label, className, children }) {
  return (
    <div className={`tb-field${className ? ` ${className}` : ''}`}>
      <span className='tb-field-label'>{label}</span>
      {children}
    </div>
  )
}

function Dropdown({
  dropdownRef,
  open,
  onToggle,
  trigger,
  children,
  className
}) {
  return (
    <div
      className={`tb-dropdown${className ? ' ' + className : ''}`}
      ref={dropdownRef}
    >
      <button
        className={`tb-dropdown-btn${open ? ' open' : ''}`}
        onClick={onToggle}
      >
        {trigger}
        <svg
          className={`tb-chevron${open ? ' open' : ''}`}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <polyline points='6 9 12 15 18 9' />
        </svg>
      </button>
      {open && <div className='tb-dropdown-menu'>{children}</div>}
    </div>
  )
}

export default function TopBar({
  activeId,
  onSelect,
  lightPreset,
  setLightPreset,
  colorTheme,
  setColorTheme
}) {
  const [openMenu, setOpenMenu] = useState(null)

  const sceneRef = useRef()
  const lightingRef = useRef()
  const themeRef = useRef()

  useEffect(() => {
    if (!openMenu) return
    const refs = { scene: sceneRef, lighting: lightingRef, theme: themeRef }
    const handler = (e) => {
      const ref = refs[openMenu]
      if (ref?.current && !ref.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openMenu])

  const activeScene = USE_CASES.find((u) => u.id === activeId)
  const activeLight = LIGHT_PRESETS.find((p) => p.id === lightPreset)
  const activeTheme = COLOR_THEMES.find((t) => t.id === colorTheme)

  return (
    <div className='top-bar'>
      <ControlField label='Scenes' className='tb-scene-field'>
        <Dropdown
          className='tb-scene-dropdown'
          dropdownRef={sceneRef}
          open={openMenu === 'scene'}
          onToggle={() => setOpenMenu((o) => (o === 'scene' ? null : 'scene'))}
          trigger={
            <>
              <span className='tb-scene-icon'>{activeScene?.icon}</span>
              <span className='tb-scene-label'>{activeScene?.label}</span>
            </>
          }
        >
          {USE_CASES.map((uc) => (
            <button
              key={uc.id}
              className={`tb-menu-item${activeId === uc.id ? ' active' : ''}`}
              onClick={() => {
                onSelect(uc.id)
                setOpenMenu(null)
              }}
            >
              <span className='tb-scene-icon'>{uc.icon}</span>
              <span>{uc.label}</span>
            </button>
          ))}
        </Dropdown>
      </ControlField>

      <div className='tb-divider' />

      <ControlField label='Lighting'>
        <Dropdown
          dropdownRef={lightingRef}
          open={openMenu === 'lighting'}
          onToggle={() =>
            setOpenMenu((o) => (o === 'lighting' ? null : 'lighting'))
          }
          trigger={
            <>
              <span className='tb-preset-icon'>{activeLight?.icon}</span>
              <span className='tb-value'>{activeLight?.label}</span>
            </>
          }
        >
          {LIGHT_PRESETS.map((p) => (
            <button
              key={p.id}
              className={`tb-menu-item${lightPreset === p.id ? ' active' : ''}`}
              onClick={() => {
                setLightPreset(p.id)
                setOpenMenu(null)
              }}
            >
              <span className='tb-preset-icon'>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </Dropdown>
      </ControlField>

      <div className='tb-divider' />

      <ControlField label='Color'>
        <Dropdown
          dropdownRef={themeRef}
          open={openMenu === 'theme'}
          onToggle={() => setOpenMenu((o) => (o === 'theme' ? null : 'theme'))}
          trigger={
            <>
              <span className='tb-swatch'>
                {activeTheme?.swatches.map((c, i) => (
                  <span
                    key={i}
                    className='tb-swatch-dot'
                    style={{ background: c }}
                  />
                ))}
              </span>
              <span className='tb-value'>{activeTheme?.label}</span>
            </>
          }
        >
          {COLOR_THEMES.map((t) => (
            <button
              key={t.id}
              className={`tb-menu-item${colorTheme === t.id ? ' active' : ''}`}
              onClick={() => {
                setColorTheme(t.id)
                setOpenMenu(null)
              }}
            >
              <span className='tb-swatch'>
                {t.swatches.map((c, i) => (
                  <span
                    key={i}
                    className='tb-swatch-dot'
                    style={{ background: c }}
                  />
                ))}
              </span>
              {t.label}
            </button>
          ))}
        </Dropdown>
      </ControlField>
    </div>
  )
}
