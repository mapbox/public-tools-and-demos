import { useState } from 'react'
import { PlusIcon, TrashIcon, ArrowRightIcon } from '@radix-ui/react-icons'
import type { ColorCorrection } from '../utils/lutUtils'
import ColorCorrectionPopover from './ColorCorrectionPopover'
import IconButton from './IconButton'
import { rgbToHsv, hsvToRgb, rgbToHex } from '../utils/colorUtils'

interface ColorCorrectionPanelProps {
  corrections: ColorCorrection[]
  onChange: (corrections: ColorCorrection[]) => void
  onPickColor: (correctionId: string) => void
}

export default function ColorCorrectionPanel({
  corrections,
  onChange,
  onPickColor
}: ColorCorrectionPanelProps) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)

  const addCorrection = () => {
    const newCorrection: ColorCorrection = {
      id: Date.now().toString(),
      enabled: true,
      targetColor: { r: 0.5, g: 0.5, b: 0.5 },
      tolerance: 0.3,
      adjustments: {
        hueShift: 0,
        saturationShift: 0,
        valueShift: 0,
        brightnessShift: 0
      }
    }
    onChange([...corrections, newCorrection])
    setOpenPopoverId(newCorrection.id)
  }

  const removeCorrection = (id: string) => {
    onChange(corrections.filter((c) => c.id !== id))
    if (openPopoverId === id) setOpenPopoverId(null)
  }

  const updateCorrection = (id: string, updates: Partial<ColorCorrection>) => {
    onChange(corrections.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const calculateOutputColor = (correction: ColorCorrection) => {
    const { r, g, b } = correction.targetColor
    const { hueShift, saturationShift, valueShift, brightnessShift } =
      correction.adjustments

    let [h, s, v] = rgbToHsv(r, g, b)
    h = (h + hueShift / 360) % 1
    if (h < 0) h += 1
    s = Math.max(0, Math.min(1, s + saturationShift))
    v = Math.max(0, Math.min(1, v + valueShift))

    let [outR, outG, outB] = hsvToRgb(h, s, v)
    const brightnessMult = 1 + brightnessShift
    outR = Math.max(0, Math.min(1, outR * brightnessMult))
    outG = Math.max(0, Math.min(1, outG * brightnessMult))
    outB = Math.max(0, Math.min(1, outB * brightnessMult))

    return { r: outR, g: outG, b: outB }
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-gray-700'>
          Color Corrections
        </h3>
        <button
          onClick={addCorrection}
          className='flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors'
        >
          <PlusIcon className='w-3 h-3' />
          Add
        </button>
      </div>

      {corrections.length === 0 && (
        <p className='text-xs text-gray-500 italic'>
          No color corrections yet. Click &ldquo;Add&rdquo; to create one.
        </p>
      )}

      <div className='space-y-2'>
        {corrections.map((correction) => {
          const outputColor = calculateOutputColor(correction)
          return (
            <ColorCorrectionPopover
              key={correction.id}
              correction={correction}
              onChange={(updates) => updateCorrection(correction.id, updates)}
              onPickColor={() => onPickColor(correction.id)}
              open={openPopoverId === correction.id}
              onOpenChange={(open) =>
                setOpenPopoverId(open ? correction.id : null)
              }
            >
              <div className='bg-gray-100 rounded-lg p-3 flex items-center justify-between hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200'>
                <div className='flex items-center gap-2'>
                  <div
                    className='w-8 h-8 rounded border border-gray-300'
                    style={{
                      backgroundColor: rgbToHex(
                        correction.targetColor.r,
                        correction.targetColor.g,
                        correction.targetColor.b
                      )
                    }}
                  />
                  <ArrowRightIcon className='w-4 h-4 text-gray-500' />
                  <div
                    className='w-8 h-8 rounded border border-gray-300'
                    style={{
                      backgroundColor: rgbToHex(
                        outputColor.r,
                        outputColor.g,
                        outputColor.b
                      )
                    }}
                  />
                  <span className='text-sm ml-2 text-gray-700'>
                    Color Correction
                  </span>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <IconButton onClick={() => removeCorrection(correction.id)}>
                    <TrashIcon className='w-4 h-4 text-red-500' />
                  </IconButton>
                </div>
              </div>
            </ColorCorrectionPopover>
          )
        })}
      </div>
    </div>
  )
}
