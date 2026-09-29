import { useState, useMemo } from 'react'
import { CopyIcon, DownloadIcon } from '@radix-ui/react-icons'
import { Header } from 'mapbox-demo-components'
import ColorCurve from './ColorCurve'
import ColorWheel from './components/ColorWheel'
import ParameterSlider from './components/ParameterSlider'
import ColorCorrectionPanel from './components/ColorCorrectionPanel'
import Map from './components/Map'
import type { Point } from './utils/colorUtils'
import { generateLUT, type ColorCorrection } from './utils/lutUtils'
import './App.css'

const DEFAULT_CURVE_POINTS: Point[] = [
  { x: 0, y: 0 },
  { x: 0.25, y: 0.25 },
  { x: 0.5, y: 0.5 },
  { x: 0.75, y: 0.75 },
  { x: 1, y: 1 }
]

function LUTButtons({
  onDownload,
  onCopy
}: {
  onDownload: () => void
  onCopy: () => void
}) {
  return (
    <div className='flex gap-2'>
      <button
        onClick={onDownload}
        className='flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors border border-gray-200'
      >
        <DownloadIcon className='w-3 h-3' />
        Download (PNG)
      </button>
      <button
        onClick={onCopy}
        className='flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors border border-gray-200'
      >
        <CopyIcon className='w-3 h-3' />
        Copy (Base64 String)
      </button>
    </div>
  )
}

