import * as Slider from '@radix-ui/react-slider'
import ResetButton from './ResetButton'

interface ParameterSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  onReset?: () => void
  min: number
  max: number
  step: number
  format?: (value: number) => string
}

export default function ParameterSlider({
  label,
  value,
  onChange,
  onReset,
  min,
  max,
  step,
  format = (v) => v.toFixed(2)
}: ParameterSliderProps) {
  return (
    <div>
      <div className='flex justify-between mb-1'>
        <div className='flex items-center gap-1'>
          <label className='text-xs font-medium text-gray-700'>{label}</label>
          {onReset && <ResetButton onReset={onReset} />}
        </div>
        <span className='text-xs text-gray-500'>{format(value)}</span>
      </div>
      <Slider.Root
        className='relative flex items-center select-none touch-none w-full h-4'
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Track className='bg-gray-200 relative grow rounded-full h-1'>
          <Slider.Range className='absolute bg-blue-500 rounded-full h-full' />
        </Slider.Track>
        <Slider.Thumb className='block w-4 h-4 bg-white rounded-full border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm' />
      </Slider.Root>
    </div>
  )
}