function App() {
  const [exposure, setExposure] = useState(0)
  const [brightness, setBrightness] = useState(1)
  const [contrast, setContrast] = useState(1)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(1)
  const [value, setValue] = useState(1)
  const [vibrancy, setVibrancy] = useState(0)
  const [crossProcess, setCrossProcess] = useState(0)

  const [lift, setLift] = useState({ x: 0, y: 0 })
  const [gamma, setGamma] = useState({ x: 0, y: 0 })
  const [gain, setGain] = useState({ x: 0, y: 0 })
  const liftStrength = 1
  const gammaStrength = 1
  const gainStrength = 1

  const [colorCorrections, setColorCorrections] = useState<ColorCorrection[]>(
    []
  )
  const [pickingColorForId, setPickingColorForId] = useState<string | null>(
    null
  )

  const [redCurve, setRedCurve] = useState<Point[]>([...DEFAULT_CURVE_POINTS])
  const [greenCurve, setGreenCurve] = useState<Point[]>([
    ...DEFAULT_CURVE_POINTS
  ])
  const [blueCurve, setBlueCurve] = useState<Point[]>([...DEFAULT_CURVE_POINTS])

  // Generate LUT when sliders or curves change
  const lutBase64 = useMemo(() => {
    return generateLUT({
      exposure,
      brightness,
      contrast,
      hue,
      saturation,
      value,
      vibrancy,
      crossProcess,
      redCurve,
      greenCurve,
      blueCurve,
      lift,
      liftStrength,
      gamma,
      gammaStrength,
      gain,
      gainStrength,
      colorCorrections
    })
  }, [
    exposure,
    brightness,
    contrast,
    hue,
    saturation,
    value,
    vibrancy,
    crossProcess,
    redCurve,
    greenCurve,
    blueCurve,
    lift,
    gamma,
    gain,
    colorCorrections
  ])

  const copyLUTToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(lutBase64)
      console.log('LUT copied to clipboard')
    } catch (err) {
      console.error('Failed to copy LUT:', err)
    }
  }

  const downloadLUT = () => {
    const link = document.createElement('a')
    link.href = lutBase64
    link.download = 'lut.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleColorPicked = (color: { r: number; g: number; b: number }) => {
    if (pickingColorForId) {
      setColorCorrections((corrections) =>
        corrections.map((c) =>
          c.id === pickingColorForId ? { ...c, targetColor: color } : c
        )
      )
      setPickingColorForId(null)
    }
  }

  return (
    <div className='flex flex-col h-screen w-screen'>
      {/* Shared header with Mapbox branding */}
      <Header
        title='Mapbox Standard Style Theme Editor'
        githubLink='https://github.com/mapbox/public-tools-and-demos/tree/main/projects/standard-style-theme-editor'
      />

      {/* Content: on mobile flex-col (map → controls), on desktop flex-row (sidebar | map) */}
      <div className='flex flex-col md:flex-row flex-1 overflow-hidden'>
        {/* Map — mobile: 30vh, order-first; desktop: flex-1, order-last */}
        <div className='h-[30vh] md:h-auto md:flex-1 relative order-first md:order-last flex-shrink-0'>
          <Map
            lutBase64={lutBase64}
            isPickingColor={pickingColorForId !== null}
            onColorPicked={handleColorPicked}
          />

          {/* Desktop floating LUT Preview (hidden on mobile) */}
          {lutBase64 && (
            <div className='hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[500px]'>
              <h2 className='text-xs font-semibold mb-2 text-gray-700'>
                LUT Preview
              </h2>
              <img
                src={lutBase64}
                alt='LUT Preview'
                className='w-full border border-gray-200 rounded mb-3'
                style={{ imageRendering: 'pixelated' }}
              />
              <p className='text-xs text-gray-500 mb-3'>
                You can download your custom LUT as a PNG to use in Mapbox
                Studio, or copy the Base64 string to use directly in your Mapbox
                GL JS or Mobile Maps SDK projects.
              </p>
              <div className='mt-2'>
                <LUTButtons
                  onDownload={downloadLUT}
                  onCopy={copyLUTToClipboard}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Controls — mobile: order-last, scrollable with bottom padding for fixed bar; desktop: order-first, w-80 */}
        <div className='order-last md:order-first md:w-80 bg-white flex flex-col border-r border-gray-200 flex-1 md:flex-none overflow-hidden'>
          {/* Sidebar header — hidden entirely on mobile */}
          <div className='p-4 border-b border-gray-200'>
            <p className=' text-xs text-gray-500'>
              The Mapbox Standard Style accepts a{' '}
              <a
                href='https://en.wikipedia.org/wiki/3D_lookup_table'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline'
              >
                Look-Up Table
              </a>{' '}
              (LUT) to apply complex color transformations. Use the controls
              below to adjust various parameters and see how the LUT affects the
              map in real-time.
            </p>
          </div>

          {/* Scrollable Controls — extra bottom padding on mobile for fixed LUT bar */}
          <div className='flex-1 overflow-y-auto p-4 pb-36 md:pb-4'>
            <div className='space-y-2'>
              <ParameterSlider
                label='Exposure'
                value={exposure}
                onChange={setExposure}
                onReset={() => setExposure(0)}
                min={-2}
                max={2}
                step={0.1}
              />

              <ParameterSlider
                label='Brightness'
                value={brightness}
                onChange={setBrightness}
                onReset={() => setBrightness(1)}
                min={0.25}
                max={1.75}
                step={0.01}
              />

              <ParameterSlider
                label='Contrast'
                value={contrast}
                onChange={setContrast}
                onReset={() => setContrast(1)}
                min={-2}
                max={4}
                step={0.1}
              />

              <ParameterSlider
                label='Hue'
                value={hue}
                onChange={setHue}
                onReset={() => setHue(0)}
                min={-180}
                max={180}
                step={1}
                format={(v) => `${v.toFixed(0)}°`}
              />

              <ParameterSlider
                label='Saturation'
                value={saturation}
                onChange={setSaturation}
                onReset={() => setSaturation(1)}
                min={0}
                max={2}
                step={0.1}
              />

              <ParameterSlider
                label='Value'
                value={value}
                onChange={setValue}
                onReset={() => setValue(1)}
                min={0}
                max={2}
                step={0.1}
              />

              <ParameterSlider
                label='Vibrancy'
                value={vibrancy}
                onChange={setVibrancy}
                onReset={() => setVibrancy(0)}
                min={0}
                max={2}
                step={0.1}
              />

              <ParameterSlider
                label='Cross Process'
                value={crossProcess}
                onChange={setCrossProcess}
                onReset={() => setCrossProcess(0)}
                min={0}
                max={1}
                step={0.1}
              />

              {/* Color Curves */}
              <div className='mt-6 space-y-3'>
                <h3 className='text-sm font-semibold text-gray-700'>
                  Color Curves
                </h3>
                <ColorCurve
                  color='#ef4444'
                  label='Red'
                  points={redCurve}
                  onChange={setRedCurve}
                  onReset={() => setRedCurve([...DEFAULT_CURVE_POINTS])}
                />
                <ColorCurve
                  color='#22c55e'
                  label='Green'
                  points={greenCurve}
                  onChange={setGreenCurve}
                  onReset={() => setGreenCurve([...DEFAULT_CURVE_POINTS])}
                />
                <ColorCurve
                  color='#3b82f6'
                  label='Blue'
                  points={blueCurve}
                  onChange={setBlueCurve}
                  onReset={() => setBlueCurve([...DEFAULT_CURVE_POINTS])}
                />
              </div>

              {/* Color Wheels */}
              <div className='mt-6 space-y-3'>
                <h3 className='text-sm font-semibold text-gray-700'>
                  Color Wheels
                </h3>
                <div className='flex gap-3'>
                  <ColorWheel
                    label='Lift'
                    offset={lift}
                    onChange={setLift}
                    onReset={() => setLift({ x: 0, y: 0 })}
                  />
                  <ColorWheel
                    label='Gamma'
                    offset={gamma}
                    onChange={setGamma}
                    onReset={() => setGamma({ x: 0, y: 0 })}
                  />
                </div>
                <div className='flex gap-3'>
                  <ColorWheel
                    label='Gain'
                    offset={gain}
                    onChange={setGain}
                    onReset={() => setGain({ x: 0, y: 0 })}
                  />
                </div>
              </div>

              {/* Color Corrections */}
              <div className='mt-6'>
                <ColorCorrectionPanel
                  corrections={colorCorrections}
                  onChange={setColorCorrections}
                  onPickColor={setPickingColorForId}
                />
              </div>

              {/* Attribution */}
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <p className='text-xs text-gray-500'>
                  Controls inspired by{' '}
                  <a
                    href='https://o-l-l-i.github.io/lut-maker/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:text-blue-500 underline'
                  >
                    https://o-l-l-i.github.io/lut-maker/
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed bottom LUT bar (hidden on desktop) */}
      {lutBase64 && (
        <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-20'>
          <h2 className='text-xs font-semibold mb-2 text-gray-700'>
            LUT Preview
          </h2>
          <img
            src={lutBase64}
            alt='LUT Preview'
            className='w-full border border-gray-200 rounded mb-2'
            style={{ imageRendering: 'pixelated' }}
          />
          <LUTButtons onDownload={downloadLUT} onCopy={copyLUTToClipboard} />
        </div>
      )}
    </div>
  )
}

export default App
